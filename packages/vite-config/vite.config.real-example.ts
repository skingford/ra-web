import { defineConfig } from 'vite'
import { createViteConfig, createConfigWithRecommendedPlugins, presets } from '@pkg/vite-config'

// 方式 1: 最简单的推荐插件配置
export default defineConfig(async () => {
  return await createConfigWithRecommendedPlugins({
    ...presets.web,
  })
})

// 方式 2: 使用预设配置
// export default defineConfig(async () => {
//   return await createViteConfig({
//     ...presets.web,
//     ...presets.recommended,
//   })
//     .react()
//     .build()
// })

// 方式 3: 链式 API 配置
// export default defineConfig(async () => {
//   return await createViteConfig(presets.web)
//     .react()
//     .autoImport({
//       imports: ['react', 'react-router-dom', 'ahooks'],
//       dts: true,
//     })
//     .eslint()
//     .build()
// })

// 方式 4: 完全自定义配置
// export default defineConfig(async () => {
//   return await createViteConfig({
//     ...presets.web,
//     recommendedPlugins: {
//       autoImport: {
//         imports: [
//           'react',
//           'react-router-dom',
//           {
//             'ahooks': ['useRequest', 'useLocalStorageState'],
//             'zustand': ['create'],
//           },
//         ],
//         dts: true,
//         eslintrc: {
//           enabled: true,
//           filepath: './.eslintrc-auto-import.json',
//           globalsPropValue: true,
//         },
//       },
//       eslint: {
//         cache: false,
//         include: ['src/**/*.{ts,tsx,js,jsx}'],
//         exclude: ['node_modules'],
//       },
//       unocss: {
//         shortcuts: {
//           'flex-center': 'flex items-center justify-center',
//           'btn': 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600',
//         },
//       },
//     },
//   })
//     .react()
//     .port(3000)
//     .host(true)
//     .open(true)
//     .build()
// })