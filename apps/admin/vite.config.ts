import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import AutoImport from 'unplugin-auto-import/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize React imports
      jsxImportSource: '@emotion/react',
    }),
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
            'useColorMode',
            'useBreakpointValue',
            'useMediaQuery'
          ],
          'react-router-dom': [
            'useNavigate',
            'useLocation',
            'useParams',
            'useSearchParams'
          ]
        }
      ],
      dts: true,
      eslintrc: {
        enabled: true,
      },
    }),
    // Bundle analyzer - only in analyze mode
    ...(process.env.ANALYZE ? [visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })] : []),
    // PWA for caching and offline support
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Modern Admin Dashboard',
        short_name: 'Admin',
        description: 'A modern admin dashboard built with React and Chakra UI',
        theme_color: '#3182CE',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
        ],
      },
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
        manualChunks: (id) => {
          // Vendor chunks with more granular splitting
          if (id.includes('node_modules')) {
            // React ecosystem - core framework
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-core'
            }
            
            // React router - navigation
            if (id.includes('react-router')) {
              return 'react-router'
            }
            
            // Chakra UI - design system
            if (id.includes('@chakra-ui')) {
              return 'chakra-ui'
            }
            
            // Emotion - styling engine
            if (id.includes('@emotion') || id.includes('framer-motion')) {
              return 'styling'
            }
            
            // Data fetching and state management
            if (id.includes('@tanstack/react-query')) {
              return 'react-query'
            }
            
            if (id.includes('zustand')) {
              return 'zustand'
            }
            
            // Chart libraries - heavy visualization
            if (id.includes('recharts')) {
              return 'recharts'
            }
            
            if (id.includes('chart.js') || id.includes('d3')) {
              return 'charts-heavy'
            }
            
            // Icons - separate for caching
            if (id.includes('react-icons') || id.includes('lucide-react')) {
              return 'icons'
            }
            
            // Export libraries
            if (id.includes('jspdf') || id.includes('xlsx') || id.includes('html2canvas')) {
              return 'export-libs'
            }
            
            // Date utilities
            if (id.includes('date-fns')) {
              return 'date-utils'
            }
            
            // Other vendor libraries
            return 'vendor-misc'
          }
          
          // Application chunks with better organization
          if (id.includes('/pages/')) {
            // Split pages by feature area
            if (id.includes('Dashboard')) {
              return 'page-dashboard'
            }
            if (id.includes('Export') || id.includes('Report')) {
              return 'page-export'
            }
            if (id.includes('Chart') || id.includes('Interactive')) {
              return 'page-charts'
            }
            return 'pages-misc'
          }
          
          // Component chunks by feature
          if (id.includes('/components/widgets/')) {
            return 'widgets'
          }
          
          if (id.includes('/components/data/')) {
            return 'data-components'
          }
          
          if (id.includes('/components/forms/')) {
            return 'form-components'
          }
          
          if (id.includes('/components/auth/')) {
            return 'auth-components'
          }
          
          if (id.includes('/components/users/')) {
            return 'user-components'
          }
          
          if (id.includes('/components/notifications/')) {
            return 'notification-components'
          }
          
          if (id.includes('/components/')) {
            return 'components-shared'
          }
          
          // Utilities and libraries
          if (id.includes('/stores/')) {
            return 'stores'
          }
          
          if (id.includes('/lib/hooks/')) {
            return 'hooks'
          }
          
          if (id.includes('/lib/')) {
            return 'lib-utils'
          }
          
          if (id.includes('/utils/')) {
            return 'utils'
          }
        },
      },
    },
    chunkSizeWarningLimit: 800, // Stricter limit for better performance
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
      },
      mangle: {
        safari10: true,
      },
    },
    // Enable advanced optimizations
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline small assets
    reportCompressedSize: true,
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
