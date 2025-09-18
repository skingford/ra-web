import type { UserConfig } from 'vite'

export interface BaseConfigOptions {
  port?: number
  host?: boolean | string
  open?: boolean
  cors?: boolean
}

/**
 * 基础 Vite 配置
 */
export function createBaseConfig(options: BaseConfigOptions = {}): UserConfig {
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
