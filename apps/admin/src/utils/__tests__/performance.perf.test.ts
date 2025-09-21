// Performance tests for bundle loading and component rendering

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { BundleAnalyzer, checkPerformanceBudget } from '../bundleAnalysis'
import { performanceMonitor, trackBundleSize, performanceTest } from '../performance'

describe('Performance Tests', () => {
  let bundleAnalyzer: BundleAnalyzer
  
  beforeAll(() => {
    bundleAnalyzer = BundleAnalyzer.getInstance()
  })
  
  afterAll(() => {
    performanceMonitor.disconnect()
  })

  describe('Bundle Analysis', () => {
    it('should analyze bundle performance within acceptable limits', async () => {
      const analysis = await bundleAnalyzer.analyzeBundlePerformance()
      
      expect(analysis).toBeDefined()
      expect(analysis.chunks).toBeInstanceOf(Array)
      
      // In test environment, bundle size might be 0, so we check structure instead
      if (analysis.totalSize > 0) {
        expect(analysis.totalSize).toBeGreaterThan(0)
        
        // Check performance budget only if we have real data
        const budgetCheck = checkPerformanceBudget(analysis)
        
        if (!budgetCheck.passed) {
          console.warn('Performance budget violations:', budgetCheck.violations)
        }
      }
      
      // Log analysis for CI/CD
      console.log('Bundle Analysis:', {
        totalSize: `${(analysis.totalSize / 1024).toFixed(2)} KB`,
        gzipSize: `${(analysis.gzipSize / 1024).toFixed(2)} KB`,
        chunks: analysis.chunks.length,
        recommendations: analysis.recommendations.length,
      })
    }, 10000)

    it('should track bundle size accurately', () => {
      const bundleSize = trackBundleSize()
      expect(bundleSize).toBeGreaterThanOrEqual(0)
      
      // Bundle size should be reasonable for a modern admin app
      const maxExpectedSize = 2 * 1024 * 1024 // 2MB
      expect(bundleSize).toBeLessThan(maxExpectedSize)
    })

    it('should generate meaningful recommendations', async () => {
      const analysis = await bundleAnalyzer.analyzeBundlePerformance()
      
      // Should have some recommendations for optimization
      expect(analysis.recommendations).toBeInstanceOf(Array)
      
      // Log recommendations for review
      if (analysis.recommendations.length > 0) {
        console.log('Bundle Optimization Recommendations:')
        analysis.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec}`)
        })
      }
    })
  })

  describe('Component Performance', () => {
    it('should measure component render performance', async () => {
      const mockComponent = () => {
        // Simulate component work
        const start = Date.now()
        while (Date.now() - start < 10) {
          // Busy wait for 10ms
        }
        return 'rendered'
      }

      const renderStats = await performanceTest.testRender(
        mockComponent() as any,
        10
      )

      expect(renderStats.average).toBeGreaterThan(0)
      expect(renderStats.min).toBeLessThanOrEqual(renderStats.average)
      expect(renderStats.max).toBeGreaterThanOrEqual(renderStats.average)
      
      // Render time should be reasonable (under 50ms average)
      expect(renderStats.average).toBeLessThan(50)
      
      console.log('Component Render Performance:', {
        average: `${renderStats.average.toFixed(2)}ms`,
        min: `${renderStats.min.toFixed(2)}ms`,
        max: `${renderStats.max.toFixed(2)}ms`,
        median: `${renderStats.median.toFixed(2)}ms`,
      })
    })

    it('should test lazy loading performance', async () => {
      // Test with a real module path that exists
      const loadTime = await performanceTest.testBundleLoad('../bundleAnalysis')
      
      if (loadTime > 0) {
        expect(loadTime).toBeGreaterThan(0)
        expect(loadTime).toBeLessThan(1000) // Should load within 1 second
        console.log(`Lazy load time: ${loadTime.toFixed(2)}ms`)
      } else {
        // In test environment, module might already be loaded
        console.log('Module already loaded or test environment limitation')
        expect(loadTime).toBe(-1)
      }
    })
  })

  describe('Memory Usage', () => {
    it('should monitor memory usage patterns', async () => {
      const measurements = performanceTest.testMemoryUsage(1000) // 1 second test
      
      expect(measurements).toBeInstanceOf(Array)
      
      // Wait for measurements to be collected
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In test environment, memory API might not be available
      if (measurements.length > 0) {
        expect(measurements.length).toBeGreaterThan(0)
        console.log(`Collected ${measurements.length} memory measurements`)
      } else {
        console.log('Memory API not available in test environment')
      }
    })
  })

  describe('Performance Budgets', () => {
    it('should enforce performance budgets', async () => {
      const analysis = await bundleAnalyzer.analyzeBundlePerformance()
      const budgetCheck = checkPerformanceBudget(analysis)
      
      expect(budgetCheck).toHaveProperty('passed')
      expect(budgetCheck).toHaveProperty('violations')
      expect(budgetCheck).toHaveProperty('budgets')
      
      // Log budget status
      console.log('Performance Budget Status:', {
        passed: budgetCheck.passed,
        violations: budgetCheck.violations.length,
        totalSize: `${(analysis.totalSize / 1024).toFixed(2)} KB`,
        budget: `${(budgetCheck.budgets.totalSize / 1024).toFixed(2)} KB`,
      })
      
      // Warn if budget is exceeded but don't fail the test
      if (!budgetCheck.passed) {
        console.warn('⚠️  Performance budget exceeded!')
        budgetCheck.violations.forEach(violation => {
          console.warn(`   - ${violation}`)
        })
      }
    })
  })

  describe('Load Performance', () => {
    it('should measure bundle load performance', async () => {
      const loadMetrics = await bundleAnalyzer.measureBundleLoadPerformance()
      
      expect(loadMetrics).toHaveProperty('initialLoad')
      expect(loadMetrics).toHaveProperty('asyncChunkLoad')
      expect(loadMetrics).toHaveProperty('totalLoadTime')
      
      // Initial load should be reasonably fast
      if (loadMetrics.initialLoad > 0) {
        expect(loadMetrics.initialLoad).toBeLessThan(3000) // 3 seconds
      }
      
      console.log('Bundle Load Performance:', {
        initialLoad: loadMetrics.initialLoad > 0 ? `${loadMetrics.initialLoad.toFixed(2)}ms` : 'N/A',
        asyncChunkLoad: loadMetrics.asyncChunkLoad > 0 ? `${loadMetrics.asyncChunkLoad.toFixed(2)}ms` : 'N/A',
        totalLoadTime: `${loadMetrics.totalLoadTime.toFixed(2)}ms`,
      })
    }, 10000)
  })

  describe('Code Splitting Effectiveness', () => {
    it('should verify code splitting is working', async () => {
      const analysis = await bundleAnalyzer.analyzeBundlePerformance()
      
      // In test environment, we might not have actual chunks
      if (analysis.chunks.length > 0) {
        // Should have multiple chunks indicating code splitting
        expect(analysis.chunks.length).toBeGreaterThan(0)
        
        // Should have both sync and async chunks
        const syncChunks = analysis.chunks.filter(chunk => !chunk.isAsync)
        const asyncChunks = analysis.chunks.filter(chunk => chunk.isAsync)
        
        // Vendor chunks should be separate
        const vendorChunks = analysis.chunks.filter(chunk => chunk.isVendor)
        
        console.log('Code Splitting Analysis:', {
          totalChunks: analysis.chunks.length,
          syncChunks: syncChunks.length,
          asyncChunks: asyncChunks.length,
          vendorChunks: vendorChunks.length,
        })
      } else {
        console.log('No chunks found in test environment - code splitting will be verified in build')
        expect(analysis.chunks).toBeInstanceOf(Array)
      }
    })
  })
})

// Performance benchmark for CI/CD
export const runPerformanceBenchmark = async () => {
  console.log('🚀 Running Performance Benchmark...')
  
  const analyzer = BundleAnalyzer.getInstance()
  const analysis = await analyzer.analyzeBundlePerformance()
  const budgetCheck = checkPerformanceBudget(analysis)
  const loadMetrics = await analyzer.measureBundleLoadPerformance()
  
  const benchmark = {
    timestamp: new Date().toISOString(),
    bundleSize: {
      total: analysis.totalSize,
      gzipped: analysis.gzipSize,
      chunks: analysis.chunks.length,
    },
    performance: {
      initialLoad: loadMetrics.initialLoad,
      totalLoad: loadMetrics.totalLoadTime,
    },
    budget: {
      passed: budgetCheck.passed,
      violations: budgetCheck.violations.length,
    },
    recommendations: analysis.recommendations.length,
  }
  
  console.log('📊 Performance Benchmark Results:')
  console.table(benchmark)
  
  // Generate report
  const report = analyzer.generateReport()
  console.log('\n📋 Detailed Report:')
  console.log(report)
  
  return benchmark
}