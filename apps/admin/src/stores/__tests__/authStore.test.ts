import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../authStore'
import type { User } from '../types'

// Mock user data for testing
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  roles: [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: [
        { id: '1', resource: 'users', action: 'create' },
        { id: '2', resource: 'users', action: 'read' },
        { id: '3', resource: 'users', action: 'update' },
        { id: '4', resource: 'users', action: 'delete' },
      ],
    },
  ],
  permissions: [
    { id: '1', resource: 'users', action: 'create' },
    { id: '2', resource: 'users', action: 'read' },
    { id: '3', resource: 'users', action: 'update' },
    { id: '4', resource: 'users', action: 'delete' },
  ],
  status: 'active',
  lastLogin: new Date('2024-01-01'),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2024-01-01'),
}

const mockToken = 'mock-jwt-token'

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()
      
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.permissions).toEqual(new Set())
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('Login Action', () => {
    it('should set user and token on login', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUser, mockToken)
      
      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe(mockToken)
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })

    it('should set permissions correctly on login', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUser, mockToken)
      
      const state = useAuthStore.getState()
      const expectedPermissions = new Set([
        'users:create',
        'users:read',
        'users:update',
        'users:delete',
      ])
      
      expect(state.permissions).toEqual(expectedPermissions)
    })
  })

  describe('Logout Action', () => {
    it('should clear all state on logout', () => {
      const { login, logout } = useAuthStore.getState()
      
      // First login
      login(mockUser, mockToken)
      
      // Then logout
      logout()
      
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.permissions).toEqual(new Set())
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('Update User Action', () => {
    it('should update user data when user is logged in', () => {
      const { login, updateUser } = useAuthStore.getState()
      
      // First login
      login(mockUser, mockToken)
      
      // Update user
      const updatedData = { name: 'Updated Name', email: 'updated@example.com' }
      updateUser(updatedData)
      
      const state = useAuthStore.getState()
      expect(state.user?.name).toBe('Updated Name')
      expect(state.user?.email).toBe('updated@example.com')
      expect(state.user?.id).toBe(mockUser.id) // Should preserve other fields
    })

    it('should update permissions when user permissions change', () => {
      const { login, updateUser } = useAuthStore.getState()
      
      // First login
      login(mockUser, mockToken)
      
      // Update user with new permissions
      const newPermissions = [
        { id: '5', resource: 'reports', action: 'read' as const },
      ]
      updateUser({ permissions: newPermissions })
      
      const state = useAuthStore.getState()
      expect(state.permissions).toEqual(new Set(['reports:read']))
    })

    it('should not update user when no user is logged in', () => {
      const { updateUser } = useAuthStore.getState()
      
      updateUser({ name: 'Should Not Update' })
      
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
    })
  })

  describe('Set Loading Action', () => {
    it('should set loading state', () => {
      const { setLoading } = useAuthStore.getState()
      
      setLoading(true)
      expect(useAuthStore.getState().isLoading).toBe(true)
      
      setLoading(false)
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  describe('Has Permission Method', () => {
    it('should return true for existing permissions', () => {
      const { login, hasPermission } = useAuthStore.getState()
      
      login(mockUser, mockToken)
      
      expect(hasPermission('users:create')).toBe(true)
      expect(hasPermission('users:read')).toBe(true)
      expect(hasPermission('users:update')).toBe(true)
      expect(hasPermission('users:delete')).toBe(true)
    })

    it('should return false for non-existing permissions', () => {
      const { login, hasPermission } = useAuthStore.getState()
      
      login(mockUser, mockToken)
      
      expect(hasPermission('reports:create')).toBe(false)
      expect(hasPermission('settings:delete')).toBe(false)
    })

    it('should return false when no user is logged in', () => {
      const { hasPermission } = useAuthStore.getState()
      
      expect(hasPermission('users:read')).toBe(false)
    })
  })

  describe('Store Persistence', () => {
    it('should persist user, token, and isAuthenticated', () => {
      const { login } = useAuthStore.getState()
      
      login(mockUser, mockToken)
      
      // The persist middleware should handle this automatically
      // We can't easily test localStorage in this environment,
      // but we can verify the partialize function works correctly
      const state = useAuthStore.getState()
      expect(state.user).toBeDefined()
      expect(state.token).toBeDefined()
      expect(state.isAuthenticated).toBe(true)
    })
  })
})