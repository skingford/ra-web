import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OfflineStorage } from '../offlineStorage'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('OfflineStorage', () => {
  let offlineStorage: OfflineStorage

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    offlineStorage = new OfflineStorage()
  })

  it('should add an operation', () => {
    const operation = {
      type: 'create',
      data: { test: 'data' },
      priority: 'medium' as const,
      maxRetries: 3
    }

    const id = offlineStorage.addOperation(operation)

    expect(id).toMatch(/^offline_\d+_[a-z0-9]+$/)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'offline_operations',
      expect.stringContaining('"type":"create"')
    )
  })

  it('should get operations from localStorage', () => {
    const mockOperations = [
      {
        id: 'test-1',
        type: 'create',
        data: { test: 'data' },
        priority: 'high',
        maxRetries: 3,
        retryCount: 0,
        timestamp: Date.now()
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockOperations))

    const operations = offlineStorage.getOperations()

    expect(operations).toEqual(mockOperations)
    expect(localStorageMock.getItem).toHaveBeenCalledWith('offline_operations')
  })

  it('should return empty array when no operations exist', () => {
    localStorageMock.getItem.mockReturnValue(null)

    const operations = offlineStorage.getOperations()

    expect(operations).toEqual([])
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    const operations = offlineStorage.getOperations()

    expect(operations).toEqual([])
  })

  it('should remove an operation', () => {
    const mockOperations = [
      {
        id: 'test-1',
        type: 'create',
        data: { test: 'data' },
        priority: 'high',
        maxRetries: 3,
        retryCount: 0,
        timestamp: Date.now()
      },
      {
        id: 'test-2',
        type: 'update',
        data: { test: 'data2' },
        priority: 'medium',
        maxRetries: 3,
        retryCount: 0,
        timestamp: Date.now()
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockOperations))

    offlineStorage.removeOperation('test-1')

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'offline_operations',
      expect.stringContaining('"id":"test-2"')
    )
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'offline_operations',
      expect.not.stringContaining('"id":"test-1"')
    )
  })

  it('should update an operation', () => {
    const mockOperations = [
      {
        id: 'test-1',
        type: 'create',
        data: { test: 'data' },
        priority: 'high',
        maxRetries: 3,
        retryCount: 0,
        timestamp: Date.now()
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockOperations))

    offlineStorage.updateOperation('test-1', { retryCount: 1 })

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'offline_operations',
      expect.stringContaining('"retryCount":1')
    )
  })

  it('should clear all operations', () => {
    offlineStorage.clearOperations()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('offline_operations')
  })

  it('should get operations by type', () => {
    const mockOperations = [
      {
        id: 'test-1',
        type: 'create',
        data: { test: 'data' },
        priority: 'high',
        maxRetries: 3,
        retryCount: 0,
        timestamp: Date.now()
      },
      {
        id: 'test-2',
        type: 'update',
        data: { test: 'data2' },
        priority: 'medium',
        maxRetries: 3,
        retryCount: 0,
        timestamp: Date.now()
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockOperations))

    const createOperations = offlineStorage.getOperationsByType('create')

    expect(createOperations).toHaveLength(1)
    expect(createOperations[0].type).toBe('create')
  })

  it('should get operations count', () => {
    const mockOperations = [
      {
        id: 'test-1',
        type: 'create',
        data: { test: 'data' },
        priority: 'high',
        maxRetries: 3,
        retryCount: 0,
        timestamp: Date.now()
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockOperations))

    const count = offlineStorage.getOperationsCount()

    expect(count).toBe(1)
  })

  it('should filter out expired operations', () => {
    const now = Date.now()
    const mockOperations = [
      {
        id: 'test-1',
        type: 'create',
        data: { test: 'data' },
        priority: 'high',
        maxRetries: 3,
        retryCount: 0,
        timestamp: now - (8 * 24 * 60 * 60 * 1000) // 8 days ago (expired)
      },
      {
        id: 'test-2',
        type: 'update',
        data: { test: 'data2' },
        priority: 'medium',
        maxRetries: 3,
        retryCount: 0,
        timestamp: now - (1 * 24 * 60 * 60 * 1000) // 1 day ago (valid)
      }
    ]

    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockOperations))

    const operations = offlineStorage.getOperations()

    expect(operations).toHaveLength(1)
    expect(operations[0].id).toBe('test-2')
  })

  it('should sort operations by priority and timestamp', () => {
    const now = Date.now()
    
    const operation1 = {
      type: 'create',
      data: { test: 'data1' },
      priority: 'low' as const,
      maxRetries: 3
    }
    
    const operation2 = {
      type: 'update',
      data: { test: 'data2' },
      priority: 'high' as const,
      maxRetries: 3
    }
    
    const operation3 = {
      type: 'delete',
      data: { test: 'data3' },
      priority: 'medium' as const,
      maxRetries: 3
    }

    // Add operations in low->high->medium order
    offlineStorage.addOperation(operation1)
    offlineStorage.addOperation(operation2)
    offlineStorage.addOperation(operation3)

    // Mock the stored operations to verify sorting
    const storedOperations = JSON.parse(localStorageMock.setItem.mock.calls[2][1])
    
    // Should be sorted: high, medium, low
    expect(storedOperations[0].priority).toBe('high')
    expect(storedOperations[1].priority).toBe('medium')
    expect(storedOperations[2].priority).toBe('low')
  })

  it('should limit the number of operations', () => {
    const limitedStorage = new OfflineStorage({ maxOperations: 2 })
    
    // Add 3 operations
    limitedStorage.addOperation({
      type: 'create',
      data: { test: 'data1' },
      priority: 'low',
      maxRetries: 3
    })
    
    limitedStorage.addOperation({
      type: 'update',
      data: { test: 'data2' },
      priority: 'medium',
      maxRetries: 3
    })
    
    limitedStorage.addOperation({
      type: 'delete',
      data: { test: 'data3' },
      priority: 'high',
      maxRetries: 3
    })

    // Should only keep 2 operations (highest priority ones)
    const storedOperations = JSON.parse(localStorageMock.setItem.mock.calls[2][1])
    expect(storedOperations).toHaveLength(2)
  })
})