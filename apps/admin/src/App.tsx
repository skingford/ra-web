import { useEffect } from 'react'
import { AppRouter, preloadCriticalRoutes } from './router'
import { preloadCriticalComponents } from './components/lazy'
import { performanceMonitor, trackBundleSize } from './utils/performance'
import { AccessibilityProvider, SkipLinks, AccessibilityToolbar } from './components/accessibility'
import './styles/accessibility.css'

function App() {
  useEffect(() => {
    // Initialize performance monitoring
    console.log('App 组件渲染中...')
    
    // Track initial bundle size
    trackBundleSize()
    
    // Preload critical routes and components
    preloadCriticalRoutes()
    preloadCriticalComponents()
    
    // Record app initialization metric
    performanceMonitor.recordMetric({
      loadTime: performance.now(),
      renderTime: 0,
      timestamp: Date.now(),
    })

    // Cleanup performance monitor on unmount
    return () => {
      performanceMonitor.disconnect()
    }
  }, [])

  return (
    <AccessibilityProvider>
      <SkipLinks />
      <AppRouter />
      <AccessibilityToolbar />
    </AccessibilityProvider>
  )
}

export default App
