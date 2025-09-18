// 类型导出
export type {
  ViteConfigOptions,
  RecommendedPluginsOptions,
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
  RECOMMENDED_PLUGINS,
  BUILD_TARGET,
  MINIFIER,
  COMMON_DEPS,
} from './constants.js'

// 工具函数导出
export {
  createViteConfig,
  createReactConfig,
  createReactConfigAsync,
  createConfigWithRecommendedPlugins,
  mergeConfigs,
  deepMergeConfigs,
  validateOptions,
} from './utils.js'

// 插件工厂导出
export {
  createAutoImportPlugin,
  createComponentsPlugin,
  createUnocssPlugin,
  createEslintPlugin,
  createMockPlugin,
  createPwaPlugin,
  createRecommendedPlugins,
} from './plugins.js'

// Vite 类型重新导出
export type { UserConfig } from 'vite'