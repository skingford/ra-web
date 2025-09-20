import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query'
import { useUIStore } from '../stores/uiStore'

// Error handler for queries and mutations
const handleError = (error: unknown) => {
  const uiStore = useUIStore.getState()
  
  let errorMessage = 'An unexpected error occurred'
  let errorCode = 'UNKNOWN_ERROR'
  
  if (error instanceof Error) {
    try {
      const parsedError = JSON.parse(error.message)
      errorMessage = parsedError.message || errorMessage
      errorCode = parsedError.code || errorCode
    } catch {
      errorMessage = error.message
    }
  }
  
  // Add error notification
  uiStore.addNotification({
    title: 'Error',
    message: errorMessage,
    type: 'error',
  })
  
  console.error('Query/Mutation Error:', { errorCode, errorMessage, error })
}

// Create query client with enhanced configuration
export const createQueryClient = () => {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleError,
    }),
    mutationCache: new MutationCache({
      onError: handleError,
    }),
    defaultOptions: {
      queries: {
        // Stale time - how long data is considered fresh
        staleTime: 5 * 60 * 1000, // 5 minutes
        
        // Garbage collection time - how long unused data stays in cache
        gcTime: 10 * 60 * 1000, // 10 minutes
        
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        
        // Refetch on reconnect
        refetchOnReconnect: true,
        
        // Refetch on mount if data is stale
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        
        // Retry delay for mutations
        retryDelay: 1000,
      },
    },
  })
}

// Singleton query client instance
export const queryClient = createQueryClient()

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