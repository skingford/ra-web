import { renderHook } from '@testing-library/react'
import { usePermissions, usePermission, useRole } from '../usePermissions'
import { useAuthStore } from '../../../stores/authStore'
import { vi } from 'vitest'
import type { User } from '../../../stores/types'

// Mock the auth store
vi.mock('../../../stores/authStore')
const mockUseAuthStore = useAuthStore as any

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  roles: [
    {
      id: '1',
      name: 'editor',
      description: 'Editor role',
      permissions: [
        {
          id: '1',
          resource: 'content',
          action: 'create',
        },
        {
          id: '2',
          resource: 'content',
          action: 'update',
        },
      ],
    },
  ],
  permissions: [
    {
      id: '3',
      resource: 'users',
      action: 'read',
    },
  ],
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns permission checking functions', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => usePermissions())

    expect(typeof result.current.hasPermission).toBe('function')
    expect(typeof result.current.hasAnyPermission).toBe('function')
    expect(typeof result.current.hasAllPermissions).toBe('function')
    expect(typeof result.current.hasRole).toBe('function')
    expect(typeof result.current.can).toBe('function')
    expect(typeof result.current.cannot).toBe('function')
  })

  it('hasPermission works correctly', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.hasPermission('users', 'read')).toBe(true)
    expect(result.current.hasPermission('users', 'delete')).toBe(false)
    expect(result.current.hasPermission('content', 'create')).toBe(true)
  })

  it('hasRole works correctly', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.hasRole('editor')).toBe(true)
    expect(result.current.hasRole('admin')).toBe(false)
  })

  it('can and cannot work correctly', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.can('read', 'users')).toBe(true)
    expect(result.current.can('delete', 'users')).toBe(false)
    expect(result.current.cannot('read', 'users')).toBe(false)
    expect(result.current.cannot('delete', 'users')).toBe(true)
  })

  it('returns correct user permissions and roles', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => usePermissions())

    const permissions = result.current.getUserPermissions()
    const roles = result.current.getUserRoles()

    expect(permissions).toHaveLength(3) // 1 direct + 2 from role
    expect(roles).toHaveLength(1)
    expect(roles[0].name).toBe('editor')
  })

  it('handles null user', () => {
    mockUseAuthStore.mockReturnValue({ user: null })

    const { result } = renderHook(() => usePermissions())

    expect(result.current.hasPermission('users', 'read')).toBe(false)
    expect(result.current.hasRole('editor')).toBe(false)
    expect(result.current.can('read', 'users')).toBe(false)
    expect(result.current.cannot('read', 'users')).toBe(true)
  })
})

describe('usePermission', () => {
  it('returns correct permission status', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => usePermission('users', 'read'))

    expect(result.current).toBe(true)
  })

  it('returns false for non-existent permission', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => usePermission('users', 'delete'))

    expect(result.current).toBe(false)
  })

  it('handles conditions', () => {
    const userWithConditions: User = {
      ...mockUser,
      permissions: [
        {
          id: '4',
          resource: 'analytics',
          action: 'read',
          conditions: { department: 'marketing' },
        },
      ],
    }

    mockUseAuthStore.mockReturnValue({ user: userWithConditions })

    const { result: resultMatch } = renderHook(() => 
      usePermission('analytics', 'read', { department: 'marketing' })
    )
    expect(resultMatch.current).toBe(true)

    const { result: resultNoMatch } = renderHook(() => 
      usePermission('analytics', 'read', { department: 'sales' })
    )
    expect(resultNoMatch.current).toBe(false)
  })
})

describe('useRole', () => {
  it('returns correct role status', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => useRole('editor'))

    expect(result.current).toBe(true)
  })

  it('returns false for non-existent role', () => {
    mockUseAuthStore.mockReturnValue({ user: mockUser })

    const { result } = renderHook(() => useRole('admin'))

    expect(result.current).toBe(false)
  })

  it('handles null user', () => {
    mockUseAuthStore.mockReturnValue({ user: null })

    const { result } = renderHook(() => useRole('editor'))

    expect(result.current).toBe(false)
  })
})