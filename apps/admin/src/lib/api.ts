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
  private requestInterceptors: Array<(config: RequestInit) => RequestInit> = []
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = []

  constructor(baseURL = '/api') {
    this.baseURL = baseURL
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Add request interceptor
  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit) {
    this.requestInterceptors.push(interceptor)
  }

  // Add response interceptor
  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>) {
    this.responseInterceptors.push(interceptor)
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

    let config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
    }

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = interceptor(config)
    }

    try {
      let response = await fetch(url, config)
      
      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response)
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
          timestamp: new Date().toISOString(),
        }))
        
        const apiError: ApiError & { status: number } = {
          status: response.status,
          code: errorData.code || `HTTP_${response.status}`,
          message: errorData.message || response.statusText,
          details: errorData.details,
          timestamp: errorData.timestamp || new Date().toISOString(),
        }
        
        throw new Error(JSON.stringify(apiError))
      }

      const data = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a network error
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error(JSON.stringify({
            code: 'NETWORK_ERROR',
            message: 'Network connection failed. Please check your internet connection.',
            timestamp: new Date().toISOString(),
          }))
        }
        throw error
      }
      throw new Error(JSON.stringify({
        code: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        timestamp: new Date().toISOString(),
      }))
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
  
  // User-related queries
  users: () => [...queryKeys.all, 'users'] as const,
  user: (id: string) => [...queryKeys.users(), id] as const,
  userList: (params?: Record<string, any>) => [...queryKeys.users(), 'list', params] as const,
  userProfile: () => [...queryKeys.users(), 'profile'] as const,
  
  // Dashboard queries
  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  dashboardMetrics: () => [...queryKeys.dashboard(), 'metrics'] as const,
  dashboardCharts: (timeRange?: string) => [...queryKeys.dashboard(), 'charts', timeRange] as const,
  
  // Analytics queries
  analytics: () => [...queryKeys.all, 'analytics'] as const,
  analyticsReport: (reportType: string, params?: Record<string, any>) => 
    [...queryKeys.analytics(), reportType, params] as const,
  
  // Settings queries
  settings: () => [...queryKeys.all, 'settings'] as const,
  systemSettings: () => [...queryKeys.settings(), 'system'] as const,
  userSettings: () => [...queryKeys.settings(), 'user'] as const,
  
  // Notifications queries
  notifications: () => [...queryKeys.all, 'notifications'] as const,
  notificationList: (params?: Record<string, any>) => 
    [...queryKeys.notifications(), 'list', params] as const,
  
  // Generic list query factory
  list: (resource: string, params?: Record<string, any>) => 
    [...queryKeys.all, resource, 'list', params] as const,
  
  // Generic detail query factory
  detail: (resource: string, id: string) => 
    [...queryKeys.all, resource, id] as const,
}

// Query key utilities
export const queryKeyUtils = {
  // Invalidate all queries for a resource
  invalidateResource: (resource: string) => {
    return [...queryKeys.all, resource]
  },
  
  // Get all query keys for a resource
  getResourceKeys: (resource: string) => {
    return [...queryKeys.all, resource]
  },
  
  // Create custom query key
  custom: (...keys: (string | number | Record<string, any>)[]) => {
    return [...queryKeys.all, ...keys] as const
  },
}