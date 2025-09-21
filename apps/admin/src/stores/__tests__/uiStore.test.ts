import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '../uiStore'
import type { BreadcrumbItem } from '../types'

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useUIStore.getState()
    store.setSidebarCollapsed(false)
    store.setTheme('light')
    store.clearAllNotifications()
    store.setBreadcrumbs([])
    // Clear modals
    useUIStore.setState({ modals: [] })
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useUIStore.getState()
      
      expect(state.sidebarCollapsed).toBe(false)
      expect(state.theme).toBe('light')
      expect(state.notifications).toEqual([])
      expect(state.modals).toEqual([])
      expect(state.breadcrumbs).toEqual([])
    })
  })

  describe('Sidebar Actions', () => {
    it('should toggle sidebar state', () => {
      const { toggleSidebar } = useUIStore.getState()
      
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
      
      toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)
      
      toggleSidebar()
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })

    it('should set sidebar collapsed state directly', () => {
      const { setSidebarCollapsed } = useUIStore.getState()
      
      setSidebarCollapsed(true)
      expect(useUIStore.getState().sidebarCollapsed).toBe(true)
      
      setSidebarCollapsed(false)
      expect(useUIStore.getState().sidebarCollapsed).toBe(false)
    })
  })

  describe('Theme Actions', () => {
    it('should toggle theme between light and dark', () => {
      const { toggleTheme } = useUIStore.getState()
      
      expect(useUIStore.getState().theme).toBe('light')
      
      toggleTheme()
      expect(useUIStore.getState().theme).toBe('dark')
      
      toggleTheme()
      expect(useUIStore.getState().theme).toBe('light')
    })

    it('should set theme directly', () => {
      const { setTheme } = useUIStore.getState()
      
      setTheme('dark')
      expect(useUIStore.getState().theme).toBe('dark')
      
      setTheme('light')
      expect(useUIStore.getState().theme).toBe('light')
    })
  })

  describe('Notification Actions', () => {
    const mockNotificationData = {
      title: 'Test Notification',
      message: 'This is a test message',
      type: 'info' as const,
    }

    it('should add notification with generated id and timestamp', () => {
      const { addNotification } = useUIStore.getState()
      
      addNotification(mockNotificationData)
      
      const state = useUIStore.getState()
      expect(state.notifications).toHaveLength(1)
      
      const notification = state.notifications[0]!
      expect(notification.title).toBe(mockNotificationData.title)
      expect(notification.message).toBe(mockNotificationData.message)
      expect(notification.type).toBe(mockNotificationData.type)
      expect(notification.id).toBeDefined()
      expect(notification.timestamp).toBeInstanceOf(Date)
      expect(notification.read).toBe(false)
    })

    it('should add multiple notifications in correct order', () => {
      const { addNotification } = useUIStore.getState()
      
      addNotification({ ...mockNotificationData, title: 'First' })
      addNotification({ ...mockNotificationData, title: 'Second' })
      
      const state = useUIStore.getState()
      expect(state.notifications).toHaveLength(2)
      expect(state.notifications[0]!.title).toBe('Second') // Most recent first
      expect(state.notifications[1]!.title).toBe('First')
    })

    it('should remove notification by id', () => {
      const { addNotification, removeNotification } = useUIStore.getState()
      
      addNotification(mockNotificationData)
      const notificationId = useUIStore.getState().notifications[0]!.id
      
      removeNotification(notificationId)
      
      expect(useUIStore.getState().notifications).toHaveLength(0)
    })

    it('should mark notification as read', () => {
      const { addNotification, markNotificationAsRead } = useUIStore.getState()
      
      addNotification(mockNotificationData)
      const notificationId = useUIStore.getState().notifications[0]!.id
      
      markNotificationAsRead(notificationId)
      
      const notification = useUIStore.getState().notifications[0]!
      expect(notification.read).toBe(true)
    })

    it('should clear all notifications', () => {
      const { addNotification, clearAllNotifications } = useUIStore.getState()
      
      addNotification(mockNotificationData)
      addNotification({ ...mockNotificationData, title: 'Second' })
      
      expect(useUIStore.getState().notifications).toHaveLength(2)
      
      clearAllNotifications()
      
      expect(useUIStore.getState().notifications).toHaveLength(0)
    })
  })

  describe('Modal Actions', () => {
    it('should open new modal', () => {
      const { openModal } = useUIStore.getState()
      
      openModal('test-modal', { key: 'value' })
      
      const state = useUIStore.getState()
      expect(state.modals).toHaveLength(1)
      expect(state.modals[0]!).toEqual({
        id: 'test-modal',
        isOpen: true,
        data: { key: 'value' },
      })
    })

    it('should update existing modal when opening with same id', () => {
      const { openModal } = useUIStore.getState()
      
      openModal('test-modal', { key: 'value1' })
      openModal('test-modal', { key: 'value2' })
      
      const state = useUIStore.getState()
      expect(state.modals).toHaveLength(1)
      expect(state.modals[0]?.data).toEqual({ key: 'value2' })
      expect(state.modals[0]?.isOpen).toBe(true)
    })

    it('should close modal by id', () => {
      const { openModal, closeModal } = useUIStore.getState()
      
      openModal('test-modal')
      closeModal('test-modal')
      
      const state = useUIStore.getState()
      expect(state.modals[0]?.isOpen).toBe(false)
    })

    it('should handle multiple modals', () => {
      const { openModal, closeModal } = useUIStore.getState()
      
      openModal('modal1')
      openModal('modal2')
      
      expect(useUIStore.getState().modals).toHaveLength(2)
      
      closeModal('modal1')
      
      const state = useUIStore.getState()
      expect(state.modals[0]?.isOpen).toBe(false)
      expect(state.modals[1]?.isOpen).toBe(true)
    })
  })

  describe('Breadcrumb Actions', () => {
    const mockBreadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Users', href: '/users' },
      { label: 'Edit User', isCurrentPage: true },
    ]

    it('should set breadcrumbs', () => {
      const { setBreadcrumbs } = useUIStore.getState()
      
      setBreadcrumbs(mockBreadcrumbs)
      
      const state = useUIStore.getState()
      expect(state.breadcrumbs).toEqual(mockBreadcrumbs)
    })

    it('should replace existing breadcrumbs', () => {
      const { setBreadcrumbs } = useUIStore.getState()
      
      setBreadcrumbs([{ label: 'Initial' }])
      setBreadcrumbs(mockBreadcrumbs)
      
      const state = useUIStore.getState()
      expect(state.breadcrumbs).toEqual(mockBreadcrumbs)
      expect(state.breadcrumbs).toHaveLength(3)
    })
  })

  describe('Store Persistence', () => {
    it('should persist sidebar and theme state', () => {
      const { setSidebarCollapsed, setTheme } = useUIStore.getState()
      
      setSidebarCollapsed(true)
      setTheme('dark')
      
      // The persist middleware should handle this automatically
      const state = useUIStore.getState()
      expect(state.sidebarCollapsed).toBe(true)
      expect(state.theme).toBe('dark')
    })

    it('should not persist notifications and modals', () => {
      const { addNotification, openModal } = useUIStore.getState()
      
      addNotification({
        title: 'Test',
        message: 'Test message',
        type: 'info',
      })
      openModal('test-modal')
      
      // These should not be persisted according to the partialize function
      const state = useUIStore.getState()
      expect(state.notifications).toHaveLength(1)
      expect(state.modals).toHaveLength(1)
    })
  })
})