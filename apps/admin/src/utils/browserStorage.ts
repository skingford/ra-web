// Browser storage utilities for user preferences and caching
import { z } from 'zod'

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'admin-dashboard-user-preferences',
  UI_STATE: 'admin-dashboard-ui-state',
  CACHE_VERSION: 'admin-dashboard-cache-version',
  OFFLINE_DATA: 'admin-dashboard-offline-data',
  PERFORMANCE_METRICS: 'admin-dashboard-performance-metrics',
} as const

// User preferences schema
const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  currency: z.string().default('USD'),
  pageSize: z.number().min(10).max(100).default(25),
  sidebarCollapsed: z.boolean().default(false),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    desktop: z.boolean().default(false),
  }).default({}),
  dashboard: z.object({
    layout: z.enum(['grid', 'list']).default('grid'),
    refreshInterval: z.number().min(30).max(300).default(60), // seconds
    showWelcome: z.boolean().default(true),
  }).default({}),
  tables: z.object({
    density: z.enum(['compact', 'normal', 'comfortable']).default('normal'),
    showRowNumbers: z.boolean().default(false),
    stickyHeader: z.boolean().default(true),
  }).default({}),
})

export type UserPreferences = z.infer<typeof UserPreferencesSchema>

// UI state schema
const UIStateSchema = z.object({
  lastVisitedPage: z.string().optional(),
  openTabs: z.array(z.string()).default([]),
  recentSearches: z.array(z.string()).max(10).default([]),
  favoritePages: z.array(z.string()).default([]),
  columnWidths: z.record(z.string(), z.number()).default({}),
  filterStates: z.record(z.string(), z.any()).default({}),
  sortStates: z.record(z.string(), z.object({
    column: z.string(),
    direction: z.enum(['asc', 'desc']),
  })).default({}),
})

export type UIState = z.infer<typeof UIStateSchema>

// Storage interface
interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

// Storage adapters
class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  }

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }
}

class SessionStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value)
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error)
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error)
    }
  }

  clear(): void {
    try {
      sessionStorage.clear()
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error)
    }
  }
}

// In-memory fallback for environments without storage
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>()

  getItem(key: string): string | null {
    return this.storage.get(key) || null
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value)
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }
}

