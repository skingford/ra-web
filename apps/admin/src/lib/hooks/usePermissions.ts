import { useMemo } from 'react'
import { useAuthStore } from '../../stores/authStore'
import {
  permissionManager,
  type PermissionCheck,
  type PermissionAction,
  type PermissionResource
} from '../permissions'

export function usePermissions() {
  const { user } = useAuthStore()

  const permissions = useMemo(() => ({
    /**
     * Check if user has a specific permission
     */
    hasPermission: (
      resource: PermissionResource,
      action: PermissionAction,
      conditions?: Record<string, any>
    ): boolean => {
      return permissionManager.hasPermission(user, resource, action, conditions)
    },

    /**
     * Check if user has any of the specified permissions
     */
    hasAnyPermission: (permissions: PermissionCheck[]): boolean => {
      return permissionManager.hasAnyPermission(user, permissions)
    },

    /**
     * Check if user has all of the specified permissions
     */
    hasAllPermissions: (permissions: PermissionCheck[]): boolean => {
      return permissionManager.hasAllPermissions(user, permissions)
    },

    /**
     * Check if user has a specific role
     */
    hasRole: (roleName: string): boolean => {
      return permissionManager.hasRole(user, roleName)
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole: (roleNames: string[]): boolean => {
      return permissionManager.hasAnyRole(user, roleNames)
    },

    /**
     * Check if user has all of the specified roles
     */
    hasAllRoles: (roleNames: string[]): boolean => {
      return permissionManager.hasAllRoles(user, roleNames)
    },

    /**
     * Get all permissions for the current user
     */
    getUserPermissions: () => {
      return permissionManager.getUserPermissions(user)
    },

    /**
     * Get all roles for the current user
     */
    getUserRoles: () => {
      return permissionManager.getUserRoles(user)
    },

    /**
     * Check if user can perform action on resource
     */
    can: (action: PermissionAction, resource: PermissionResource, conditions?: Record<string, any>): boolean => {
      return permissionManager.hasPermission(user, resource, action, conditions)
    },

    /**
     * Check if user cannot perform action on resource
     */
    cannot: (action: PermissionAction, resource: PermissionResource, conditions?: Record<string, any>): boolean => {
      return !permissionManager.hasPermission(user, resource, action, conditions)
    },
  }), [user])

  return permissions
}

/**
 * Hook for checking a specific permission
 */
export function usePermission(
  resource: PermissionResource,
  action: PermissionAction,
  conditions?: Record<string, any>
) {
  const { user } = useAuthStore()

  return useMemo(() => {
    return permissionManager.hasPermission(user, resource, action, conditions)
  }, [user, resource, action, conditions])
}

/**
 * Hook for checking multiple permissions
 */
export function usePermissionCheck(permissions: PermissionCheck[]) {
  const { user } = useAuthStore()

  return useMemo(() => ({
    hasAny: permissionManager.hasAnyPermission(user, permissions),
    hasAll: permissionManager.hasAllPermissions(user, permissions),
    individual: permissions.map(({ resource, action, conditions }) => ({
      resource,
      action,
      conditions,
      granted: permissionManager.hasPermission(user, resource, action, conditions),
    })),
  }), [user, permissions])
}

/**
 * Hook for checking roles
 */
export function useRole(roleName: string) {
  const { user } = useAuthStore()

  return useMemo(() => {
    return permissionManager.hasRole(user, roleName)
  }, [user, roleName])
}

/**
 * Hook for checking multiple roles
 */
export function useRoles(roleNames: string[]) {
  const { user } = useAuthStore()

  return useMemo(() => ({
    hasAny: permissionManager.hasAnyRole(user, roleNames),
    hasAll: permissionManager.hasAllRoles(user, roleNames),
    individual: roleNames.map(roleName => ({
      role: roleName,
      granted: permissionManager.hasRole(user, roleName),
    })),
  }), [user, roleNames])
}

/**
 * Hook that returns permission-based navigation items
 */
export function usePermissionBasedNavigation<T extends { permissions?: string[] }>(
  items: T[]
): T[] {
  const { hasPermission } = usePermissions()

  return useMemo(() => {
    return items.filter(item => {
      if (!item.permissions || item.permissions.length === 0) {
        return true // No permissions required
      }

      // Check if user has any of the required permissions
      return item.permissions.some(permission => {
        const [resource, action] = permission.split(':')
        return hasPermission(resource, action as PermissionAction)
      })
    })
  }, [items, hasPermission])
}

/**
 * Hook for conditional rendering based on permissions
 */
export function useConditionalRender() {
  const permissions = usePermissions()

  return {
    /**
     * Render component if user has permission
     */
    renderIfCan: (
      action: PermissionAction,
      resource: PermissionResource,
      component: React.ReactNode,
      fallback?: React.ReactNode,
      conditions?: Record<string, any>
    ) => {
      return permissions.can(action, resource, conditions) ? component : (fallback || null)
    },

    /**
     * Render component if user has role
     */
    renderIfRole: (
      roleName: string,
      component: React.ReactNode,
      fallback?: React.ReactNode
    ) => {
      return permissions.hasRole(roleName) ? component : (fallback || null)
    },

    /**
     * Render component if user has any of the specified permissions
     */
    renderIfAnyPermission: (
      permissionChecks: PermissionCheck[],
      component: React.ReactNode,
      fallback?: React.ReactNode
    ) => {
      return permissions.hasAnyPermission(permissionChecks) ? component : (fallback || null)
    },

    /**
     * Render component if user has all of the specified permissions
     */
    renderIfAllPermissions: (
      permissionChecks: PermissionCheck[],
      component: React.ReactNode,
      fallback?: React.ReactNode
    ) => {
      return permissions.hasAllPermissions(permissionChecks) ? component : (fallback || null)
    },
  }
}