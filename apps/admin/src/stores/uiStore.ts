import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { Notification, BreadcrumbItem, ModalState } from './types'
import { userPreferences, uiState } from '../utils/browserStorage'

interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  notifications: Notification[]
  modals: ModalState[]
  breadcrumbs: BreadcrumbItem[]
  pageSize: number
  recentSearches: string[]
  favoritePages: string[]
  lastVisitedPage?: string
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
  openModal: (id: string, data?: any) => void
  closeModal: (id: string) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  setPageSize: (size: number) => void
  addRecentSearch: (search: string) => void
  clearRecentSearches: () => void
  addFavoritePage: (page: string) => void
  removeFavoritePage: (page: string) => void
  setLastVisitedPage: (page: string) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State - Initialize from browser storage
        sidebarCollapsed: userPreferences.getSidebarCollapsed(),
        theme: userPreferences.getTheme(),
        notifications: [],
        modals: [],
        breadcrumbs: [],
        pageSize: userPreferences.getPageSize(),
        recentSearches: uiState.get().recentSearches,
        favoritePages: uiState.get().favoritePages,
        lastVisitedPage: uiState.get().lastVisitedPage,

        // Actions
        toggleSidebar: () => {
          const newCollapsed = !get().sidebarCollapsed
          set({ sidebarCollapsed: newCollapsed })
          userPreferences.setSidebarCollapsed(newCollapsed)
        },

        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed })
          userPreferences.setSidebarCollapsed(collapsed)
        },

        toggleTheme: () => {
          const currentTheme = get().theme
          const newTheme = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light'
          set({ theme: newTheme })
          userPreferences.setTheme(newTheme)
        },

        setTheme: (theme) => {
          set({ theme })
          userPreferences.setTheme(theme)
        },

        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            read: false,
          }
          set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50), // Limit to 50 notifications
          }))

          // Auto-remove notification after duration
          if (notification.type !== 'error') {
            setTimeout(() => {
              get().removeNotification(newNotification.id)
            }, 5000)
          }
        },

        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }))
        },

        markNotificationAsRead: (id) => {
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          }))
        },

        clearAllNotifications: () => {
          set({ notifications: [] })
        },

        openModal: (id, data) => {
          set((state) => {
            const existingModal = state.modals.find((m) => m.id === id)
            if (existingModal) {
              return {
                modals: state.modals.map((m) =>
                  m.id === id ? { ...m, isOpen: true, data } : m
                ),
              }
            }
            return {
              modals: [...state.modals, { id, isOpen: true, data }],
            }
          })
        },

        closeModal: (id) => {
          set((state) => ({
            modals: state.modals.map((m) =>
              m.id === id ? { ...m, isOpen: false } : m
            ),
          }))
        },

        setBreadcrumbs: (breadcrumbs) => {
          set({ breadcrumbs })
        },

        setPageSize: (size) => {
          set({ pageSize: size })
          userPreferences.setPageSize(size)
        },

        addRecentSearch: (search) => {
          const current = get().recentSearches
          const searches = [search, ...current.filter(s => s !== search)].slice(0, 10)
          set({ recentSearches: searches })
          uiState.addRecentSearch(search)
        },

        clearRecentSearches: () => {
          set({ recentSearches: [] })
          uiState.set({ recentSearches: [] })
        },

        addFavoritePage: (page) => {
          const current = get().favoritePages
          if (!current.includes(page)) {
            const favorites = [...current, page]
            set({ favoritePages: favorites })
            uiState.addFavoritePage(page)
          }
        },

        removeFavoritePage: (page) => {
          const current = get().favoritePages
          const favorites = current.filter(p => p !== page)
          set({ favoritePages: favorites })
          uiState.removeFavoritePage(page)
        },

        setLastVisitedPage: (page) => {
          set({ lastVisitedPage: page })
          uiState.setLastVisitedPage(page)
        },
      }),
      {
        name: 'ui-storage',
        version: 2,
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
          pageSize: state.pageSize,
          recentSearches: state.recentSearches,
          favoritePages: state.favoritePages,
          lastVisitedPage: state.lastVisitedPage,
        }),
        // Migration function for version updates
        migrate: (persistedState: any, version: number) => {
          if (version < 2) {
            // Migrate from version 1 to 2
            return {
              ...persistedState,
              pageSize: persistedState.pageSize || 25,
              recentSearches: persistedState.recentSearches || [],
              favoritePages: persistedState.favoritePages || [],
              theme: persistedState.theme === 'dark' ? 'dark' : persistedState.theme === 'light' ? 'light' : 'system',
            }
          }
          return persistedState
        },
      }
    ),
    {
      name: 'ui-store',
    }
  )
)