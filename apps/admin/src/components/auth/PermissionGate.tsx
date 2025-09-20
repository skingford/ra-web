import React from 'react'
import { usePermissions, usePermission, useRole } from '../../lib/hooks/usePermissions'
import type { PermissionAction, PermissionResource, PermissionCheck } from '../../lib/permissions'

interface BasePermissionGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  loading?: React.ReactNode
}

interface PermissionGateProps extends BasePermissionGateProps {
  resource: PermissionResource
  action: PermissionAction
  conditions?: Record<string, any>
}

interface MultiPermissionGateProps extends BasePermissionGateProps {
  permissions: PermissionCheck[]
  requireAll?: boolean // If true, requires all permissions; if false, requires any
}

interface RoleGateProps extends BasePermissionGateProps {
  role: string
}

interface MultiRoleGateProps extends BasePermissionGateProps {
  roles: string[]
  requireAll?: boolean // If true, requires all roles; if false, requires any
}

/**
 * Component that renders children only if user has the specified permission
 */
export function PermissionGate({
  resource,
  action,
  conditions,
  children,
  fallback = null,
  loading = null,
}: PermissionGateProps) {
  const hasPermission = usePermission(resource, action, conditions)

  if (loading && hasPermission === undefined) {
    return <>{loading}</>
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>
}

/**
 * Component that renders children based on multiple permission checks
 */
export function MultiPermissionGate({
  permissions,
  requireAll = false,
  children,
  fallback = null,
  loading = null,
}: MultiPermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions()

  const hasAccess = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)

  if (loading && hasAccess === undefined) {
    return <>{loading}</>
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Component that renders children only if user has the specified role
 */
export function RoleGate({
  role,
  children,
  fallback = null,
  loading = null,
}: RoleGateProps) {
  const hasRole = useRole(role)

  if (loading && hasRole === undefined) {
    return <>{loading}</>
  }

  return hasRole ? <>{children}</> : <>{fallback}</>
}

/**
 * Component that renders children based on multiple role checks
 */
export function MultiRoleGate({
  roles,
  requireAll = false,
  children,
  fallback = null,
  loading = null,
}: MultiRoleGateProps) {
  const { hasAnyRole, hasAllRoles } = usePermissions()

  const hasAccess = requireAll 
    ? hasAllRoles(roles)
    : hasAnyRole(roles)

  if (loading && hasAccess === undefined) {
    return <>{loading}</>
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * Higher-order component that wraps a component with permission checking
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  resource: PermissionResource,
  action: PermissionAction,
  conditions?: Record<string, any>,
  fallback?: React.ReactNode
) {
  const WithPermissionComponent = (props: P) => (
    <PermissionGate
      resource={resource}
      action={action}
      conditions={conditions}
      fallback={fallback}
    >
      <WrappedComponent {...props} />
    </PermissionGate>
  )

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithPermissionComponent
}

/**
 * Higher-order component that wraps a component with role checking
 */
export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  role: string,
  fallback?: React.ReactNode
) {
  const WithRoleComponent = (props: P) => (
    <RoleGate role={role} fallback={fallback}>
      <WrappedComponent {...props} />
    </RoleGate>
  )

  WithRoleComponent.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithRoleComponent
}

/**
 * Utility component for conditional rendering based on permissions
 */
interface ConditionalRenderProps {
  condition: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ConditionalRender({ condition, children, fallback = null }: ConditionalRenderProps) {
  return condition ? <>{children}</> : <>{fallback}</>
}

/**
 * Component that shows different content based on permission level
 */
interface PermissionLevelProps {
  children: React.ReactNode
  adminContent?: React.ReactNode
  managerContent?: React.ReactNode
  editorContent?: React.ReactNode
  viewerContent?: React.ReactNode
  defaultContent?: React.ReactNode
}

export function PermissionLevel({
  children,
  adminContent,
  managerContent,
  editorContent,
  viewerContent,
  defaultContent,
}: PermissionLevelProps) {
  const { hasRole } = usePermissions()

  if (adminContent && hasRole('admin')) {
    return <>{adminContent}</>
  }

  if (managerContent && hasRole('manager')) {
    return <>{managerContent}</>
  }

  if (editorContent && hasRole('editor')) {
    return <>{editorContent}</>
  }

  if (viewerContent && hasRole('viewer')) {
    return <>{viewerContent}</>
  }

  if (defaultContent) {
    return <>{defaultContent}</>
  }

  return <>{children}</>
}

/**
 * Component that renders different UI based on user capabilities
 */
interface CapabilityBasedUIProps {
  canCreate?: React.ReactNode
  canRead?: React.ReactNode
  canUpdate?: React.ReactNode
  canDelete?: React.ReactNode
  resource: PermissionResource
  fallback?: React.ReactNode
}

export function CapabilityBasedUI({
  canCreate,
  canRead,
  canUpdate,
  canDelete,
  resource,
  fallback = null,
}: CapabilityBasedUIProps) {
  const { can } = usePermissions()

  const capabilities = []

  if (canCreate && can('create', resource)) {
    capabilities.push(canCreate)
  }

  if (canRead && can('read', resource)) {
    capabilities.push(canRead)
  }

  if (canUpdate && can('update', resource)) {
    capabilities.push(canUpdate)
  }

  if (canDelete && can('delete', resource)) {
    capabilities.push(canDelete)
  }

  if (capabilities.length === 0) {
    return <>{fallback}</>
  }

  return (
    <>
      {capabilities.map((capability, index) => (
        <React.Fragment key={index}>{capability}</React.Fragment>
      ))}
    </>
  )
}