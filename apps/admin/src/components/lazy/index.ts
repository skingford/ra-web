// Lazy-loaded components for performance optimization
export { LazyInteractiveCharts } from './LazyInteractiveCharts'
export { LazyDataTable } from './LazyDataTable'
export { LazyFormBuilder } from './LazyFormBuilder'

// Enhanced preload utilities with performance tracking
export const preloadComponents = {
  interactiveCharts: () => import('../widgets/InteractiveCharts'),
  dataTable: () => import('../data/DataTable'),
  formBuilder: () => import('../forms/FormBuilder'),
  // Additional heavy components
  dashboardGrid: () => import('../widgets/DashboardGrid'),
  chartWidget: () => import('../widgets/ChartWidget'),
  metricWidget: () => import('../widgets/MetricWidget'),
  userList: () => import('../users/UserList'),
  userForm: () => import('../users/UserForm'),
  roleAssignment: () => import('../users/RoleAssignment'),
}

// Component preloading strategies based on user behavior
export const preloadStrategies = {
  // Preload on idle for better perceived performance
  onIdle: (componentName: keyof typeof preloadComponents) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadComponents[componentName]())
    } else {
      setTimeout(() => preloadComponents[componentName](), 100)
    }
  },
  
  // Preload on interaction (hover, focus)
  onInteraction: (componentName: keyof typeof preloadComponents) => ({
    onMouseEnter: () => preloadComponents[componentName](),
    onFocus: () => preloadComponents[componentName](),
  }),
  
  // Preload based on viewport intersection
  onViewport: (componentName: keyof typeof preloadComponents, threshold = 0.1) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            preloadComponents[componentName]()
            observer.disconnect()
          }
        })
      },
      { threshold }
    )
    return observer
  },
}

// Intelligent preloading based on user patterns
export const preloadCriticalComponents = () => {
  // Immediate preload for essential components
  preloadComponents.dataTable()
  
  // Staggered preloading to avoid blocking
  setTimeout(() => {
    preloadComponents.formBuilder()
  }, 1500)
  
  // Preload dashboard widgets after initial load
  setTimeout(() => {
    preloadComponents.dashboardGrid()
    preloadComponents.metricWidget()
  }, 3000)
  
  // Preload heavy visualization components
  setTimeout(() => {
    preloadComponents.interactiveCharts()
    preloadComponents.chartWidget()
  }, 5000)
  
  // Preload user management components for admin users
  setTimeout(() => {
    preloadComponents.userList()
    preloadComponents.userForm()
  }, 7000)
}

// Bundle size tracking for lazy components
export const trackComponentBundleSize = () => {
  const componentSizes = new Map<string, number>()
  
  Object.entries(preloadComponents).forEach(([name, loader]) => {
    const start = performance.now()
    loader().then(() => {
      const end = performance.now()
      const loadTime = end - start
      componentSizes.set(name, loadTime)
      console.log(`Component ${name} load time: ${loadTime.toFixed(2)}ms`)
    })
  })
  
  return componentSizes
}