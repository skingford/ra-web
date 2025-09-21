// Bundle analysis and optimization utilities
import React, { useState, useCallback, useEffect } from 'react'

export interface BundleAnalysis {
  totalSize: number
  gzipSize: number
  chunks: ChunkInfo[]
  recommendations: string[]
}

export interface ChunkInfo {
  name: string
  size: number
  gzipSize: number
  modules: string[]
  isVendor: boolean
  isAsync: boolean
}

// Analyze bundle composition and performance
export class BundleAnalyzer {
  private static instance: BundleAnalyzer
  private analysisData: BundleAnalysis | null = null

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer()
    }
    return BundleAnalyzer.instance
  }

  // Analyze current bundle performance
  async analyzeBundlePerformance(): Promise<BundleAnalysis> {
    const chunks = await this.getChunkInfo()
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    const gzipSize = chunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0)
    
    const recommendations = this.generateRecommendations(chunks, totalSize)
    
    this.analysisData = {
      totalSize,
      gzipSize,
      chunks,
      recommendations,
    }
    
    return this.analysisData
  }

  // Get detailed chunk information
  private async getChunkInfo(): Promise<ChunkInfo[]> {
    if (typeof window === 'undefined') return []
    
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    const jsEntries = entries.filter(entry => 
      entry.name.includes('.js') && 
      !entry.name.includes('node_modules') &&
      entry.name.includes('/assets/')
    )
    
    return jsEntries.map(entry => ({
      name: this.extractChunkName(entry.name),
      size: entry.transferSize || 0,
      gzipSize: entry.encodedBodySize || 0,
      modules: [], // Would need build-time analysis for detailed module info
      isVendor: entry.name.includes('vendor'),
      isAsync: !entry.name.includes('index'),
    }))
  }

  // Extract meaningful chunk name from URL
  private extractChunkName(url: string): string {
    const match = url.match(/\/assets\/([^\/]+)\.js/)
    return match ? match[1] : 'unknown'
  }

  // Generate optimization recommendations
  private generateRecommendations(chunks: ChunkInfo[], totalSize: number): string[] {
    const recommendations: string[] = []
    
    // Check total bundle size
    if (totalSize > 1024 * 1024) { // 1MB
      recommendations.push('Total bundle size exceeds 1MB. Consider code splitting or tree shaking.')
    }
    
    // Check individual chunk sizes
    chunks.forEach(chunk => {
      if (chunk.size > 500 * 1024 && !chunk.isVendor) { // 500KB
        recommendations.push(`Chunk "${chunk.name}" is large (${(chunk.size / 1024).toFixed(0)}KB). Consider splitting further.`)
      }
    })
    
    // Check vendor chunk size
    const vendorChunks = chunks.filter(chunk => chunk.isVendor)
    const vendorSize = vendorChunks.reduce((sum, chunk) => sum + chunk.size, 0)
    if (vendorSize > 800 * 1024) { // 800KB
      recommendations.push('Vendor chunks are large. Consider splitting vendor libraries.')
    }
    
    // Check async chunk distribution
    const asyncChunks = chunks.filter(chunk => chunk.isAsync)
    if (asyncChunks.length < 3) {
      recommendations.push('Consider more aggressive code splitting for better loading performance.')
    }
    
    return recommendations
  }

  // Performance metrics for bundle loading
  measureBundleLoadPerformance(): Promise<{
    initialLoad: number
    asyncChunkLoad: number
    totalLoadTime: number
  }> {
    return new Promise((resolve) => {
      const startTime = performance.now()
      let initialLoadComplete = false
      let asyncChunksLoaded = 0
      let totalAsyncChunks = 0
      
      // Monitor resource loading
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name.includes('.js') && entry.name.includes('/assets/')) {
            if (!initialLoadComplete && !entry.name.includes('async')) {
              initialLoadComplete = true
            } else if (entry.name.includes('async')) {
              asyncChunksLoaded++
            }
          }
        })
      })
      
      observer.observe({ entryTypes: ['resource'] })
      
      // Wait for initial load and some async chunks
      setTimeout(() => {
        observer.disconnect()
        const endTime = performance.now()
        
        resolve({
          initialLoad: initialLoadComplete ? endTime - startTime : -1,
          asyncChunkLoad: asyncChunksLoaded > 0 ? endTime - startTime : -1,
          totalLoadTime: endTime - startTime,
        })
      }, 5000)
    })
  }

  // Generate bundle size report
  generateReport(): string {
    if (!this.analysisData) {
      return 'No analysis data available. Run analyzeBundlePerformance() first.'
    }
    
    const { totalSize, gzipSize, chunks, recommendations } = this.analysisData
    
    let report = '# Bundle Analysis Report\n\n'
    report += `## Summary\n`
    report += `- Total Size: ${(totalSize / 1024).toFixed(2)} KB\n`
    report += `- Gzipped Size: ${(gzipSize / 1024).toFixed(2)} KB\n`
    report += `- Compression Ratio: ${((1 - gzipSize / totalSize) * 100).toFixed(1)}%\n`
    report += `- Number of Chunks: ${chunks.length}\n\n`
    
    report += `## Chunks\n`
    chunks
      .sort((a, b) => b.size - a.size)
      .forEach(chunk => {
        report += `- **${chunk.name}**: ${(chunk.size / 1024).toFixed(2)} KB`
        report += ` (gzipped: ${(chunk.gzipSize / 1024).toFixed(2)} KB)`
        report += ` ${chunk.isVendor ? '[Vendor]' : ''}`
        report += ` ${chunk.isAsync ? '[Async]' : '[Sync]'}\n`
      })
    
    if (recommendations.length > 0) {
      report += `\n## Recommendations\n`
      recommendations.forEach(rec => {
        report += `- ${rec}\n`
      })
    }
    
    return report
  }
}

