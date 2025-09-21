import { describe, it, expect } from 'vitest'
import { PermissionManager, PERMISSIONS, ROLES } from '../permissions'
import type { User } from '../../stores/types'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { expect } from 'vitest'
import { it } from 'vitest'
import { describe } from 'vitest'
import { beforeEach } from 'vitest'
import { describe } from 'vitest'

describe('PermissionManager', () => {
  let permissionManager: PermissionManager
  
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
      {
        id: '4',
        resource: 'analytics',
        action: 'read',
        conditions: {
          department: 'marketing',
        },
      },
    ],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    permissionManager = PermissionManager.getInstance()
  })

  describe('hasPermission', () => {
    it('returns false for null user', () => {
      const result = permissionManager.hasPermission(null, 'users', 'read')
      expect(result).toBe(false)
    })

    it('returns true for direct permission', () => {
      const result = permissionManager.hasPermission(mockUser, 'users', 'read')
      expect(result).toBe(true)
    })

    it('returns true for role-based permission', () => {
      const result = permissionManager.hasPermission(mockUser, 'content', 'create')
      expect(result).toBe(true)
    })

    it('returns false for non-existent permission', () => {
      const result = permissionManager.hasPermission(mockUser, 'users', 'delete')
      expect(result).toBe(false)
    })

    it('handles conditional permissions correctly', () => {
      // Should pass with matching conditions
      const resultMatch = permissionManager.hasPermission(
        mockUser,
        'analytics',
        'read',
        { department: 'marketing' }
      )
      expect(resultMatch).toBe(true)

      // Should fail with non-matching conditions
      const resultNoMatch = permissionManager.hasPermission(
        mockUser,
        'analytics',
        'read',
        { department: 'sales' }
      )
      expect(resultNoMatch).toBe(false)
    })

    it('handles permissions without conditions', () => {
      const result = permissionManager.hasPermission(mockUser, 'users', 'read')
      expect(result).toBe(true)
    })
  })

  describe('hasAnyPermission', () => {
    it('returns true if user has any of the specified permissions', () => {
      const permissions = [
        { resource: 'users', action: 'delete' as const },
        { resource: 'users', action: 'read' as const },
      ]
      const result = permissionManager.hasAnyPermission(mockUser, permissions)
      expect(result).toBe(true)
    })

    it('returns false if user has none of the specified permissions', () => {
      const permissions = [
        { resource: 'users', action: 'delete' as const },
        { resource: 'users', action: 'create' as const },
      ]
      const result = permissionManager.hasAnyPermission(mockUser, permissions)
      expect(result).toBe(false)
    })
  })

  describe('hasAllPermissions', () => {
    it('returns true if user has all specified permissions', () => {
      const permissions = [
        { resource: 'users', action: 'read' as const },
        { resource: 'content', action: 'create' as const },
      ]
      const result = permissionManager.hasAllPermissions(mockUser, permissions)
      expect(result).toBe(true)
    })

    it('returns false if user is missing any permission', () => {
      const permissions = [
        { resource: 'users', action: 'read' as const },
        { resource: 'users', action: 'delete' as const },
      ]
      const result = permissionManager.hasAllPermissions(mockUser, permissions)
      expect(result).toBe(false)
    })
  })

  describe('hasRole', () => {
    it('returns true if user has the specified role', () => {
      const result = permissionManager.hasRole(mockUser, 'editor')
      expect(result).toBe(true)
    })

    it('returns false if user does not have the specified role', () => {
      const result = permissionManager.hasRole(mockUser, 'admin')
      expect(result).toBe(false)
    })

    it('returns false for null user', () => {
      const result = permissionManager.hasRole(null, 'editor')
      expect(result).toBe(false)
    })
  })

  describe('hasAnyRole', () => {
    it('returns true if user has any of the specified roles', () => {
      const result = permissionManager.hasAnyRole(mockUser, ['admin', 'editor'])
      expect(result).toBe(true)
    })

    it('returns false if user has none of the specified roles', () => {
      const result = permissionManager.hasAnyRole(mockUser, ['admin', 'manager'])
      expect(result).toBe(false)
    })
  })

  describe('hasAllRoles', () => {
    it('returns false if user does not have all specified roles', () => {
      const result = permissionManager.hasAllRoles(mockUser, ['admin', 'editor'])
      expect(result).toBe(false)
    })

    it('returns true if user has all specified roles', () => {
      const result = permissionManager.hasAllRoles(mockUser, ['editor'])
      expect(result).toBe(true)
    })
  })

  describe('getUserPermissions', () => {
    it('returns all permissions for user (direct + role-based)', () => {
      const permissions = permissionManager.getUserPermissions(mockUser)
      
      expect(permissions).toHaveLength(4)
      expect(permissions.some(p => p.resource === 'users' && p.action === 'read')).toBe(true)
      expect(permissions.some(p => p.resource === 'content' && p.action === 'create')).toBe(true)
      expect(permissions.some(p => p.resource === 'content' && p.action === 'update')).toBe(true)
      expect(permissions.some(p => p.resource === 'analytics' && p.action === 'read')).toBe(true)
    })

    it('returns empty array for null user', () => {
      const permissions = permissionManager.getUserPermissions(null)
      expect(permissions).toEqual([])
    })

    it('removes duplicate permissions', () => {
      const userWithDuplicates: User = {
        ...mockUser,
        permissions: [
          ...mockUser.permissions,
          {
            id: '5',
            resource: 'content',
            action: 'create', // Duplicate of role permission
          },
        ],
      }

      const permissions = permissionManager.getUserPermissions(userWithDuplicates)
      const createContentPermissions = permissions.filter(
        p => p.resource === 'content' && p.action === 'create'
      )
      
      expect(createContentPermissions).toHaveLength(1)
    })
  })

  describe('getUserRoles', () => {
    it('returns all roles for user', () => {
      const roles = permissionManager.getUserRoles(mockUser)
      expect(roles).toHaveLength(1)
      expect(roles[0]?.name).toBe('editor')
    })

    it('returns empty array for null user', () => {
      const roles = permissionManager.getUserRoles(null)
      expect(roles).toEqual([])
    })
  })

  describe('complex conditions', () => {
    it('handles range conditions', () => {
      const userWithRangePermission: User = {
        ...mockUser,
        permissions: [
          {
            id: '5',
            resource: 'reports',
            action: 'read',
            conditions: {
              range: { min: 1, max: 100 },
            },
          },
        ],
      }

      const resultValid = permissionManager.hasPermission(
        userWithRangePermission,
        'reports',
        'read',
        { range: 50 }
      )
      expect(resultValid).toBe(true)

      const resultInvalid = permissionManager.hasPermission(
        userWithRangePermission,
        'reports',
        'read',
        { range: 150 }
      )
      expect(resultInvalid).toBe(false)
    })

    it('handles pattern conditions', () => {
      const userWithPatternPermission: User = {
        ...mockUser,
        permissions: [
          {
            id: '6',
            resource: 'reports',
            action: 'read',
            conditions: {
              pattern: { pattern: '^[A-Z]+$' },
            },
          },
        ],
      }

      const resultValid = permissionManager.hasPermission(
        userWithPatternPermission,
        'reports',
        'read',
        { pattern: 'HELLO' }
      )
      expect(resultValid).toBe(true)

      const resultInvalid = permissionManager.hasPermission(
        userWithPatternPermission,
        'reports',
        'read',
        { pattern: 'hello' }
      )
      expect(resultInvalid).toBe(false)
    })

    it('handles includes conditions', () => {
      const userWithIncludesPermission: User = {
        ...mockUser,
        permissions: [
          {
            id: '7',
            resource: 'reports',
            action: 'read',
            conditions: {
              includes: { includes: ['public', 'internal'] },
            },
          },
        ],
      }

      const resultValid = permissionManager.hasPermission(
        userWithIncludesPermission,
        'reports',
        'read',
        { includes: 'public' }
      )
      expect(resultValid).toBe(true)

      const resultInvalid = permissionManager.hasPermission(
        userWithIncludesPermission,
        'reports',
        'read',
        { includes: 'private' }
      )
      expect(resultInvalid).toBe(false)
    })

    it('handles excludes conditions', () => {
      const userWithExcludesPermission: User = {
        ...mockUser,
        permissions: [
          {
            id: '8',
            resource: 'reports',
            action: 'read',
            conditions: {
              excludes: { excludes: ['confidential'] },
            },
          },
        ],
      }

      const resultValid = permissionManager.hasPermission(
        userWithExcludesPermission,
        'reports',
        'read',
        { excludes: 'public' }
      )
      expect(resultValid).toBe(true)

      const resultInvalid = permissionManager.hasPermission(
        userWithExcludesPermission,
        'reports',
        'read',
        { excludes: 'confidential' }
      )
      expect(resultInvalid).toBe(false)
    })
  })

  describe('constants', () => {
    it('exports permission constants', () => {
      expect(PERMISSIONS.USERS_CREATE).toBe('users:create')
      expect(PERMISSIONS.USERS_READ).toBe('users:read')
      expect(PERMISSIONS.DASHBOARD_VIEW).toBe('dashboard:read')
    })

    it('exports role constants', () => {
      expect(ROLES.ADMIN).toBe('admin')
      expect(ROLES.EDITOR).toBe('editor')
      expect(ROLES.VIEWER).toBe('viewer')
    })
  })
})