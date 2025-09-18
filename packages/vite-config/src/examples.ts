import type { UserConfig } from 'vite'
import { createViteConfig, createReactConfig, presets } from './index.js'

/**
 * 示例配置集合
 */
export const examples = {
  /**
   * 基础 React 应用配置
   */
  basicReact: (): UserConfig => {
    return createReactConfig({
      ...presets.web,
    })
  },

  /**
   * 开发环境配置
   */
  development: (): UserConfig => {
    return createReactConfig({
      ...presets.web,
      ...presets.development,
    })
  },

  /**
   * 生产环境配置
   */
  production: (): UserConfig => {
    return createReactConfig({
      ...presets.web,
      ...presets.production,
    })
  },

  /**
   * 自定义端口配置
   */
  customPort: (port: number): UserConfig => {
    return createViteConfig({
      ...presets.web,
      port,
    })
      .react()
      .buildSync()
  },

  /**
   * 多插件配置
   */
  withPlugins: (plugins: any[]): UserConfig => {
    return createViteConfig({
      ...presets.web,
      plugins,
    })
      .react()
      .buildSync()
  },

  /**
   * 链式配置示例
   */
  chainedConfig: (): UserConfig => {
    return createViteConfig({
      ...presets.admin,
    })
      .react()
      .port(8080)
      .host(true)
      .open(true)
      .cors(true)
      .buildSync()
  },

  /**
   * 推荐插件配置示例
   */
  withRecommendedPlugins: async (): Promise<UserConfig> => {
    return await createViteConfig({
      ...presets.web,
      ...presets.recommended,
    })
      .react()
      .build()
  },

  /**
   * 自定义自动引入配置
   */
  customAutoImport: async (): Promise<UserConfig> => {
    return await createViteConfig({
      ...presets.web,
      recommendedPlugins: {
        autoImport: {
          imports: ['react', 'react-router-dom', 'ahooks'],
          dts: true,
          eslintrc: {
            enabled: true,
            filepath: './.eslintrc-auto-import.json',
            globalsPropValue: true,
          },
        },
        eslint: true,
      },
    })
      .react()
      .build()
  },

  /**
   * 完整功能配置示例
   */
  fullFeatures: async (): Promise<UserConfig> => {
    return await createViteConfig({
      ...presets.web,
      ...presets.full,
    })
      .react()
      .build()
  },
} as const
