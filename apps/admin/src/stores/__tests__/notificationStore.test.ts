import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useNotificationStore } from '../notificationStore'

// Mock timers
vi.useFakeTimers()

describe('notificationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useNotificationStore.setState({ notifications: [] })
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('should add a notification', () => {
    const { addNotification } = useNotificationStore.getState()
    
    const id = addNotification({
      message: 'Test notification',
      type: 'info'
    })

    const { notifications } = useNotificationStore.getState()
    
    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toMatchObject({
      id,
      message: 'Test notification',
      type: 'info',
      duration: 5000,
      isClosable: true
    })
    expect(notifications[0].createdAt).toBeInstanceOf(Date)
  })

  it('should remove a notification', () => {
    const { addNotification, removeNotification } = useNotificationStore.getState()
    
    const id = addNotification({
      message: 'Test notification',
      type: 'info'
    })

    removeNotification(id)

    const { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(0)
  })

  it('should clear all notifications', () => {
    const { addNotification, clearAllNotifications } = useNotificationStore.getState()
    
    addNotification({ message: 'Test 1', type: 'info' })
    addNotification({ message: 'Test 2', type: 'success' })

    clearAllNotifications()

    const { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(0)
  })

  it('should update a notification', () => {
    const { addNotification, updateNotification } = useNotificationStore.getState()
    
    const id = addNotification({
      message: 'Original message',
      type: 'info'
    })

    updateNotification(id, {
      message: 'Updated message',
      type: 'success'
    })

    const { notifications } = useNotificationStore.getState()
    expect(notifications[0]).toMatchObject({
      id,
      message: 'Updated message',
      type: 'success'
    })
  })

  it('should auto-remove notification after duration', () => {
    const { addNotification } = useNotificationStore.getState()
    
    addNotification({
      message: 'Auto-remove test',
      type: 'info',
      duration: 1000
    })

    let { notifications } = useNotificationStore.getState()
    expect(notifications).toHaveLength(1)

    // Fast-forward time
    vi.advanceTimersByTime(1000)

    notifications = useNotificationStore.getState().notifications
    expect(notifications).toHaveLength(0)
  })

  it('should not auto-remove error notifications by default', () => {
    const { addNotification } = useNotificationStore.getState()
    
    addNotification({
      message: 'Error message',
      type: 'error'
    })

    const { notifications } = useNotificationStore.getState()
    expect(notifications[0].duration).toBe(0)

    // Fast-forward time
    vi.advanceTimersByTime(10000)

    const { notifications: notificationsAfter } = useNotificationStore.getState()
    expect(notificationsAfter).toHaveLength(1)
  })

  it('should generate unique IDs for notifications', () => {
    const { addNotification } = useNotificationStore.getState()
    
    const id1 = addNotification({ message: 'Test 1', type: 'info' })
    const id2 = addNotification({ message: 'Test 2', type: 'info' })

    expect(id1).not.toBe(id2)
  })

  it('should handle custom duration', () => {
    const { addNotification } = useNotificationStore.getState()
    
    addNotification({
      message: 'Custom duration',
      type: 'success',
      duration: 2000
    })

    const { notifications } = useNotificationStore.getState()
    expect(notifications[0].duration).toBe(2000)
  })

  it('should handle custom properties', () => {
    const { addNotification } = useNotificationStore.getState()
    
    const mockAction = vi.fn()
    
    addNotification({
      message: 'Custom notification',
      type: 'warning',
      title: 'Custom Title',
      isClosable: false,
      action: {
        label: 'Action',
        onClick: mockAction
      }
    })

    const { notifications } = useNotificationStore.getState()
    expect(notifications[0]).toMatchObject({
      message: 'Custom notification',
      type: 'warning',
      title: 'Custom Title',
      isClosable: false,
      action: {
        label: 'Action',
        onClick: mockAction
      }
    })
  })
})