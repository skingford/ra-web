import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification, BreadcrumbItem, ModalState } from './types'

interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
  modals: ModalState[]
  breadcrumbs: BreadcrumbItem[]
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  removeNotification: (id: string) => void
  markNotificationAsRead: (id: string) => void
  clearAllNotifications: () => void
  openModal: (id: string, data?: any) => void
  closeModal: (id: string) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
}

type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // State
      sidebarCollapsed: false,
      theme: 'light',
      notifications: [],
      modals: [],
      breadcrumbs: [],

      // Actions
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
      },

      setTheme: (theme) => {
        set({ theme })
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          read: false,
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }))
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
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)