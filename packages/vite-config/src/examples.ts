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
      .build()
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
      .build()
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
      .build()
  },
} as const
