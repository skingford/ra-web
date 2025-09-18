// 类型导出
export type {
  ViteConfigOptions,
  AppType,
  EnvType,
  PresetConfig,
  Presets,
} from './types.js'

// 构建器导出
export { ViteConfigBuilder } from './builder.js'

// 预设配置导出
export { presets } from './presets.js'

// 常量导出
export {
  DEFAULT_PORTS,
  DEFAULT_CONFIG,
  SUPPORTED_PLUGINS,
  BUILD_TARGET,
  MINIFIER,
  COMMON_DEPS,
} from './constants.js'

// 工具函数导出
export {
  createViteConfig,
  createReactConfig,
  mergeConfigs,
  deepMergeConfigs,
  validateOptions,
} from './utils.js'

// Vite 类型重新导出
export type { UserConfig } from 'vite'