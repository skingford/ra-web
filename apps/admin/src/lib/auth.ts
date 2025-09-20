import { apiClient } from './api'
import { useAuthStore } from '../stores/authStore'
import type { User } from '../stores/types'

interface RefreshTokenResponse {
  token: string
  refreshToken: string
  user: User
}

interface TokenPayload {
  sub: string
  email: string
  roles: string[]
  permissions: string[]
  exp: number
  iat: number
}

export class AuthTokenManager {
  private static instance: AuthTokenManager
  private refreshPromise: Promise<string> | null = null

  static getInstance(): AuthTokenManager {
    if (!AuthTokenManager.instance) {
      AuthTokenManager.instance = new AuthTokenManager()
    }
    return AuthTokenManager.instance
  }

  /**
   * Decode JWT token payload
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token)
    if (!payload) return true

    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  isTokenExpiringSoon(token: string): boolean {
    const payload = this.decodeToken(token)
    if (!payload) return true

    const currentTime = Math.floor(Date.now() / 1000)
    const fiveMinutes = 5 * 60
    return payload.exp < (currentTime + fiveMinutes)
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken')
  }

  /**
   * Remove stored refresh token
   */
  removeRefreshToken(): void {
    localStorage.removeItem('refreshToken')
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    // If there's already a refresh in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken,
      })

      const { token, refreshToken: newRefreshToken, user } = response

      // Update stored tokens
      localStorage.setItem('refreshToken', newRefreshToken)

      // Update auth store
      const { login } = useAuthStore.getState()
      login(user, token)

      return token
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      this.removeRefreshToken()
      const { logout } = useAuthStore.getState()
      logout()
      
      throw new Error('Token refresh failed')
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh(): void {
    const checkAndRefreshToken = async () => {
      const { token, isAuthenticated } = useAuthStore.getState()
      
      if (!isAuthenticated || !token) {
        return
      }

      if (this.isTokenExpired(token)) {
        try {
          await this.refreshAccessToken()
        } catch (error) {
          console.error('Failed to refresh expired token:', error)
        }
      } else if (this.isTokenExpiringSoon(token)) {
        try {
          await this.refreshAccessToken()
        } catch (error) {
          console.error('Failed to refresh expiring token:', error)
        }
      }
    }

    // Check token every minute
    setInterval(checkAndRefreshToken, 60 * 1000)

    // Check token on page focus
    window.addEventListener('focus', checkAndRefreshToken)

    // Initial check
    checkAndRefreshToken()
  }

  /**
   * Logout and clear all tokens
   */
  logout(): void {
    this.removeRefreshToken()
    const { logout } = useAuthStore.getState()
    logout()
  }
}

// Setup request interceptor to add auth token
apiClient.addRequestInterceptor((config) => {
  const { token } = useAuthStore.getState()
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
})

// Setup response interceptor to handle token refresh
apiClient.addResponseInterceptor(async (response) => {
  if (response.status === 401) {
    const tokenManager = AuthTokenManager.getInstance()
    const { isAuthenticated } = useAuthStore.getState()
    
    if (isAuthenticated) {
      try {
        await tokenManager.refreshAccessToken()
        // Retry the original request with new token
        const originalRequest = response.url
        if (originalRequest) {
          return fetch(originalRequest, {
            ...response,
            headers: {
              ...response.headers,
              Authorization: `Bearer ${useAuthStore.getState().token}`,
            },
          })
        }
      } catch (error) {
        // Refresh failed, logout user
        tokenManager.logout()
      }
    }
  }
  return response
})

export const authTokenManager = AuthTokenManager.getInstance()