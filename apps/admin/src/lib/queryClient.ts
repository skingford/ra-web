import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

// Enhanced error handling for queries
const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error('Query error:', error, 'Query key:', query.queryKey)
    
    // You could integrate with error reporting service here
    // errorReportingService.captureException(error, { extra: { queryKey: query.queryKey } })
  },
})

// Enhanced error handling for mutations
const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    console.error('Mutation error:', error, 'Variables:', variables)
    
    // You could show user-friendly error messages here
    // toast.error('Something went wrong. Please try again.')
  },
})

// Create a query client with optimized caching settings
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long data stays in cache after component unmounts
      gcTime: 30 * 60 * 1000, // 30 minutes (increased for better caching)
      
      // Retry configuration with intelligent logic
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        
        // Don't retry on network errors that are likely permanent
        if (error && error.message?.includes('NetworkError')) {
          return failureCount < 1
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Retry delay with exponential backoff and jitter
      retryDelay: (attemptIndex) => {
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000)
        const jitter = Math.random() * 1000 // Add jitter to prevent thundering herd
        return baseDelay + jitter
      },
      
      // Optimized refetch settings
      refetchOnWindowFocus: false, // Disabled for better UX
      refetchOnReconnect: 'always', // Always refetch on reconnect
      refetchOnMount: true,
      
      // Network mode for offline support
      networkMode: 'online',
      
      // Placeholder data function for better UX
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // Retry mutations with backoff
      retry: (failureCount, error) => {
        // Don't retry validation errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status
          if (status === 400 || status === 422) {
            return false
          }
        }
        return failureCount < 2
      },
      
      // Retry delay for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
})

// Query key factories for consistent caching
export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.users.details(), id] as const,
    permissions: (id: string | number) => [...queryKeys.users.detail(id), 'permissions'] as const,
  },
  
  // Dashboard-related queries
  dashboard: {
    all: ['dashboard'] as const,
    metrics: () => [...queryKeys.dashboard.all, 'metrics'] as const,
    metric: (type: string, timeRange?: string) => 
      [...queryKeys.dashboard.metrics(), type, timeRange] as const,
    charts: () => [...queryKeys.dashboard.all, 'charts'] as const,
    chart: (id: string, config?: Record<string, any>) => 
      [...queryKeys.dashboard.charts(), id, config] as const,
  },
  
  // Data-related queries
  data: {
    all: ['data'] as const,
    tables: () => [...queryKeys.data.all, 'tables'] as const,
    table: (name: string, params?: Record<string, any>) => 
      [...queryKeys.data.tables(), name, params] as const,
    exports: () => [...queryKeys.data.all, 'exports'] as const,
    export: (id: string) => [...queryKeys.data.exports(), id] as const,
  },
  
  // Settings and preferences
  settings: {
    all: ['settings'] as const,
    user: () => [...queryKeys.settings.all, 'user'] as const,
    system: () => [...queryKeys.settings.all, 'system'] as const,
    theme: () => [...queryKeys.settings.all, 'theme'] as const,
  },
}

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate all user-related queries
  invalidateUsers: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
  },
  
  // Invalidate specific user
  invalidateUser: (id: string | number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) })
  },
  
  // Invalidate dashboard data
  invalidateDashboard: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
  },
  
  // Remove specific query from cache
  removeQuery: (queryKey: readonly unknown[]) => {
    queryClient.removeQueries({ queryKey })
  },
  
  // Clear all cache
  clearAll: () => {
    queryClient.clear()
  },
  
  // Prefetch data
  prefetchUsers: () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.lists(),
      queryFn: () => fetch('/api/users').then(res => res.json()),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  },
  
  // Set query data manually (for optimistic updates)
  setUserData: (id: string | number, data: any) => {
    queryClient.setQueryData(queryKeys.users.detail(id), data)
  },
  
  // Get cached data
  getUserData: (id: string | number) => {
    return queryClient.getQueryData(queryKeys.users.detail(id))
  },
}

// Background refetch configuration
export const backgroundRefetchConfig = {
  // Refetch critical data every 5 minutes
  setupBackgroundRefetch: () => {
    const interval = setInterval(() => {
      // Only refetch if user is active and online
      if (document.visibilityState === 'visible' && navigator.onLine) {
        queryClient.refetchQueries({
          queryKey: queryKeys.dashboard.metrics(),
          type: 'active',
        })
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    return () => clearInterval(interval)
  },
}

// Network status utilities
export const networkUtils = {
  // Check if we're online
  isOnline: () => navigator.onLine,
  
  // Add online/offline event listeners
  addNetworkListeners: (onOnline: () => void, onOffline: () => void) => {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  },
  
  // Pause queries when offline
  pauseQueriesWhenOffline: () => {
    const handleOffline = () => {
      queryClient.getQueryCache().getAll().forEach((query) => {
        query.cancel()
      })
    }
    
    const handleOnline = () => {
      queryClient.invalidateQueries()
    }
    
    return networkUtils.addNetworkListeners(handleOnline, handleOffline)
  },
}

// Query client event listeners for debugging and monitoring
if (process.env.NODE_ENV === 'development') {
  queryClient.getQueryCache().subscribe((event) => {
    console.log('Query cache event:', event)
  })
  
  queryClient.getMutationCache().subscribe((event) => {
    console.log('Mutation cache event:', event)
  })
}