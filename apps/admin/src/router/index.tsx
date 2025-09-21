import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Box, Spinner, VStack, Text } from '@chakra-ui/react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { RouteErrorBoundary } from '../components/RouteErrorBoundary'
import { createLazyComponent } from '../utils/performance'

// Enhanced lazy loading with performance tracking
const Dashboard = createLazyComponent(
  () => import('../pages/Dashboard').then(module => ({ default: module.Dashboard })),
  'Dashboard'
)
const SimpleDashboard = createLazyComponent(
  () => import('../pages/SimpleDashboard'),
  'SimpleDashboard'
)
const TestPage = createLazyComponent(
  () => import('../pages/TestPage'),
  'TestPage'
)
const InteractiveChartsDemo = createLazyComponent(
  () => import('../pages/InteractiveChartsDemo'),
  'InteractiveChartsDemo'
)
const ExportReportingDemo = createLazyComponent(
  () => import('../pages/ExportReportingDemo'),
  'ExportReportingDemo'
)
const SimpleExportDemo = createLazyComponent(
  () => import('../pages/SimpleExportDemo'),
  'SimpleExportDemo'
)
const MinimalExportDemo = createLazyComponent(
  () => import('../pages/MinimalExportDemo'),
  'MinimalExportDemo'
)

// Lazy load heavy components
const DataTableDemo = lazy(() => import('../components/data/DataTable').then(module => ({
  default: () => <div>DataTable Demo Component</div>
})))
const FormBuilderDemo = lazy(() => import('../components/forms/FormBuilder').then(module => ({
  default: () => <div>FormBuilder Demo Component</div>
})))

// Loading fallback component
const PageLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minH="400px"
    w="100%"
  >
    <VStack gap={3}>
      <Spinner size="lg" colorScheme="blue" />
      <Text color="gray.600">Loading page...</Text>
    </VStack>
  </Box>
)

// Component loader for smaller components
const ComponentLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minH="200px"
    w="100%"
  >
    <VStack gap={2}>
      <Spinner size="md" colorScheme="blue" />
      <Text fontSize="sm" color="gray.500">Loading component...</Text>
    </VStack>
  </Box>
)

// Layout wrapper with error boundary and admin layout
const Layout = () => (
  <ErrorBoundary>
    <Outlet />
  </ErrorBoundary>
)

// Create router with lazy-loaded routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <TestPage />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'charts',
        element: (
          <Suspense fallback={<PageLoader />}>
            <InteractiveChartsDemo />
          </Suspense>
        ),
      },
      {
        path: 'export',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ExportReportingDemo />
          </Suspense>
        ),
      },
      {
        path: 'export/simple',
        element: (
          <Suspense fallback={<PageLoader />}>
            <SimpleExportDemo />
          </Suspense>
        ),
      },
      {
        path: 'export/minimal',
        element: (
          <Suspense fallback={<PageLoader />}>
            <MinimalExportDemo />
          </Suspense>
        ),
      },
      {
        path: 'data-table',
        element: (
          <Suspense fallback={<ComponentLoader />}>
            <DataTableDemo />
          </Suspense>
        ),
      },
      {
        path: 'form-builder',
        element: (
          <Suspense fallback={<ComponentLoader />}>
            <FormBuilderDemo />
          </Suspense>
        ),
      },
    ],
  },
])

// Router provider component
export const AppRouter = () => <RouterProvider router={router} />

// Enhanced preload utilities for performance optimization
export const preloadRoute = (routeComponent: () => Promise<any>) => {
  // Preload the component when user hovers over navigation
  return routeComponent()
}

// Route preloading strategies
export const routePreloaders = {
  dashboard: () => import('../pages/Dashboard'),
  simpleDashboard: () => import('../pages/SimpleDashboard'),
  charts: () => import('../pages/InteractiveChartsDemo'),
  export: () => import('../pages/ExportReportingDemo'),
  simpleExport: () => import('../pages/SimpleExportDemo'),
  minimalExport: () => import('../pages/MinimalExportDemo'),
}

// Preload critical routes on app initialization with intelligent timing
export const preloadCriticalRoutes = () => {
  // Immediate preload for likely first page
  routePreloaders.simpleDashboard()
  
  // Staggered preloading to avoid blocking initial render
  setTimeout(() => {
    routePreloaders.dashboard()
  }, 1000)
  
  // Preload heavy components after initial interaction
  setTimeout(() => {
    routePreloaders.charts()
  }, 3000)
  
  // Preload export features for power users
  setTimeout(() => {
    routePreloaders.export()
    routePreloaders.simpleExport()
  }, 5000)
}

// Preload on hover for instant navigation
export const preloadOnHover = (routeName: keyof typeof routePreloaders) => {
  return {
    onMouseEnter: () => routePreloaders[routeName](),
    onFocus: () => routePreloaders[routeName](),
  }
}