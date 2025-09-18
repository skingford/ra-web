import type { UserConfig } from 'vite'
import type { ViteConfigOptions } from './types.js'
import { ViteConfigBuilder } from './builder.js'

/**
 * 创建 Vite 配置构建器
 */
export function createViteConfig(options: ViteConfigOptions = {}): ViteConfigBuilder {
  return new ViteConfigBuilder(options)
}

/**
 * 快速创建 React 应用配置
 */
export function createReactConfig(options: ViteConfigOptions = {}): UserConfig {
  return createViteConfig(options).react().build()
}

/**
 * 合并多个配置对象
 */
export function mergeConfigs(...configs: Partial<UserConfig>[]): UserConfig {
  return configs.reduce((merged, config) => ({ ...merged, ...config }), {})
}

/**
 * 深度合并配置对象
 */
export function deepMergeConfigs(target: UserConfig, source: Partial<UserConfig>): UserConfig {
  const result = { ...target }
  
  for (const key in source) {
    const sourceValue = source[key as keyof UserConfig]
    const targetValue = result[key as keyof UserConfig]
    
    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      result[key as keyof UserConfig] = deepMergeConfigs(
        targetValue as UserConfig || {},
        sourceValue as Partial<UserConfig>
      ) as any
    } else {
      result[key as keyof UserConfig] = sourceValue as any
    }
  }
  
  return result
}

/**
 * 验证配置选项
 */
export function validateOptions(options: ViteConfigOptions): void {
  if (options.port && (options.port < 1 || options.port > 65535)) {
    throw new Error('Port must be between 1 and 65535')
  }
  
  if (options.app && !['web', 'admin', 'api'].includes(options.app)) {
    throw new Error('App must be one of: web, admin, api')
  }
  
  if (options.env && !['development', 'production'].includes(options.env)) {
    throw new Error('Env must be one of: development, production')
  }
}