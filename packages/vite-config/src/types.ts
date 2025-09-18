import type { UserConfig } from 'vite'

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
}
