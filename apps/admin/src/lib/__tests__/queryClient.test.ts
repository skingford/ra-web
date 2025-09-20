import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createQueryClient, networkUtils } from '../queryClient'

// Mock useUIStore
vi.mock('../../stores/uiStore', () => ({
  useUIStore: {
    getState: () => ({
      addNotification: vi.fn(),
    }),
  },
}))

describe('Query Client Configuration', () => {
  let queryClient: ReturnType<typeof createQueryClient>

  beforeEach(() => {
    queryClient = createQueryClient()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('Default Options', () => {
    it('should have correct default query options', () => {
      const defaultOptions = queryClient.getDefaultOptions()

      expect(defaultOptions.queries?.staleTime).toBe(5 * 60 * 1000) // 5 minutes
      expect(defaultOptions.queries?.gcTime).toBe(10 * 60 * 1000) // 10 minutes
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false)
      expect(defaultOptions.queries?.refetchOnReconnect).toBe(true)
      expect(defaultOptions.queries?.refetchOnMount).toBe(true)
    })

    it('should have correct default mutation options', () => {
      const defaultOptions = queryClient.getDefaultOptions()

      expect(defaultOptions.mutations?.retry).toBe(1)
      expect(defaultOptions.mutations?.retryDelay).toBe(1000)
    })
  })

  describe('Retry Logic', () => {
    it('should not retry on 4xx errors', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      const retryFn = defaultOptions.queries?.retry as Function

      // Test 404 error
      const shouldRetry404 = retryFn(1, { status: 404 })
      expect(shouldRetry404).toBe(false)

      // Test 400 error
      const shouldRetry400 = retryFn(1, { status: 400 })
      expect(shouldRetry400).toBe(false)

      // Test 401 error
      const shouldRetry401 = retryFn(1, { status: 401 })
      expect(shouldRetry401).toBe(false)
    })

    it('should retry on 5xx errors up to 3 times', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      const retryFn = defaultOptions.queries?.retry as Function

      // Test 500 error - should retry
      expect(retryFn(0, { status: 500 })).toBe(true)
      expect(retryFn(1, { status: 500 })).toBe(true)
      expect(retryFn(2, { status: 500 })).toBe(true)
      expect(retryFn(3, { status: 500 })).toBe(false) // Max retries reached
    })

    it('should retry on network errors', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      const retryFn = defaultOptions.queries?.retry as Function

      // Test network error (no status)
      expect(retryFn(0, new Error('Network error'))).toBe(true)
      expect(retryFn(1, new Error('Network error'))).toBe(true)
      expect(retryFn(2, new Error('Network error'))).toBe(true)
      expect(retryFn(3, new Error('Network error'))).toBe(false)
    })
  })

  describe('Retry Delay', () => {
    it('should use exponential backoff with max delay', () => {
      const defaultOptions = queryClient.getDefaultOptions()
      const retryDelayFn = defaultOptions.queries?.retryDelay as Function

      expect(retryDelayFn(0)).toBe(1000) // 1 second
      expect(retryDelayFn(1)).toBe(2000) // 2 seconds
      expect(retryDelayFn(2)).toBe(4000) // 4 seconds
      expect(retryDelayFn(3)).toBe(8000) // 8 seconds
      expect(retryDelayFn(10)).toBe(30000) // Max 30 seconds
    })
  })
})

describe('Network Utils', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })
  })

  describe('isOnline', () => {
    it('should return true when online', () => {
      Object.defineProperty(navigator, 'onLine', { value: true })
      expect(networkUtils.isOnline()).toBe(true)
    })

    it('should return false when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false })
      expect(networkUtils.isOnline()).toBe(false)
    })
  })

  describe('addNetworkListeners', () => {
    it('should add and remove event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const onOnline = vi.fn()
      const onOffline = vi.fn()

      const cleanup = networkUtils.addNetworkListeners(onOnline, onOffline)

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', onOnline)
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', onOffline)

      cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', onOnline)
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', onOffline)

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('pauseQueriesWhenOffline', () => {
    it('should set up network listeners for query management', () => {
      const addNetworkListenersSpy = vi.spyOn(networkUtils, 'addNetworkListeners')
      
      const cleanup = networkUtils.pauseQueriesWhenOffline()

      expect(addNetworkListenersSpy).toHaveBeenCalled()
      
      // Cleanup should be a function
      expect(typeof cleanup).toBe('function')

      addNetworkListenersSpy.mockRestore()
    })
  })
})