// Bundle size monitoring hook
export const useBundleAnalysis = () => {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  
  const runAnalysis = useCallback(async () => {
    setLoading(true)
    try {
      const analyzer = BundleAnalyzer.getInstance()
      const result = await analyzer.analyzeBundlePerformance()
      setAnalysis(result)
    } catch (error) {
      console.error('Bundle analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    // Run analysis on component mount
    runAnalysis()
  }, [runAnalysis])
  
  return { analysis, loading, runAnalysis }
}

// Webpack bundle analyzer integration (for build-time analysis)
export const generateWebpackAnalysis = () => {
  // This would integrate with webpack-bundle-analyzer
  // For now, we'll use the Vite rollup visualizer
  console.log('Run "npm run build:analyze" to generate detailed bundle analysis')
}

// Performance budget checker
export const checkPerformanceBudget = (analysis: BundleAnalysis) => {
  const budgets = {
    totalSize: 1024 * 1024, // 1MB
    gzipSize: 300 * 1024,   // 300KB
    chunkSize: 500 * 1024,  // 500KB per chunk
    vendorSize: 800 * 1024, // 800KB for vendor
  }
  
  const violations: string[] = []
  
  if (analysis.totalSize > budgets.totalSize) {
    violations.push(`Total size exceeds budget: ${(analysis.totalSize / 1024).toFixed(0)}KB > ${(budgets.totalSize / 1024).toFixed(0)}KB`)
  }
  
  if (analysis.gzipSize > budgets.gzipSize) {
    violations.push(`Gzipped size exceeds budget: ${(analysis.gzipSize / 1024).toFixed(0)}KB > ${(budgets.gzipSize / 1024).toFixed(0)}KB`)
  }
  
  analysis.chunks.forEach(chunk => {
    if (chunk.size > budgets.chunkSize && !chunk.isVendor) {
      violations.push(`Chunk "${chunk.name}" exceeds budget: ${(chunk.size / 1024).toFixed(0)}KB > ${(budgets.chunkSize / 1024).toFixed(0)}KB`)
    }
  })
  
  const vendorSize = analysis.chunks
    .filter(chunk => chunk.isVendor)
    .reduce((sum, chunk) => sum + chunk.size, 0)
  
  if (vendorSize > budgets.vendorSize) {
    violations.push(`Vendor size exceeds budget: ${(vendorSize / 1024).toFixed(0)}KB > ${(budgets.vendorSize / 1024).toFixed(0)}KB`)
  }
  
  return {
    passed: violations.length === 0,
    violations,
    budgets,
  }
}

export default BundleAnalyzer