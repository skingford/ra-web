import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths"
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    AutoImport({
      imports: [
        'react',
        {
          from: 'react',
          imports: [
            'useState',
            'useEffect',
            'useCallback',
            'useMemo',
            'useRef',
            'useContext',
            'useReducer',
            'useLayoutEffect',
            'useImperativeHandle',
            'useDebugValue',
            'useId',
            'useSyncExternalStore',
            'useTransition',
            'useDeferredValue',
            'useInsertionEffect'
          ]
        }
      ],
      dts: './src/types/auto-imports.d.ts', // 生成类型声明文件到types目录
      eslintrc: {
        enabled: true, // 生成eslint配置
      },
    })
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/variables" as *;
          @use "@/styles/mixins" as *;
        `,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
