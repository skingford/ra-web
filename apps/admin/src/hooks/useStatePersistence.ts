// State persistence hooks for Zustand stores
import { useEffect, useCallback, useState } from 'react'
import { StateCreator } from 'zustand'
import { userPreferences, uiState, storageEvents } from '../utils/browserStorage'

// Persistence middleware for Zustand
export interface PersistOptions<T> {
  name: string
  storage?: {
    getItem: (name: string) => T | null
    setItem: (name: string, value: T) => void
    removeItem: (name: string) => void
  }
  partialize?: (state: T) => Partial<T>
  onRehydrateStorage?: (state: T) => void
  version?: number
  migrate?: (persistedState: any, version: number) => T
  skipHydration?: boolean
}

// Create persistence middleware
export const createPersistMiddleware = <T>(
  config: StateCreator<T>,
  options: PersistOptions<T>
): StateCreator<T> => {
  return (set, get, api) => {
    const { name, storage, partialize, onRehydrateStorage, version = 0 } = options

    // Default storage implementation
    const defaultStorage = {
      getItem: (name: string): T | null => {
        try {
          const item = localStorage.getItem(name)
          return item ? JSON.parse(item) : null
        } catch {
          return null
        }
      },
      setItem: (name: string, value: T): void => {
        try {
          localStorage.setItem(name, JSON.stringify(value))
        } catch (error) {
          console.warn('Failed to persist state:', error)
        }
      },
      removeItem: (name: string): void => {
        try {
          localStorage.removeItem(name)
        } catch (error) {
          console.warn('Failed to remove persisted state:', error)
        }
      },
    }

    const persistStorage = storage || defaultStorage

    // Create the store
    const store = config(
      (partial, replace) => {
        set(partial, replace)
        
        // Persist state after each update
        const state = get()
        const stateToPersist = partialize ? partialize(state) : state
        persistStorage.setItem(name, stateToPersist as T)
      },
      get,
      api
    )

    // Hydrate from storage
    if (!options.skipHydration) {
      try {
        const persistedState = persistStorage.getItem(name)
        if (persistedState) {
          const migratedState = options.migrate 
            ? options.migrate(persistedState, version)
            : persistedState

          // Merge persisted state with initial state
          Object.assign(store, migratedState)
          
          onRehydrateStorage?.(store)
        }
      } catch (error) {
        console.warn('Failed to hydrate state:', error)
      }
    }

    return store
  }
}

// Hook for syncing user preferences with Zustand store
export const useUserPreferencesSync = <T extends Record<string, any>>(
  store: T,
  updateStore: (updates: Partial<T>) => void
) => {
  // Sync preferences on mount
  useEffect(() => {
    const preferences = userPreferences.get()
    
    // Map preferences to store state
    const storeUpdates: Partial<T> = {}
    
    if ('theme' in store && preferences.theme) {
      (storeUpdates as any).theme = preferences.theme
    }
    
    if ('sidebarCollapsed' in store) {
      (storeUpdates as any).sidebarCollapsed = preferences.sidebarCollapsed
    }
    
    if ('pageSize' in store) {
      (storeUpdates as any).pageSize = preferences.pageSize
    }
    
    if (Object.keys(storeUpdates).length > 0) {
      updateStore(storeUpdates)
    }
  }, [store, updateStore])

  // Listen for cross-tab changes
  useEffect(() => {
    return storageEvents.listen((key, newValue) => {
      if (key === 'admin-dashboard-user-preferences' && newValue) {
        const storeUpdates: Partial<T> = {}
        
        if ('theme' in store && newValue.theme) {
          (storeUpdates as any).theme = newValue.theme
        }
        
        if ('sidebarCollapsed' in store) {
          (storeUpdates as any).sidebarCollapsed = newValue.sidebarCollapsed
        }
        
        if (Object.keys(storeUpdates).length > 0) {
          updateStore(storeUpdates)
        }
      }
    })
  }, [store, updateStore])

  // Return functions to update both store and preferences
  const updateTheme = useCallback((theme: string) => {
    updateStore({ theme } as Partial<T>)
    userPreferences.setTheme(theme as any)
  }, [updateStore])

  const updateSidebarCollapsed = useCallback((collapsed: boolean) => {
    updateStore({ sidebarCollapsed: collapsed } as Partial<T>)
    userPreferences.setSidebarCollapsed(collapsed)
  }, [updateStore])

  const updatePageSize = useCallback((pageSize: number) => {
    updateStore({ pageSize } as Partial<T>)
    userPreferences.setPageSize(pageSize)
  }, [updateStore])

  return {
    updateTheme,
    updateSidebarCollapsed,
    updatePageSize,
  }
}

