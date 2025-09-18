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
} as const
