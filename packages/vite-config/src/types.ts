import type { UserConfig } from 'vite'

/**
 * 推荐插件配置选项
 */
export interface RecommendedPluginsOptions {
  /** 自动引入配置 */
  autoImport?: boolean | {
    imports?: (string | Record<string, string[]>)[]
    dts?: boolean
    eslintrc?: {
      enabled?: boolean
      filepath?: string
      globalsPropValue?: boolean
    }
  }
  /** 组件自动引入配置 */
  components?: boolean | {
    dts?: boolean
    resolvers?: any[]
  }
  /** UnoCSS 配置 */
  unocss?: boolean | {
    shortcuts?: Record<string, string>
    theme?: any
  }
  /** ESLint 配置 */
  eslint?: boolean | {
    cache?: boolean
    include?: string[]
    exclude?: string[]
  }
  /** Mock 配置 */
  mock?: boolean | {
    mockPath?: string
    localEnabled?: boolean
    prodEnabled?: boolean
  }
  /** PWA 配置 */
  pwa?: boolean | {
    registerType?: 'autoUpdate' | 'prompt'
    workbox?: any
  }
}

/**
 * Vite 配置选项
 */
export interface ViteConfigOptions {
  /** 端口号 */
  port?: number
  /** 主机地址 */
  host?: boolean | string
  /** 是否自动打开浏览器 */
  open?: boolean
  /** 是否启用 CORS */
  cors?: boolean
  /** 应用类型，用于应用特定配置 */
  app?: 'web' | 'admin' | 'api'
  /** 环境类型 */
  env?: 'development' | 'production'
  /** 自定义插件 */
  plugins?: any[]
  /** 推荐插件配置 */
  recommendedPlugins?: RecommendedPluginsOptions
  /** 额外配置 */
  extra?: Partial<UserConfig>
}

/**
 * 应用类型
 */
export type AppType = 'web' | 'admin' | 'api'

/**
 * 环境类型
 */
export type EnvType = 'development' | 'production'

/**
 * 预设配置类型
 */
export interface PresetConfig {
  app?: AppType
  env?: EnvType
  port?: number
  host?: boolean | string
  open?: boolean
  cors?: boolean
}

/**
 * 预设配置集合
 */
export interface Presets {
  web: PresetConfig
  admin: PresetConfig
  api: PresetConfig
  development: PresetConfig
  production: PresetConfig
  recommended: ViteConfigOptions
  full: ViteConfigOptions
}