// Hook for syncing UI state
export const useUIStateSync = <T extends Record<string, any>>(
  store: T,
  updateStore: (updates: Partial<T>) => void
) => {
  // Sync UI state on mount
  useEffect(() => {
    const state = uiState.get()
    
    const storeUpdates: Partial<T> = {}
    
    if ('lastVisitedPage' in store && state.lastVisitedPage) {
      (storeUpdates as any).lastVisitedPage = state.lastVisitedPage
    }
    
    if ('recentSearches' in store) {
      (storeUpdates as any).recentSearches = state.recentSearches
    }
    
    if ('favoritePages' in store) {
      (storeUpdates as any).favoritePages = state.favoritePages
    }
    
    if (Object.keys(storeUpdates).length > 0) {
      updateStore(storeUpdates)
    }
  }, [store, updateStore])

  // Return functions to update both store and UI state
  const updateLastVisitedPage = useCallback((page: string) => {
    updateStore({ lastVisitedPage: page } as Partial<T>)
    uiState.setLastVisitedPage(page)
  }, [updateStore])

  const addRecentSearch = useCallback((search: string) => {
    const current = uiState.get()
    const searches = [search, ...current.recentSearches.filter(s => s !== search)].slice(0, 10)
    updateStore({ recentSearches: searches } as Partial<T>)
    uiState.addRecentSearch(search)
  }, [updateStore])

  const addFavoritePage = useCallback((page: string) => {
    const current = uiState.get()
    if (!current.favoritePages.includes(page)) {
      const favorites = [...current.favoritePages, page]
      updateStore({ favoritePages: favorites } as Partial<T>)
      uiState.addFavoritePage(page)
    }
  }, [updateStore])

  const removeFavoritePage = useCallback((page: string) => {
    const current = uiState.get()
    const favorites = current.favoritePages.filter(p => p !== page)
    updateStore({ favoritePages: favorites } as Partial<T>)
    uiState.removeFavoritePage(page)
  }, [updateStore])

  return {
    updateLastVisitedPage,
    addRecentSearch,
    addFavoritePage,
    removeFavoritePage,
  }
}

// Hook for automatic state backup and restore
export const useStateBackup = <T>(
  state: T,
  backupKey: string,
  interval: number = 30000 // 30 seconds
) => {
  // Backup state periodically
  useEffect(() => {
    const backup = () => {
      try {
        localStorage.setItem(`backup-${backupKey}`, JSON.stringify({
          state,
          timestamp: Date.now(),
        }))
      } catch (error) {
        console.warn('Failed to backup state:', error)
      }
    }

    const intervalId = setInterval(backup, interval)
    
    // Backup on page unload
    const handleBeforeUnload = () => backup()
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [state, backupKey, interval])

  // Restore from backup
  const restoreFromBackup = useCallback((): T | null => {
    try {
      const backup = localStorage.getItem(`backup-${backupKey}`)
      if (backup) {
        const parsed = JSON.parse(backup)
        return parsed.state
      }
    } catch (error) {
      console.warn('Failed to restore from backup:', error)
    }
    return null
  }, [backupKey])

  // Clear backup
  const clearBackup = useCallback(() => {
    try {
      localStorage.removeItem(`backup-${backupKey}`)
    } catch (error) {
      console.warn('Failed to clear backup:', error)
    }
  }, [backupKey])

  return {
    restoreFromBackup,
    clearBackup,
  }
}

// Hook for state versioning and migration
export const useStateMigration = <T>(
  currentVersion: number,
  migrations: Record<number, (state: any) => T>
) => {
  const migrateState = useCallback((persistedState: any, version: number): T => {
    let state = persistedState
    
    // Apply migrations in order
    for (let v = version + 1; v <= currentVersion; v++) {
      if (migrations[v]) {
        state = migrations[v](state)
      }
    }
    
    return state
  }, [currentVersion, migrations])

  return { migrateState }
}

// Hook for optimistic state updates with rollback
export const useOptimisticState = <T>(
  initialState: T,
  persistKey?: string
) => {
  const [state, setState] = useState<T>(initialState)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, T>>(new Map())
  
  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((id: string, update: Partial<T>) => {
    const currentState = optimisticUpdates.get(id) || state
    const newState = { ...currentState, ...update }
    
    setOptimisticUpdates(prev => new Map(prev).set(id, newState))
    setState(newState)
  }, [state, optimisticUpdates])

  // Confirm optimistic update
  const confirmOptimisticUpdate = useCallback((id: string, finalState?: T) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
    
    if (finalState) {
      setState(finalState)
      
      // Persist if key provided
      if (persistKey) {
        try {
          localStorage.setItem(persistKey, JSON.stringify(finalState))
        } catch (error) {
          console.warn('Failed to persist optimistic state:', error)
        }
      }
    }
  }, [persistKey])

  // Rollback optimistic update
  const rollbackOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
    
    // Restore to last confirmed state
    const lastConfirmedState = Array.from(optimisticUpdates.values()).pop() || initialState
    setState(lastConfirmedState)
  }, [optimisticUpdates, initialState])

  return {
    state,
    setState,
    applyOptimisticUpdate,
    confirmOptimisticUpdate,
    rollbackOptimisticUpdate,
    hasOptimisticUpdates: optimisticUpdates.size > 0,
  }
}

export default {
  createPersistMiddleware,
  useUserPreferencesSync,
  useUIStateSync,
  useStateBackup,
  useStateMigration,
  useOptimisticState,
}