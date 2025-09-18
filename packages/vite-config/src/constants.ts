/**
 * 默认端口配置
 */
export const DEFAULT_PORTS = {
  web: 5173,
  admin: 5174,
  api: 3000,
} as const

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  port: 5173,
  host: false,
  open: false,
  cors: true,
  env: 'development' as const,
} as const

/**
 * 支持的插件列表
 */
export const SUPPORTED_PLUGINS = [
  '@vitejs/plugin-react',
  '@vitejs/plugin-vue',
  '@vitejs/plugin-svelte',
] as const

/**
 * 构建目标
 */
export const BUILD_TARGET = 'esnext' as const

/**
 * 压缩器
 */
export const MINIFIER = 'esbuild' as const

/**
 * 常用依赖
 */
export const COMMON_DEPS = ['react', 'react-dom'] as const
