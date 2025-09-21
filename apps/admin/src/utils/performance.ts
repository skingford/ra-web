// Performance monitoring and optimization utilities
import React from 'react'

// Performance metrics interface
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  bundleSize?: number
  memoryUsage?: number
  timestamp: number
}

// Performance observer for monitoring
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private observer: PerformanceObserver | null = null

  constructor() {
    this.initializeObserver()
  }

  private initializeObserver() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            this.recordMetric({
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              timestamp: Date.now(),
            })
          }
        })
      })

      try {
        this.observer.observe({ entryTypes: ['navigation', 'measure'] })
      } catch (error) {
        console.warn('Performance observer not supported:', error)
      }
    }
  }

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0)
    return total / this.metrics.length
  }

  getAverageRenderTime(): number {
    if (this.metrics.length === 0) return 0
    const total = this.metrics.reduce((sum, metric) => sum + metric.renderTime, 0)
    return total / this.metrics.length
  }

  measureComponentRender<T>(
    componentName: string,
    renderFn: () => T
  ): T {
    const startTime = performance.now()
    const result = renderFn()
    const endTime = performance.now()
    
    console.log(`${componentName} render time: ${endTime - startTime}ms`)
    
    return result
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Bundle size tracking
export const trackBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const entries = performance.getEntriesByType('resource')
    const jsEntries = entries.filter(entry => 
      entry.name.includes('.js') && !entry.name.includes('node_modules')
    )
    
    const totalSize = jsEntries.reduce((total, entry) => {
      return total + (entry as any).transferSize || 0
    }, 0)
    
    console.log(`Total JS bundle size: ${(totalSize / 1024).toFixed(2)} KB`)
    return totalSize
  }
  return 0
}

// Memory usage tracking
export const trackMemoryUsage = () => {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
    const memory = (performance as any).memory
    const usage = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    }
    
    console.log('Memory usage:', {
      used: `${(usage.used / 1024 / 1024).toFixed(2)} MB`,
      total: `${(usage.total / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(usage.limit / 1024 / 1024).toFixed(2)} MB`,
    })
    
    return usage
  }
  return null
}

// Component performance wrapper
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const renderStart = performance.now()
    
    React.useEffect(() => {
      const renderEnd = performance.now()
      console.log(`${componentName} total render time: ${renderEnd - renderStart}ms`)
    })
    
    return React.createElement(Component, props)
  })
}

// Lazy loading performance helper
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
) => {
  return React.lazy(async () => {
    const start = performance.now()
    const module = await importFn()
    const end = performance.now()
    
    console.log(`${componentName} lazy load time: ${end - start}ms`)
    return module
  })
}

// Performance testing utilities
export const performanceTest = {
  // Test component render performance
  testRender: async (
    component: React.ReactElement,
    iterations: number = 100
  ) => {
    const times: number[] = []
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now()
      // Simulate render
      await new Promise(resolve => setTimeout(resolve, 0))
      const end = performance.now()
      times.push(end - start)
    }
    
    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      median: times.sort()[Math.floor(times.length / 2)],
    }
  },

  // Test bundle loading performance
  testBundleLoad: async (bundlePath: string) => {
    const start = performance.now()
    try {
      await import(bundlePath)
      const end = performance.now()
      return end - start
    } catch (error) {
      console.error('Bundle load test failed:', error)
      return -1
    }
  },

  // Test memory usage over time
  testMemoryUsage: (duration: number = 10000) => {
    const measurements: any[] = []
    const interval = setInterval(() => {
      const usage = trackMemoryUsage()
      if (usage) {
        measurements.push({
          timestamp: Date.now(),
          ...usage,
        })
      }
    }, 1000)

    setTimeout(() => {
      clearInterval(interval)
      console.log('Memory usage over time:', measurements)
    }, duration)

    return measurements
  },
}

// Performance hooks
export const usePerformanceTracking = (componentName: string) => {
  const [renderTime, setRenderTime] = React.useState<number>(0)
  const renderStart = React.useRef<number>(0)

  React.useLayoutEffect(() => {
    renderStart.current = performance.now()
  })

  React.useEffect(() => {
    const renderEnd = performance.now()
    const time = renderEnd - renderStart.current
    setRenderTime(time)
    
    if (time > 16) { // Warn if render takes longer than 16ms (60fps)
      console.warn(`${componentName} slow render: ${time.toFixed(2)}ms`)
    }
  })

  return { renderTime }
}

// Bundle size configuration for bundlesize package
export const bundleSizeConfig = {
  files: [
    {
      path: 'dist/assets/*.js',
      maxSize: '500kb',
      compression: 'gzip'
    },
    {
      path: 'dist/assets/vendor*.js',
      maxSize: '300kb',
      compression: 'gzip'
    },
    {
      path: 'dist/assets/pages*.js',
      maxSize: '100kb',
      compression: 'gzip'
    }
  ]
}

// Export performance utilities
export default {
  performanceMonitor,
  trackBundleSize,
  trackMemoryUsage,
  withPerformanceTracking,
  createLazyComponent,
  performanceTest,
  usePerformanceTracking,
  bundleSizeConfig,
}