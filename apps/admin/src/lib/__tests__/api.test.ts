import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { apiClient, queryKeys, queryKeyUtils } from '../api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET requests', () => {
    it('should make GET request with correct URL and headers', async () => {
      const mockResponse = { data: { id: 1, name: 'Test' }, success: true }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.get('/users')

      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockResponse)
    })

    it('should include query parameters in GET request', async () => {
      const mockResponse = { data: [], success: true }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      await apiClient.get('/users', { page: 1, limit: 10 })

      expect(mockFetch).toHaveBeenCalledWith('/api/users?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should include authorization header when token is available', async () => {
      const mockToken = 'mock-jwt-token'
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ state: { token: mockToken } })
      )

      const mockResponse = { data: [], success: true }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      await apiClient.get('/users')

      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
      })
    })
  })

  describe('POST requests', () => {
    it('should make POST request with data', async () => {
      const mockData = { name: 'New User', email: 'user@example.com' }
      const mockResponse = { data: { id: 1, ...mockData }, success: true }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.post('/users', mockData)

      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('PUT requests', () => {
    it('should make PUT request with data', async () => {
      const mockData = { id: 1, name: 'Updated User' }
      const mockResponse = { data: mockData, success: true }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.put('/users/1', mockData)

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      const mockResponse = { success: true, message: 'User deleted' }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      const result = await apiClient.delete('/users/1')

      expect(mockFetch).toHaveBeenCalledWith('/api/users/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error handling', () => {
    it('should handle HTTP errors correctly', async () => {
      const errorResponse = {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve(errorResponse),
      })

      await expect(apiClient.get('/users/999')).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      await expect(apiClient.get('/users')).rejects.toThrow()
    })

    it('should handle malformed error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      })

      await expect(apiClient.get('/users')).rejects.toThrow()
    })
  })

  describe('Request and Response Interceptors', () => {
    it('should apply request interceptors', async () => {
      const mockResponse = { data: [], success: true }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })

      // Add request interceptor
      apiClient.addRequestInterceptor((config) => ({
        ...config,
        headers: {
          ...config.headers,
          'X-Custom-Header': 'test-value',
        },
      }))

      await apiClient.get('/users')

      expect(mockFetch).toHaveBeenCalledWith('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'test-value',
        },
      })
    })
  })
})

describe('Query Keys', () => {
  describe('Basic query keys', () => {
    it('should generate correct user query keys', () => {
      expect(queryKeys.users()).toEqual(['api', 'users'])
      expect(queryKeys.user('123')).toEqual(['api', 'users', '123'])
      expect(queryKeys.userList({ page: 1 })).toEqual(['api', 'users', 'list', { page: 1 }])
    })

    it('should generate correct dashboard query keys', () => {
      expect(queryKeys.dashboard()).toEqual(['api', 'dashboard'])
      expect(queryKeys.dashboardMetrics()).toEqual(['api', 'dashboard', 'metrics'])
      expect(queryKeys.dashboardCharts('7d')).toEqual(['api', 'dashboard', 'charts', '7d'])
    })

    it('should generate correct analytics query keys', () => {
      expect(queryKeys.analytics()).toEqual(['api', 'analytics'])
      expect(queryKeys.analyticsReport('sales', { month: 1 })).toEqual([
        'api', 'analytics', 'sales', { month: 1 }
      ])
    })
  })

  describe('Generic query key factories', () => {
    it('should generate list query keys', () => {
      expect(queryKeys.list('products')).toEqual(['api', 'products', 'list', undefined])
      expect(queryKeys.list('products', { category: 'electronics' })).toEqual([
        'api', 'products', 'list', { category: 'electronics' }
      ])
    })

    it('should generate detail query keys', () => {
      expect(queryKeys.detail('products', '123')).toEqual(['api', 'products', '123'])
    })
  })

  describe('Query key utilities', () => {
    it('should generate resource invalidation keys', () => {
      expect(queryKeyUtils.invalidateResource('users')).toEqual(['api', 'users'])
    })

    it('should generate resource keys', () => {
      expect(queryKeyUtils.getResourceKeys('products')).toEqual(['api', 'products'])
    })

    it('should generate custom query keys', () => {
      expect(queryKeyUtils.custom('custom', 'key', { param: 'value' })).toEqual([
        'api', 'custom', 'key', { param: 'value' }
      ])
    })
  })
})