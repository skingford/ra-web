import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    AutoImport({
      imports: [
        'react',
        {
          'zustand': ['create'],
          'zustand/middleware': ['persist', 'devtools'],
          '@tanstack/react-query': [
            'useQuery',
            'useMutation',
            'useQueryClient',
            'useInfiniteQuery',
            'useQueries'
          ],
          '@chakra-ui/react': [
            'useToast',
            'useDisclosure',
            'useColorMode',
            'useColorModeValue',
            'useBreakpointValue',
            'useMediaQuery'
          ]
        }
      ],
      dts: true,
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      dts: true,
      resolvers: [
        // Auto import Chakra UI components
        (componentName) => {
          if (componentName.match(/^(Box|Button|Input|Text|Flex|Stack|VStack|HStack|Grid|Container|Heading|Image|Link|List|Modal|Drawer|Menu|Popover|Tooltip|Alert|Badge|Card|Divider|Icon|Spinner|Progress|Skeleton|Table|Tabs|Accordion|Breadcrumb|Pagination|Select|Checkbox|Radio|Switch|Slider|Textarea|FormControl|FormLabel|FormErrorMessage|FormHelperText|InputGroup|InputLeftElement|InputRightElement|NumberInput|PinInput|RangeSlider|Editable|Avatar|AvatarGroup|Tag|Wrap|SimpleGrid|Center|Square|Circle|AspectRatio|Spacer|VisuallyHidden|Show|Hide)$/)) {
            return { name: componentName, from: '@chakra-ui/react' }
          }
        }
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          chakra: ['@chakra-ui/react', '@emotion/react', '@emotion/styled'],
          query: ['@tanstack/react-query'],
          zustand: ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@chakra-ui/react',
      '@tanstack/react-query',
      'zustand',
    ],
  },
})
