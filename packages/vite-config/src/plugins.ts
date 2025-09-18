import type { Plugin } from 'vite'
import type { RecommendedPluginsOptions } from './types.js'
import { RECOMMENDED_PLUGINS } from './constants.js'

/**
 * 动态加载插件
 */
async function loadPlugin(pluginName: string): Promise<any> {
  try {
    const module = await import(pluginName)
    return module.default || module
  } catch (error) {
    console.warn(`Plugin ${pluginName} is not installed. Skipping...`)
    return null
  }
}

/**
 * 创建自动引入插件
 */
export async function createAutoImportPlugin(
  options: RecommendedPluginsOptions['autoImport'] = true
): Promise<Plugin | null> {
  const plugin = await loadPlugin('unplugin-auto-import/vite')
  if (!plugin) return null

  const config = typeof options === 'boolean' 
    ? RECOMMENDED_PLUGINS.autoImport.config
    : { ...RECOMMENDED_PLUGINS.autoImport.config, ...options }

  return plugin(config)
}

/**
 * 创建组件自动引入插件
 */
export async function createComponentsPlugin(
  options: RecommendedPluginsOptions['components'] = true
): Promise<Plugin | null> {
  const plugin = await loadPlugin('unplugin-vue-components/vite')
  if (!plugin) return null

  const config = typeof options === 'boolean'
    ? RECOMMENDED_PLUGINS.components.config
    : { ...RECOMMENDED_PLUGINS.components.config, ...options }

  return plugin(config)
}

/**
 * 创建 UnoCSS 插件
 */
export async function createUnocssPlugin(
  options: RecommendedPluginsOptions['unocss'] = true
): Promise<Plugin | null> {
  const plugin = await loadPlugin('@unocss/vite')
  if (!plugin) return null

  const config = typeof options === 'boolean'
    ? RECOMMENDED_PLUGINS.unocss.config
    : { ...RECOMMENDED_PLUGINS.unocss.config, ...options }

  return plugin(config)
}

/**
 * 创建 ESLint 插件
 */
export async function createEslintPlugin(
  options: RecommendedPluginsOptions['eslint'] = true
): Promise<Plugin | null> {
  const plugin = await loadPlugin('vite-plugin-eslint')
  if (!plugin) return null

  const config = typeof options === 'boolean'
    ? RECOMMENDED_PLUGINS.eslint.config
    : { ...RECOMMENDED_PLUGINS.eslint.config, ...options }

  return plugin(config)
}

/**
 * 创建 Mock 插件
 */
export async function createMockPlugin(
  options: RecommendedPluginsOptions['mock'] = true
): Promise<Plugin | null> {
  const plugin = await loadPlugin('vite-plugin-mock')
  if (!plugin) return null

  const config = typeof options === 'boolean'
    ? RECOMMENDED_PLUGINS.mock.config
    : { ...RECOMMENDED_PLUGINS.mock.config, ...options }

  return plugin.viteMockServe ? plugin.viteMockServe(config) : plugin(config)
}

/**
 * 创建 PWA 插件
 */
export async function createPwaPlugin(
  options: RecommendedPluginsOptions['pwa'] = true
): Promise<Plugin | null> {
  const plugin = await loadPlugin('vite-plugin-pwa')
  if (!plugin) return null

  const config = typeof options === 'boolean'
    ? RECOMMENDED_PLUGINS.pwa.config
    : { ...RECOMMENDED_PLUGINS.pwa.config, ...options }

  return plugin.VitePWA ? plugin.VitePWA(config) : plugin(config)
}

/**
 * 创建所有推荐插件
 */
export async function createRecommendedPlugins(
  options: RecommendedPluginsOptions = {}
): Promise<Plugin[]> {
  const plugins: Plugin[] = []

  // 自动引入插件
  if (options.autoImport !== false) {
    const autoImportPlugin = await createAutoImportPlugin(options.autoImport)
    if (autoImportPlugin) plugins.push(autoImportPlugin)
  }

  // 组件自动引入插件
  if (options.components !== false) {
    const componentsPlugin = await createComponentsPlugin(options.components)
    if (componentsPlugin) plugins.push(componentsPlugin)
  }

  // UnoCSS 插件
  if (options.unocss !== false) {
    const unocssPlugin = await createUnocssPlugin(options.unocss)
    if (unocssPlugin) plugins.push(unocssPlugin)
  }

  // ESLint 插件
  if (options.eslint !== false) {
    const eslintPlugin = await createEslintPlugin(options.eslint)
    if (eslintPlugin) plugins.push(eslintPlugin)
  }

  // Mock 插件
  if (options.mock !== false) {
    const mockPlugin = await createMockPlugin(options.mock)
    if (mockPlugin) plugins.push(mockPlugin)
  }

  // PWA 插件
  if (options.pwa !== false) {
    const pwaPlugin = await createPwaPlugin(options.pwa)
    if (pwaPlugin) plugins.push(pwaPlugin)
  }

  return plugins.filter(Boolean)
}