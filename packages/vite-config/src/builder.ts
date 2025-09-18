import type { UserConfig } from 'vite'
import type { ViteConfigOptions } from './types.js'
import { DEFAULT_CONFIG, DEFAULT_PORTS, BUILD_TARGET, MINIFIER, COMMON_DEPS } from './constants.js'

/**
 * Vite 配置构建器
 */
export class ViteConfigBuilder {
  private config: UserConfig = {}
  private options: ViteConfigOptions

  constructor(options: ViteConfigOptions = {}) {
    this.options = {
      ...DEFAULT_CONFIG,
      ...options,
    }
    this.applyDefaults()
  }

  /**
   * 应用默认配置
   */
  private applyDefaults() {
    // 服务器配置
    this.config.server = {
      port: this.options.port,
      host: this.options.host,
      open: this.options.open,
      cors: this.options.cors,
    }

    // 预览配置
    this.config.preview = {
      port: this.options.port,
      host: this.options.host,
      open: this.options.open,
    }

    // 构建配置
    this.config.build = {
      target: BUILD_TARGET,
      minify: MINIFIER,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [...COMMON_DEPS],
          },
        },
      },
    }

    // 依赖优化
    this.config.optimizeDeps = {
      include: [...COMMON_DEPS],
    }

    // 应用特定配置
    this.applyAppSpecificConfig()
  }

  /**
   * 应用特定配置
   */
  private applyAppSpecificConfig() {
    if (this.options.app && DEFAULT_PORTS[this.options.app]) {
      this.config.server!.port = DEFAULT_PORTS[this.options.app]
      this.config.preview!.port = DEFAULT_PORTS[this.options.app]
    }
  }

  /**
   * 添加 React 支持
   */
  react(): this {
    // 动态导入 React 插件
    let reactPlugin: any = null
    try {
      reactPlugin = require('@vitejs/plugin-react')
    } catch (e) {
      console.warn('@vitejs/plugin-react not found, skipping React plugin')
    }

    if (reactPlugin) {
      this.config.plugins = [...(this.config.plugins || []), reactPlugin.default()]
    }

    // ESBuild JSX 配置
    this.config.esbuild = {
      jsx: 'automatic',
    }

    // 开发环境变量
    this.config.define = {
      __DEV__: JSON.stringify(this.options.env === 'development'),
    }

    return this
  }

  /**
   * 设置端口
   */
  port(port: number): this {
    this.options.port = port
    this.config.server!.port = port
    this.config.preview!.port = port
    return this
  }

  /**
   * 设置主机
   */
  host(host: boolean | string): this {
    this.options.host = host
    this.config.server!.host = host
    this.config.preview!.host = host
    return this
  }

  /**
   * 自动打开浏览器
   */
  open(open = true): this {
    this.options.open = open
    this.config.server!.open = open
    this.config.preview!.open = open
    return this
  }

  /**
   * 启用 CORS
   */
  cors(cors = true): this {
    this.options.cors = cors
    this.config.server!.cors = cors
    return this
  }

  /**
   * 添加插件
   */
  plugin(plugin: any): this {
    this.config.plugins = [...(this.config.plugins || []), plugin]
    return this
  }

  /**
   * 合并额外配置
   */
  merge(config: Partial<UserConfig>): this {
    this.config = { ...this.config, ...config }
    return this
  }

  /**
   * 构建最终配置
   */
  build(): UserConfig {
    // 应用额外配置
    if (this.options.extra) {
      this.config = { ...this.config, ...this.options.extra }
    }

    // 应用自定义插件
    if (this.options.plugins) {
      this.config.plugins = [...(this.config.plugins || []), ...this.options.plugins]
    }

    return this.config
  }
}
