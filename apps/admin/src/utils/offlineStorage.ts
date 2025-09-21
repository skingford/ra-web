export interface OfflineOperation {
  id: string
  type: string
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
  priority: 'low' | 'medium' | 'high'
  endpoint?: string
  method?: string
}

export interface OfflineStorageOptions {
  maxOperations?: number
  maxAge?: number // in milliseconds
  storageKey?: string
}

/**
 * Offline storage manager for queuing operations when offline
 */
export class OfflineStorage {
  private storageKey: string
  private maxOperations: number
  private maxAge: number

  constructor(options: OfflineStorageOptions = {}) {
    this.storageKey = options.storageKey || 'offline_operations'
    this.maxOperations = options.maxOperations || 100
    this.maxAge = options.maxAge || 7 * 24 * 60 * 60 * 1000 // 7 days
  }

  /**
   * Add an operation to the offline queue
   */
  addOperation(operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const id = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullOperation: OfflineOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      retryCount: 0
    }

    const operations = this.getOperations()
    operations.push(fullOperation)

    // Sort by priority and timestamp
    operations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return a.timestamp - b.timestamp
    })

    // Limit the number of operations
    if (operations.length > this.maxOperations) {
      operations.splice(this.maxOperations)
    }

    this.saveOperations(operations)
    return id
  }

  /**
   * Get all pending operations
   */
  getOperations(): OfflineOperation[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []

      const operations: OfflineOperation[] = JSON.parse(stored)
      
      // Filter out expired operations
      const now = Date.now()
      return operations.filter(op => (now - op.timestamp) < this.maxAge)
    } catch (error) {
      console.error('Failed to load offline operations:', error)
      return []
    }
  }

  /**
   * Remove an operation from the queue
   */
  removeOperation(id: string): void {
    const operations = this.getOperations().filter(op => op.id !== id)
    this.saveOperations(operations)
  }

  /**
   * Update an operation (e.g., increment retry count)
   */
  updateOperation(id: string, updates: Partial<OfflineOperation>): void {
    const operations = this.getOperations()
    const index = operations.findIndex(op => op.id === id)
    
    if (index !== -1) {
      operations[index] = { ...operations[index], ...updates }
      this.saveOperations(operations)
    }
  }

  /**
   * Clear all operations
   */
  clearOperations(): void {
    localStorage.removeItem(this.storageKey)
  }

  /**
   * Get operations by type
   */
  getOperationsByType(type: string): OfflineOperation[] {
    return this.getOperations().filter(op => op.type === type)
  }

  /**
   * Get operations count
   */
  getOperationsCount(): number {
    return this.getOperations().length
  }

  /**
   * Save operations to localStorage
   */
  private saveOperations(operations: OfflineOperation[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(operations))
    } catch (error) {
      console.error('Failed to save offline operations:', error)
    }
  }
}

/**
 * Hook for using offline storage in React components
 */
export const useOfflineStorage = (options?: OfflineStorageOptions) => {
  const storage = new OfflineStorage(options)

  const addOperation = (operation: Omit<OfflineOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    return storage.addOperation(operation)
  }

  const getOperations = () => {
    return storage.getOperations()
  }

  const removeOperation = (id: string) => {
    storage.removeOperation(id)
  }

  const updateOperation = (id: string, updates: Partial<OfflineOperation>) => {
    storage.updateOperation(id, updates)
  }

  const clearOperations = () => {
    storage.clearOperations()
  }

  return {
    addOperation,
    getOperations,
    removeOperation,
    updateOperation,
    clearOperations,
    getOperationsCount: () => storage.getOperationsCount(),
    getOperationsByType: (type: string) => storage.getOperationsByType(type)
  }
}

/**
 * Offline-aware API client
 */
export class OfflineApiClient {
  private offlineStorage: OfflineStorage
  private isOnline: boolean = navigator.onLine

  constructor(storageOptions?: OfflineStorageOptions) {
    this.offlineStorage = new OfflineStorage(storageOptions)
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processOfflineQueue()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  /**
   * Make an API request with offline support
   */
  async request<T>(
    endpoint: string,
    options: RequestInit & { 
      priority?: 'low' | 'medium' | 'high'
      offlineSupport?: boolean 
    } = {}
  ): Promise<T> {
    const { priority = 'medium', offlineSupport = true, ...fetchOptions } = options

    if (this.isOnline) {
      try {
        const response = await fetch(endpoint, fetchOptions)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return await response.json()
      } catch (error) {
        // If request fails and offline support is enabled, queue it
        if (offlineSupport && this.shouldQueueOperation(error)) {
          this.queueOperation(endpoint, fetchOptions, priority)
        }
        throw error
      }
    } else {
      // Queue operation for later if offline support is enabled
      if (offlineSupport) {
        this.queueOperation(endpoint, fetchOptions, priority)
        throw new Error('Currently offline. Operation queued for retry.')
      } else {
        throw new Error('No internet connection')
      }
    }
  }

  /**
   * Process queued operations when coming back online
   */
  private async processOfflineQueue(): Promise<void> {
    const operations = this.offlineStorage.getOperations()
    
    for (const operation of operations) {
      try {
        if (operation.endpoint) {
          const response = await fetch(operation.endpoint, {
            method: operation.method || 'GET',
            ...operation.data
          })
          
          if (response.ok) {
            this.offlineStorage.removeOperation(operation.id)
          } else {
            this.handleFailedOperation(operation)
          }
        }
      } catch (error) {
        this.handleFailedOperation(operation)
      }
    }
  }

  /**
   * Queue an operation for offline processing
   */
  private queueOperation(
    endpoint: string,
    options: RequestInit,
    priority: 'low' | 'medium' | 'high'
  ): void {
    this.offlineStorage.addOperation({
      type: 'api_request',
      data: options,
      priority,
      maxRetries: 3,
      endpoint,
      method: options.method || 'GET'
    })
  }

  /**
   * Handle failed operation retry
   */
  private handleFailedOperation(operation: OfflineOperation): void {
    if (operation.retryCount < operation.maxRetries) {
      this.offlineStorage.updateOperation(operation.id, {
        retryCount: operation.retryCount + 1
      })
    } else {
      // Max retries reached, remove operation
      this.offlineStorage.removeOperation(operation.id)
    }
  }

  /**
   * Determine if an operation should be queued based on the error
   */
  private shouldQueueOperation(error: any): boolean {
    // Queue on network errors or 5xx server errors
    return (
      error?.name === 'TypeError' ||
      error?.name === 'NetworkError' ||
      (error?.status >= 500 && error?.status < 600)
    )
  }

  /**
   * Get pending operations count
   */
  getPendingOperationsCount(): number {
    return this.offlineStorage.getOperationsCount()
  }

  /**
   * Clear all pending operations
   */
  clearPendingOperations(): void {
    this.offlineStorage.clearOperations()
  }
}