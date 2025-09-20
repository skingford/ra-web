import { AuthTokenManager } from '../auth'
import { apiClient } from '../api'
import { useAuthStore } from '../../stores/authStore'
import { vi } from 'vitest'

// Mock the API client
vi.mock('../api')
const mockApiClient = apiClient as any

// Mock the auth store
vi.mock('../../stores/authStore')
const mockUseAuthStore = useAuthStore as any

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock user data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  roles: [],
  permissions: [],
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('AuthTokenManager', () => {
  let tokenManager: AuthTokenManager

  beforeEach(() => {
    vi.clearAllMocks()
    tokenManager = AuthTokenManager.getInstance()
  })

  describe('decodeToken', () => {
    it('decodes valid JWT token', () => {
      // Create a mock JWT token (header.payload.signature)
      const payload = {
        sub: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['users:read'],
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
      }
      
      const encodedPayload = btoa(JSON.stringify(payload))
      const mockToken = `header.${encodedPayload}.signature`

      const decoded = tokenManager.decodeToken(mockToken)

      expect(decoded).toEqual(payload)
    })

    it('returns null for invalid token', () => {
      const invalidToken = 'invalid.token'
      const decoded = tokenManager.decodeToken(invalidToken)
      expect(decoded).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('returns true for expired token', () => {
      const expiredPayload = {
        sub: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['users:read'],
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
        iat: Math.floor(Date.now() / 1000) - 7200,
      }
      
      const encodedPayload = btoa(JSON.stringify(expiredPayload))
      const expiredToken = `header.${encodedPayload}.signature`

      expect(tokenManager.isTokenExpired(expiredToken)).toBe(true)
    })

    it('returns false for valid token', () => {
      const validPayload = {
        sub: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['users:read'],
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
      }
      
      const encodedPayload = btoa(JSON.stringify(validPayload))
      const validToken = `header.${encodedPayload}.signature`

      expect(tokenManager.isTokenExpired(validToken)).toBe(false)
    })
  })

  describe('isTokenExpiringSoon', () => {
    it('returns true for token expiring within 5 minutes', () => {
      const soonToExpirePayload = {
        sub: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['users:read'],
        exp: Math.floor(Date.now() / 1000) + 240, // 4 minutes from now
        iat: Math.floor(Date.now() / 1000),
      }
      
      const encodedPayload = btoa(JSON.stringify(soonToExpirePayload))
      const soonToExpireToken = `header.${encodedPayload}.signature`

      expect(tokenManager.isTokenExpiringSoon(soonToExpireToken)).toBe(true)
    })

    it('returns false for token with plenty of time left', () => {
      const validPayload = {
        sub: '1',
        email: 'test@example.com',
        roles: ['admin'],
        permissions: ['users:read'],
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        iat: Math.floor(Date.now() / 1000),
      }
      
      const encodedPayload = btoa(JSON.stringify(validPayload))
      const validToken = `header.${encodedPayload}.signature`

      expect(tokenManager.isTokenExpiringSoon(validToken)).toBe(false)
    })
  })

  describe('getRefreshToken', () => {
    it('returns stored refresh token', () => {
      mockLocalStorage.getItem.mockReturnValue('stored-refresh-token')
      
      const refreshToken = tokenManager.getRefreshToken()
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('refreshToken')
      expect(refreshToken).toBe('stored-refresh-token')
    })

    it('returns null when no refresh token stored', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const refreshToken = tokenManager.getRefreshToken()
      
      expect(refreshToken).toBeNull()
    })
  })

  describe('removeRefreshToken', () => {
    it('removes refresh token from storage', () => {
      tokenManager.removeRefreshToken()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
    })
  })

  describe('refreshAccessToken', () => {
    const mockLogin = vi.fn()
    const mockLogout = vi.fn()

    beforeEach(() => {
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        token: 'old-token',
        permissions: new Set(),
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
        updateUser: vi.fn(),
        setLoading: vi.fn(),
        hasPermission: vi.fn(),
      })

      // Mock getState method
      mockUseAuthStore.getState = vi.fn().mockReturnValue({
        user: mockUser,
        token: 'old-token',
        permissions: new Set(),
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
        updateUser: vi.fn(),
        setLoading: vi.fn(),
        hasPermission: vi.fn(),
      })
    })

    it('successfully refreshes access token', async () => {
      const refreshResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: mockUser,
      }

      mockLocalStorage.getItem.mockReturnValue('valid-refresh-token')
      mockApiClient.post.mockResolvedValueOnce(refreshResponse)

      const newToken = await tokenManager.refreshAccessToken()

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'valid-refresh-token',
      })
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token')
      expect(mockLogin).toHaveBeenCalledWith(mockUser, 'new-access-token')
      expect(newToken).toBe('new-access-token')
    })

    it('throws error when no refresh token available', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow('No refresh token available')
    })

    it('handles refresh failure and logs out user', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-refresh-token')
      mockApiClient.post.mockRejectedValueOnce(new Error('Refresh failed'))

      await expect(tokenManager.refreshAccessToken()).rejects.toThrow('Token refresh failed')
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(mockLogout).toHaveBeenCalled()
    })

    it('returns same promise for concurrent refresh requests', async () => {
      const refreshResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: mockUser,
      }

      mockLocalStorage.getItem.mockReturnValue('valid-refresh-token')
      mockApiClient.post.mockResolvedValueOnce(refreshResponse)

      // Start two concurrent refresh requests
      const promise1 = tokenManager.refreshAccessToken()
      const promise2 = tokenManager.refreshAccessToken()

      const [result1, result2] = await Promise.all([promise1, promise2])

      // Should only make one API call
      expect(mockApiClient.post).toHaveBeenCalledTimes(1)
      expect(result1).toBe('new-access-token')
      expect(result2).toBe('new-access-token')
    })
  })

  describe('logout', () => {
    it('clears refresh token and logs out user', () => {
      const mockLogout = vi.fn()
      mockUseAuthStore.getState = vi.fn().mockReturnValue({
        logout: mockLogout,
      })

      tokenManager.logout()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('refreshToken')
      expect(mockLogout).toHaveBeenCalled()
    })
  })
})