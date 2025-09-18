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
 * 推荐的五星级插件配置
 */
export const RECOMMENDED_PLUGINS = {
  autoImport: {
    name: 'unplugin-auto-import',
    config: {
      imports: ['react', 'react-router-dom'] as (string | Record<string, string[]>)[],
      dts: true,
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    },
  },
  components: {
    name: 'unplugin-vue-components',
    config: {
      dts: true,
      resolvers: [],
    },
  },
  unocss: {
    name: '@unocss/vite',
    config: {
      shortcuts: {
        'flex-center': 'flex items-center justify-center',
        'flex-col-center': 'flex flex-col items-center justify-center',
      },
    },
  },
  eslint: {
    name: 'vite-plugin-eslint',
    config: {
      cache: false,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['node_modules'],
    },
  },
  mock: {
    name: 'vite-plugin-mock',
    config: {
      mockPath: 'mock',
      localEnabled: true,
      prodEnabled: false,
    },
  },
  pwa: {
    name: 'vite-plugin-pwa',
    config: {
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    },
  },
} as const

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
