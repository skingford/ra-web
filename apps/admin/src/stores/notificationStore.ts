import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Notification {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  isClosable?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  createdAt: Date
}

interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: new Date(),
          duration: notification.duration ?? (notification.type === 'error' ? 0 : 5000), // Error notifications don't auto-dismiss
          isClosable: notification.isClosable ?? true,
        }

        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))

        // Auto-remove notification after duration (if duration > 0)
        if (newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }

        return id
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },

      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, ...updates } : n
          )
        }))
      },
    }),
    {
      name: 'notification-store',
    }
  )
)

// Helper functions for common notification types
export const useNotifications = () => {
  const { addNotification, removeNotification, clearAllNotifications } = useNotificationStore()

  return {
    success: (message: string, options?: Partial<Notification>) => 
      addNotification({ ...options, message, type: 'success' }),
    
    error: (message: string, options?: Partial<Notification>) => 
      addNotification({ ...options, message, type: 'error' }),
    
    warning: (message: string, options?: Partial<Notification>) => 
      addNotification({ ...options, message, type: 'warning' }),
    
    info: (message: string, options?: Partial<Notification>) => 
      addNotification({ ...options, message, type: 'info' }),
    
    remove: removeNotification,
    clearAll: clearAllNotifications,
  }
}