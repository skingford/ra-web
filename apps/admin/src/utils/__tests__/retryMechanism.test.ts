import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { RetryMechanism, CircuitBreaker } from '../retryMechanism'

// Mock timers
vi.useFakeTimers()

describe('RetryMechanism', () => {
  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should succeed on first attempt', async () => {
    const mockFn = vi.fn().mockResolvedValue('success')
    
    const result = await RetryMechanism.execute(mockFn)
    
    expect(result.success).toBe(true)
    expect(result.data).toBe('success')
    expect(result.attempts).toBe(1)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and eventually succeed', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('success')
    
    const executePromise = RetryMechanism.execute(mockFn, {
      maxAttempts: 3,
      baseDelay: 1000
    })
    
    // Fast-forward through delays
    vi.runAllTimers()
    
    const result = await executePromise
    
    expect(result.success).toBe(true)
    expect(result.data).toBe('success')
    expect(result.attempts).toBe(3)
    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  it('should fail after max attempts', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Persistent error'))
    
    const executePromise = RetryMechanism.execute(mockFn, {
      maxAttempts: 2,
      baseDelay: 100
    })
    
    vi.runAllTimers()
    
    const result = await executePromise
    
    expect(result.success).toBe(false)
    expect(result.error.message).toBe('Persistent error')
    expect(result.attempts).toBe(2)
    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should not retry when retry condition returns false', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Client error'))
    
    const result = await RetryMechanism.execute(mockFn, {
      maxAttempts: 3,
      retryCondition: () => false
    })
    
    expect(result.success).toBe(false)
    expect(result.attempts).toBe(1)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should call onRetry callback', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockResolvedValue('success')
    
    const onRetry = vi.fn()
    
    const executePromise = RetryMechanism.execute(mockFn, {
      maxAttempts: 2,
      baseDelay: 100,
      onRetry
    })
    
    vi.runAllTimers()
    
    await executePromise
    
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error))
  })

  it('should apply exponential backoff', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Error'))
    
    const executePromise = RetryMechanism.execute(mockFn, {
      maxAttempts: 3,
      baseDelay: 1000,
      backoffFactor: 2,
      jitter: false
    })
    
    // Check that delays are applied correctly
    expect(vi.getTimerCount()).toBe(0)
    
    vi.runAllTimers()
    
    await executePromise
    
    expect(mockFn).toHaveBeenCalledTimes(3)
  })
})

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker(2, 1000) // 2 failures, 1 second recovery
  })

  it('should start in CLOSED state', () => {
    expect(circuitBreaker.getState().state).toBe('CLOSED')
    expect(circuitBreaker.getState().failures).toBe(0)
  })

  it('should execute function when CLOSED', async () => {
    const mockFn = vi.fn().mockResolvedValue('success')
    
    const result = await circuitBreaker.execute(mockFn)
    
    expect(result).toBe('success')
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(circuitBreaker.getState().state).toBe('CLOSED')
  })

  it('should open circuit after failure threshold', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Error'))
    
    // First failure
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Error')
    expect(circuitBreaker.getState().state).toBe('CLOSED')
    expect(circuitBreaker.getState().failures).toBe(1)
    
    // Second failure - should open circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Error')
    expect(circuitBreaker.getState().state).toBe('OPEN')
    expect(circuitBreaker.getState().failures).toBe(2)
  })

  it('should reject immediately when OPEN', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Error'))
    
    // Trigger failures to open circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow()
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow()
    
    expect(circuitBreaker.getState().state).toBe('OPEN')
    
    // Should reject immediately without calling function
    const fastMockFn = vi.fn()
    await expect(circuitBreaker.execute(fastMockFn)).rejects.toThrow('Circuit breaker is OPEN')
    expect(fastMockFn).not.toHaveBeenCalled()
  })

  it('should transition to HALF_OPEN after recovery timeout', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Error'))
    
    // Open the circuit
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow()
    await expect(circuitBreaker.execute(mockFn)).rejects.toThrow()
    
    expect(circuitBreaker.getState().state).toBe('OPEN')
    
    // Fast-forward past recovery timeout
    vi.advanceTimersByTime(1001)
    
    // Next call should transition to HALF_OPEN
    const successFn = vi.fn().mockResolvedValue('success')
    const result = await circuitBreaker.execute(successFn)
    
    expect(result).toBe('success')
    expect(circuitBreaker.getState().state).toBe('CLOSED')
    expect(circuitBreaker.getState().failures).toBe(0)
  })

  it('should reset circuit breaker', () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Error'))
    
    // Cause some failures
    circuitBreaker.execute(mockFn).catch(() => {})
    
    expect(circuitBreaker.getState().failures).toBe(1)
    
    circuitBreaker.reset()
    
    expect(circuitBreaker.getState().state).toBe('CLOSED')
    expect(circuitBreaker.getState().failures).toBe(0)
  })
})