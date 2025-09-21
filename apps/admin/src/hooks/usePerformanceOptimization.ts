// Custom hooks for React performance optimization
import { useCallback, useMemo, useRef, useEffect, useState } from 'react'

// Debounced value hook for performance optimization
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttled callback hook
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

// Memoized callback with dependencies
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback(callback, deps)
}

// Memoized value with deep comparison
export const useDeepMemo = <T>(factory: () => T, deps: React.DependencyList): T => {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()

  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }

  return ref.current.value
}

// Deep equality check
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false

  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    for (const key of keysA) {
      if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
        return false
      }
    }

    return true
  }

  return false
}

// Previous value hook for comparison
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return [ref, isIntersecting]
}

// Optimized state updater for complex objects
export const useOptimizedState = <T extends Record<string, any>>(
  initialState: T
): [T, (updates: Partial<T>) => void] => {
  const [state, setState] = useState<T>(initialState)

  const updateState = useCallback((updates: Partial<T>) => {
    setState(prevState => {
      // Only update if there are actual changes
      const hasChanges = Object.keys(updates).some(
        key => prevState[key] !== updates[key]
      )

      if (!hasChanges) return prevState

      return { ...prevState, ...updates }
    })
  }, [])

  return [state, updateState]
}

// Memoized array operations
export const useArrayOperations = <T>(array: T[]) => {
  const operations = useMemo(() => ({
    // Memoized filter
    filter: (predicate: (item: T, index: number) => boolean) =>
      array.filter(predicate),

    // Memoized map
    map: <U>(mapper: (item: T, index: number) => U) =>
      array.map(mapper),

    // Memoized sort
    sort: (compareFn?: (a: T, b: T) => number) =>
      [...array].sort(compareFn),

    // Memoized find
    find: (predicate: (item: T, index: number) => boolean) =>
      array.find(predicate),

    // Memoized reduce
    reduce: <U>(
      reducer: (acc: U, item: T, index: number) => U,
      initialValue: U
    ) => array.reduce(reducer, initialValue),

    // Get unique items
    unique: (keySelector?: (item: T) => any) => {
      if (!keySelector) {
        return [...new Set(array)]
      }
      const seen = new Set()
      return array.filter(item => {
        const key = keySelector(item)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    },

    // Chunk array into smaller arrays
    chunk: (size: number) => {
      const chunks: T[][] = []
      for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
      }
      return chunks
    },
  }), [array])

  return operations
}

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0)
  const renderTimes = useRef<number[]>([])
  const startTime = useRef<number>(0)

  useEffect(() => {
    startTime.current = performance.now()
    renderCount.current += 1
  })

  useEffect(() => {
    const endTime = performance.now()
    const renderTime = endTime - startTime.current
    renderTimes.current.push(renderTime)

    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current = renderTimes.current.slice(-10)
    }

    // Log slow renders (> 16ms for 60fps)
    if (renderTime > 16) {
      console.warn(
        `Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
      )
    }
  })

  const getStats = useCallback(() => {
    const times = renderTimes.current
    const avgRenderTime = times.length > 0 
      ? times.reduce((a, b) => a + b, 0) / times.length 
      : 0

    return {
      renderCount: renderCount.current,
      avgRenderTime: avgRenderTime.toFixed(2),
      lastRenderTime: times[times.length - 1]?.toFixed(2) || '0',
      slowRenders: times.filter(time => time > 16).length,
    }
  }, [])

  return { getStats }
}

// Optimized event handlers
export const useOptimizedEventHandlers = <T extends Record<string, any>>(
  handlers: T
): T => {
  return useMemo(() => {
    const optimizedHandlers = {} as T

    Object.keys(handlers).forEach(key => {
      optimizedHandlers[key] = useCallback(handlers[key], [handlers[key]])
    })

    return optimizedHandlers
  }, [handlers])
}

// Batch state updates
export const useBatchedUpdates = <T>(
  initialState: T,
  batchDelay: number = 16
): [T, (updater: (prev: T) => T) => void] => {
  const [state, setState] = useState<T>(initialState)
  const pendingUpdates = useRef<((prev: T) => T)[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()

  const batchedSetState = useCallback((updater: (prev: T) => T) => {
    pendingUpdates.current.push(updater)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setState(prevState => {
        let newState = prevState
        pendingUpdates.current.forEach(update => {
          newState = update(newState)
        })
        pendingUpdates.current = []
        return newState
      })
    }, batchDelay)
  }, [batchDelay])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, batchedSetState]
}

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number
    total: number
    limit: number
  } | null>(null)

  const updateMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      setMemoryInfo({
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
      })
    }
  }, [])

  useEffect(() => {
    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [updateMemoryInfo])

  const getMemoryStats = useCallback(() => {
    if (!memoryInfo) return null

    return {
      usedMB: (memoryInfo.used / 1024 / 1024).toFixed(2),
      totalMB: (memoryInfo.total / 1024 / 1024).toFixed(2),
      limitMB: (memoryInfo.limit / 1024 / 1024).toFixed(2),
      usagePercent: ((memoryInfo.used / memoryInfo.limit) * 100).toFixed(1),
    }
  }, [memoryInfo])

  return { memoryInfo, getMemoryStats, updateMemoryInfo }
}