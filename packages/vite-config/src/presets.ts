import type { Presets } from './types.js'
import { DEFAULT_PORTS } from './constants.js'

/**
 * 预设配置
 */
export const presets: Presets = {
  /** Web 应用预设配置 */
  web: {
    app: 'web',
    port: DEFAULT_PORTS.web,
    host: false,
    open: false,
  },
  
  /** Admin 应用预设配置 */
  admin: {
    app: 'admin',
    port: DEFAULT_PORTS.admin,
    host: false,
    open: false,
  },
  
  /** API 应用预设配置 */
  api: {
    app: 'api',
    port: DEFAULT_PORTS.api,
    host: false,
    open: false,
  },
  
  /** 开发环境预设配置 */
  development: {
    env: 'development',
    host: true,
    open: true,
    cors: true,
  },
  
  /** 生产环境预设配置 */
  production: {
    env: 'production',
    host: false,
    open: false,
    cors: false,
  },

  /** 推荐插件预设配置 */
  recommended: {
    recommendedPlugins: {
      autoImport: {
        imports: ['react', 'react-router-dom'],
        dts: true,
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      },
      eslint: {
        cache: false,
        include: ['src/**/*.{ts,tsx,js,jsx}'],
        exclude: ['node_modules'],
      },
      unocss: false, // 默认关闭，避免冲突
    },
  },

  /** 完整功能预设配置 */
  full: {
    recommendedPlugins: {
      autoImport: true,
      components: true,
      unocss: true,
      eslint: true,
      mock: true,
      pwa: false, // PWA 通常需要特殊配置
    },
  },
} as const
