// API client configuration and utilities
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

class ApiClient {
  private baseURL: string
  private defaultHeaders: Record<string, string>

  constructor(baseURL = '/api') {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Get token from auth store if available
    const token = localStorage.getItem('auth-storage')
    let authToken = null
    if (token) {
      try {
        const parsed = JSON.parse(token)
        authToken = parsed.state?.token
      } catch (e) {
        // Ignore parsing errors
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
          timestamp: new Date().toISOString(),
        }))
        
        throw new Error(JSON.stringify({
          status: response.status,
          ...errorData,
        }))
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : ''
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint
    
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const config: RequestInit = {
      method: 'POST',
    }
    if (data) {
      config.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, config)
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const config: RequestInit = {
      method: 'PUT',
    }
    if (data) {
      config.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, config)
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const config: RequestInit = {
      method: 'PATCH',
    }
    if (data) {
      config.body = JSON.stringify(data)
    }
    return this.request<T>(endpoint, config)
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()

// Query key factories for consistent caching
export const queryKeys = {
  all: ['api'] as const,
  users: () => [...queryKeys.all, 'users'] as const,
  user: (id: string) => [...queryKeys.users(), id] as const,
  userList: (params?: Record<string, any>) => [...queryKeys.users(), 'list', params] as const,
  
  // Add more query key factories as needed
  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  analytics: () => [...queryKeys.all, 'analytics'] as const,
}