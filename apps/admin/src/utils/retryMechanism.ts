export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  jitter?: boolean
  retryCondition?: (error: any) => boolean
  onRetry?: (attempt: number, error: any) => void
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: any
  attempts: number
  totalTime: number
}

/**
 * Exponential backoff retry mechanism
 */
export class RetryMechanism {
  private static defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true,
    retryCondition: (error: any) => {
      // Retry on network errors, 5xx server errors, and timeouts
      if (error?.name === 'NetworkError' || error?.name === 'TypeError') return true
      if (error?.status >= 500 && error?.status < 600) return true
      if (error?.code === 'NETWORK_ERROR' || error?.code === 'TIMEOUT') return true
      return false
    },
    onRetry: () => {}
  }

  /**
   * Execute a function with retry logic
   */
  static async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const opts = { ...this.defaultOptions, ...options }
    const startTime = Date.now()
    let lastError: any

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        const result = await fn()
        return {
          success: true,
          data: result,
          attempts: attempt,
          totalTime: Date.now() - startTime
        }
      } catch (error) {
        lastError = error
        
        // Don't retry if this is the last attempt or if retry condition fails
        if (attempt === opts.maxAttempts || !opts.retryCondition(error)) {
          break
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, opts)
        
        // Call retry callback
        opts.onRetry(attempt, error)
        
        // Wait before retrying
        await this.sleep(delay)
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: opts.maxAttempts,
      totalTime: Date.now() - startTime
    }
  }

  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private static calculateDelay(attempt: number, options: Required<RetryOptions>): number {
    let delay = options.baseDelay * Math.pow(options.backoffFactor, attempt - 1)
    
    // Apply maximum delay limit
    delay = Math.min(delay, options.maxDelay)
    
    // Add jitter to prevent thundering herd
    if (options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5)
    }
    
    return Math.floor(delay)
  }

  /**
   * Sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Hook for using retry mechanism in React components
 */
export const useRetry = () => {
  const retry = async <T>(
    fn: () => Promise<T>,
    options?: RetryOptions
  ): Promise<RetryResult<T>> => {
    return RetryMechanism.execute(fn, options)
  }

  return { retry }
}

/**
 * Retry wrapper for fetch requests
 */
export const retryFetch = async (
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> => {
  const result = await RetryMechanism.execute(
    () => fetch(url, init),
    {
      ...options,
      retryCondition: (error) => {
        // Retry on network errors or 5xx status codes
        if (error?.name === 'TypeError' || error?.name === 'NetworkError') return true
        if (error?.status >= 500) return true
        return false
      }
    }
  )

  if (result.success && result.data) {
    return result.data
  }

  throw result.error
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000,
    private monitoringPeriod = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }

  reset() {
    this.failures = 0
    this.lastFailureTime = 0
    this.state = 'CLOSED'
  }
}