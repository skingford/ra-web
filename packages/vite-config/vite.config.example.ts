import { defineConfig } from 'vite'
import { createConfigWithRecommendedPlugins, createViteConfig, presets } from '@pkg/vite-config'

// 示例 1: 使用推荐插件预设
export async function createBasicRecommended() {
  return defineConfig(
    await createConfigWithRecommendedPlugins({
      ...presets.web,
    })
  )
}

// 示例 2: 使用完整预设
export async function createFullFeatures() {
  return defineConfig(
    await createViteConfig({
      ...presets.web,
      ...presets.full,
    })
      .react()
      .build()
  )
}

// 示例 3: 自定义推荐插件配置
export async function createCustomRecommended() {
  return defineConfig(
    await createViteConfig({
      ...presets.web,
      recommendedPlugins: {
        autoImport: {
          imports: [
            'react',                    // 导入所有 React exports
            'react-router-dom',         // 导入所有 react-router-dom exports
            'ahooks',                   // 导入所有 ahooks exports
            {
              'react-query': ['useQuery', 'useMutation'], // 只导入指定的 exports
            },
          ],
          dts: true,
          eslintrc: {
            enabled: true,
            filepath: './.eslintrc-auto-import.json',
            globalsPropValue: true,
          },
        },
        eslint: {
          cache: false,
          include: ['src/**/*.{ts,tsx,js,jsx}'],
          exclude: ['node_modules', 'dist'],
        },
        unocss: {
          shortcuts: {
            'flex-center': 'flex items-center justify-center',
            'flex-col-center': 'flex flex-col items-center justify-center',
            'btn': 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors',
            'btn-primary': 'btn bg-blue-500 hover:bg-blue-600',
            'btn-secondary': 'btn bg-gray-500 hover:bg-gray-600',
          },
          theme: {
            colors: {
              primary: '#3b82f6',
              secondary: '#6b7280',
            },
          },
        },
        mock: {
          mockPath: 'mock',
          localEnabled: true,
          prodEnabled: false,
        },
      },
    })
      .react()
      .build()
  )
}

// 示例 4: 链式 API 配置
export async function createChainedConfig() {
  return defineConfig(
    await createViteConfig(presets.web)
      .react()
      .port(3000)
      .host(true)
      .open(true)
      .autoImport({
        imports: ['react', 'react-router-dom'],
        dts: true,
      })
      .eslint()
      .unocss({
        shortcuts: {
          'container': 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        },
      })
      .build()
  )
}

// 示例 5: 开发环境配置
export async function createDevelopmentConfig() {
  return defineConfig(
    await createViteConfig({
      ...presets.web,
      ...presets.development,
      ...presets.recommended,
    })
      .react()
      .build()
  )
}

// 示例 6: 生产环境配置
export async function createProductionConfig() {
  return defineConfig(
    await createViteConfig({
      ...presets.web,
      ...presets.production,
      recommendedPlugins: {
        autoImport: true,
        eslint: false, // 生产环境关闭 ESLint
        pwa: true,     // 生产环境启用 PWA
      },
    })
      .react()
      .build()
  )
}

// 实际使用的配置文件示例
// vite.config.ts
export default defineConfig(async () => {
  return await createViteConfig({
    ...presets.web,
    ...presets.development,
    recommendedPlugins: {
      autoImport: {
        imports: ['react', 'react-router-dom'],
        dts: true,
      },
      eslint: true,
    },
  })
    .react()
    .build()
})