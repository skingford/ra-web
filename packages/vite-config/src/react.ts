import type { UserConfig } from 'vite'

export interface BaseConfigOptions {
  port?: number
  host?: boolean | string
  open?: boolean
  cors?: boolean
}

export interface ReactConfigOptions extends BaseConfigOptions {
  port?: number
  host?: boolean | string
  open?: boolean
  cors?: boolean
}

// 预设配置
export const presets = {
  /**
   * Web 应用预设配置
   */
  web: {
    port: 5173,
    host: false,
    open: false,
  },
  
  /**
   * Admin 应用预设配置
   */
  admin: {
    port: 5174,
    host: false,
    open: false,
  },
  
  /**
   * 开发环境预设配置
   */
  development: {
    host: true,
    open: true,
    cors: true,
  },
  
  /**
   * 生产环境预设配置
   */
  production: {
    host: false,
    open: false,
    cors: false,
  },
} as const

/**
 * 基础 Vite 配置
 */
function createBaseConfig(options: BaseConfigOptions = {}): UserConfig {
  const {
    port = 5173,
    host = false,
    open = false,
    cors = true,
  } = options

  return {
    server: {
      port,
      host,
      open,
      cors,
    },
    preview: {
      port,
      host,
      open,
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  }
}

/**
 * React 应用的 Vite 配置
 */
export function createReactConfig(options: ReactConfigOptions = {}): UserConfig {
  // 动态导入 React 插件，避免在没有安装时出错
  let reactPlugin: any = null
  try {
    reactPlugin = require('@vitejs/plugin-react')
  } catch (e) {
    console.warn('@vitejs/plugin-react not found, skipping React plugin')
  }

  const baseConfig = createBaseConfig(options)

  return {
    ...baseConfig,
    plugins: reactPlugin ? [reactPlugin.default()] : [],
    esbuild: {
      jsx: 'automatic',
    },
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    },
  }
}