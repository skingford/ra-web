import type { User, Permission, Role } from '../stores/types'

export type PermissionAction = 'create' | 'read' | 'update' | 'delete'
export type PermissionResource = string

export interface PermissionCheck {
  resource: PermissionResource
  action: PermissionAction
  conditions?: Record<string, any>
}

export class PermissionManager {
  private static instance: PermissionManager

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager()
    }
    return PermissionManager.instance
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(
    user: User | null,
    resource: PermissionResource,
    action: PermissionAction,
    conditions?: Record<string, any>
  ): boolean {
    if (!user) return false

    // Check direct permissions
    const hasDirectPermission = user.permissions.some(permission =>
      this.matchesPermission(permission, resource, action, conditions)
    )

    if (hasDirectPermission) return true

    // Check role-based permissions
    const hasRolePermission = user.roles.some(role =>
      role.permissions.some(permission =>
        this.matchesPermission(permission, resource, action, conditions)
      )
    )

    return hasRolePermission
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(
    user: User | null,
    permissions: PermissionCheck[]
  ): boolean {
    if (!user) return false

    return permissions.some(({ resource, action, conditions }) =>
      this.hasPermission(user, resource, action, conditions)
    )
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(
    user: User | null,
    permissions: PermissionCheck[]
  ): boolean {
    if (!user) return false

    return permissions.every(({ resource, action, conditions }) =>
      this.hasPermission(user, resource, action, conditions)
    )
  }

  /**
   * Check if user has a specific role
   */
  hasRole(user: User | null, roleName: string): boolean {
    if (!user) return false
    return user.roles.some(role => role.name === roleName)
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(user: User | null, roleNames: string[]): boolean {
    if (!user) return false
    return roleNames.some(roleName => this.hasRole(user, roleName))
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(user: User | null, roleNames: string[]): boolean {
    if (!user) return false
    return roleNames.every(roleName => this.hasRole(user, roleName))
  }

  /**
   * Get all permissions for a user (direct + role-based)
   */
  getUserPermissions(user: User | null): Permission[] {
    if (!user) return []

    const directPermissions = user.permissions
    const rolePermissions = user.roles.flatMap(role => role.permissions)

    // Remove duplicates based on resource:action combination
    const allPermissions = [...directPermissions, ...rolePermissions]
    const uniquePermissions = allPermissions.filter((permission, index, array) =>
      array.findIndex(p =>
        p.resource === permission.resource && p.action === permission.action
      ) === index
    )

    return uniquePermissions
  }

  /**
   * Get all roles for a user
   */
  getUserRoles(user: User | null): Role[] {
    if (!user) return []
    return user.roles
  }

  /**
   * Check if a permission matches the criteria
   */
  private matchesPermission(
    permission: Permission,
    resource: PermissionResource,
    action: PermissionAction,
    conditions?: Record<string, any>
  ): boolean {
    // Check resource and action match
    if (permission.resource !== resource || permission.action !== action) {
      return false
    }

    // If no conditions specified, permission matches
    if (!conditions || Object.keys(conditions).length === 0) {
      return true
    }

    // If permission has no conditions but conditions are required, deny
    if (!permission.conditions) {
      return false
    }

    // Check if all required conditions are met
    return Object.entries(conditions).every(([key, value]) => {
      const permissionValue = permission.conditions?.[key]
      
      // Handle different condition types
      if (Array.isArray(permissionValue)) {
        return Array.isArray(value) 
          ? value.every(v => permissionValue.includes(v))
          : permissionValue.includes(value)
      }
      
      if (typeof permissionValue === 'object' && permissionValue !== null) {
        // Handle complex condition objects (e.g., ranges, patterns)
        return this.matchesComplexCondition(permissionValue, value)
      }
      
      return permissionValue === value
    })
  }

  /**
   * Handle complex condition matching
   */
  private matchesComplexCondition(condition: any, value: any): boolean {
    // Handle range conditions
    if (condition.min !== undefined || condition.max !== undefined) {
      const numValue = Number(value)
      if (isNaN(numValue)) return false
      
      if (condition.min !== undefined && numValue < condition.min) return false
      if (condition.max !== undefined && numValue > condition.max) return false
      
      return true
    }

    // Handle pattern conditions
    if (condition.pattern) {
      const regex = new RegExp(condition.pattern)
      return regex.test(String(value))
    }

    // Handle array conditions
    if (condition.includes) {
      return Array.isArray(condition.includes) && condition.includes.includes(value)
    }

    if (condition.excludes) {
      return Array.isArray(condition.excludes) && !condition.excludes.includes(value)
    }

    return false
  }
}

export const permissionManager = PermissionManager.getInstance()

// Common permission constants
export const PERMISSIONS = {
  // User management
  USERS_CREATE: 'users:create',
  USERS_READ: 'users:read',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Role management
  ROLES_CREATE: 'roles:create',
  ROLES_READ: 'roles:read',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:read',
  DASHBOARD_MANAGE: 'dashboard:update',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics:read',
  ANALYTICS_EXPORT: 'analytics:export',
  
  // Settings
  SETTINGS_VIEW: 'settings:read',
  SETTINGS_UPDATE: 'settings:update',
  SYSTEM_SETTINGS: 'system:update',
  
  // Content management
  CONTENT_CREATE: 'content:create',
  CONTENT_READ: 'content:read',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
} as const

// Common role constants
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  USER: 'user',
} as const

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  USER_MANAGEMENT: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
  ],
  ROLE_MANAGEMENT: [
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_READ,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,
  ],
  CONTENT_MANAGEMENT: [
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_UPDATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.CONTENT_PUBLISH,
  ],
  ANALYTICS: [
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
  ],
  SYSTEM_ADMIN: [
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.SETTINGS_UPDATE,
  ],
} as const