// Storage manager class
class StorageManager {
  private adapter: StorageAdapter

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter
  }

  // Generic get method with schema validation
  get<T>(key: string, schema: z.ZodSchema<T>, defaultValue: T): T {
    try {
      const stored = this.adapter.getItem(key)
      if (!stored) return defaultValue

      const parsed = JSON.parse(stored)
      const result = schema.safeParse(parsed)
      
      if (result.success) {
        return result.data
      } else {
        console.warn(`Invalid stored data for key ${key}:`, result.error)
        return defaultValue
      }
    } catch (error) {
      console.warn(`Failed to get ${key} from storage:`, error)
      return defaultValue
    }
  }

  // Generic set method
  set<T>(key: string, value: T, schema?: z.ZodSchema<T>): boolean {
    try {
      // Validate before storing if schema provided
      if (schema) {
        const result = schema.safeParse(value)
        if (!result.success) {
          console.warn(`Invalid data for key ${key}:`, result.error)
          return false
        }
      }

      this.adapter.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Failed to set ${key} in storage:`, error)
      return false
    }
  }

  // Update method for partial updates
  update<T>(key: string, updates: Partial<T>, schema: z.ZodSchema<T>, defaultValue: T): boolean {
    const current = this.get(key, schema, defaultValue)
    const updated = { ...current, ...updates }
    return this.set(key, updated, schema)
  }

  // Remove method
  remove(key: string): void {
    this.adapter.removeItem(key)
  }

  // Clear all storage
  clear(): void {
    this.adapter.clear()
  }
}

// Create storage instances
const createStorageManager = (): StorageManager => {
  if (typeof window !== 'undefined') {
    try {
      // Test localStorage availability
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      return new StorageManager(new LocalStorageAdapter())
    } catch {
      try {
        // Fallback to sessionStorage
        sessionStorage.setItem('test', 'test')
        sessionStorage.removeItem('test')
        return new StorageManager(new SessionStorageAdapter())
      } catch {
        // Fallback to memory storage
        return new StorageManager(new MemoryStorageAdapter())
      }
    }
  }
  
  // Server-side fallback
  return new StorageManager(new MemoryStorageAdapter())
}

export const storage = createStorageManager()

// User preferences utilities
export const userPreferences = {
  get: (): UserPreferences => {
    return storage.get(
      STORAGE_KEYS.USER_PREFERENCES,
      UserPreferencesSchema,
      UserPreferencesSchema.parse({})
    )
  },

  set: (preferences: Partial<UserPreferences>): boolean => {
    return storage.update(
      STORAGE_KEYS.USER_PREFERENCES,
      preferences,
      UserPreferencesSchema,
      UserPreferencesSchema.parse({})
    )
  },

  reset: (): boolean => {
    return storage.set(
      STORAGE_KEYS.USER_PREFERENCES,
      UserPreferencesSchema.parse({}),
      UserPreferencesSchema
    )
  },

  // Specific preference getters/setters
  getTheme: () => userPreferences.get().theme,
  setTheme: (theme: UserPreferences['theme']) => userPreferences.set({ theme }),
  
  getPageSize: () => userPreferences.get().pageSize,
  setPageSize: (pageSize: number) => userPreferences.set({ pageSize }),
  
  getSidebarCollapsed: () => userPreferences.get().sidebarCollapsed,
  setSidebarCollapsed: (collapsed: boolean) => userPreferences.set({ sidebarCollapsed: collapsed }),
}

// UI state utilities
export const uiState = {
  get: (): UIState => {
    return storage.get(
      STORAGE_KEYS.UI_STATE,
      UIStateSchema,
      UIStateSchema.parse({})
    )
  },

  set: (state: Partial<UIState>): boolean => {
    return storage.update(
      STORAGE_KEYS.UI_STATE,
      state,
      UIStateSchema,
      UIStateSchema.parse({})
    )
  },

  // Specific state methods
  addRecentSearch: (search: string): boolean => {
    const current = uiState.get()
    const searches = [search, ...current.recentSearches.filter(s => s !== search)].slice(0, 10)
    return uiState.set({ recentSearches: searches })
  },

  setLastVisitedPage: (page: string): boolean => {
    return uiState.set({ lastVisitedPage: page })
  },

  addFavoritePage: (page: string): boolean => {
    const current = uiState.get()
    if (!current.favoritePages.includes(page)) {
      return uiState.set({ favoritePages: [...current.favoritePages, page] })
    }
    return true
  },

  removeFavoritePage: (page: string): boolean => {
    const current = uiState.get()
    return uiState.set({ 
      favoritePages: current.favoritePages.filter(p => p !== page) 
    })
  },

  setColumnWidth: (table: string, column: string, width: number): boolean => {
    const current = uiState.get()
    const key = `${table}.${column}`
    return uiState.set({ 
      columnWidths: { ...current.columnWidths, [key]: width } 
    })
  },

  getColumnWidth: (table: string, column: string): number | undefined => {
    const current = uiState.get()
    return current.columnWidths[`${table}.${column}`]
  },
}

// Cache versioning for invalidation
export const cacheVersion = {
  get: (): string => {
    return storage.get(STORAGE_KEYS.CACHE_VERSION, z.string(), '1.0.0')
  },

  set: (version: string): boolean => {
    return storage.set(STORAGE_KEYS.CACHE_VERSION, version)
  },

  check: (expectedVersion: string): boolean => {
    const currentVersion = cacheVersion.get()
    if (currentVersion !== expectedVersion) {
      // Clear cache if version mismatch
      storage.clear()
      cacheVersion.set(expectedVersion)
      return false
    }
    return true
  },
}

// Performance metrics storage
export const performanceMetrics = {
  record: (metric: {
    page: string
    loadTime: number
    renderTime: number
    timestamp: number
  }): boolean => {
    const current = storage.get(STORAGE_KEYS.PERFORMANCE_METRICS, z.array(z.any()), [])
    const updated = [...current, metric].slice(-100) // Keep last 100 metrics
    return storage.set(STORAGE_KEYS.PERFORMANCE_METRICS, updated)
  },

  get: () => {
    return storage.get(STORAGE_KEYS.PERFORMANCE_METRICS, z.array(z.any()), [])
  },

  clear: (): void => {
    storage.remove(STORAGE_KEYS.PERFORMANCE_METRICS)
  },
}

// Storage event listeners for cross-tab synchronization
export const storageEvents = {
  listen: (callback: (key: string, newValue: any, oldValue: any) => void) => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && Object.values(STORAGE_KEYS).includes(event.key as any)) {
        try {
          const oldValue = event.oldValue ? JSON.parse(event.oldValue) : null
          const newValue = event.newValue ? JSON.parse(event.newValue) : null
          callback(event.key, newValue, oldValue)
        } catch (error) {
          console.warn('Failed to parse storage event:', error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }

    return () => {}
  },
}

// Export default storage utilities
export default {
  storage,
  userPreferences,
  uiState,
  cacheVersion,
  performanceMetrics,
  storageEvents,
}