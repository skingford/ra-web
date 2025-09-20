import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Box, VStack, Text, Button, Heading } from '@chakra-ui/react'
import { usePermissions } from '../../lib/hooks/usePermissions'
import type { PermissionAction, PermissionResource, PermissionCheck } from '../../lib/permissions'

interface RouteGuardProps {
  children: React.ReactNode
  resource?: PermissionResource
  action?: PermissionAction
  conditions?: Record<string, any>
  permissions?: PermissionCheck[]
  roles?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  redirectTo?: string
  showAccessDenied?: boolean
}

export function RouteGuard({
  children,
  resource,
  action,
  conditions,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback,
  redirectTo,
  showAccessDenied = true,
}: RouteGuardProps) {
  const location = useLocation()
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
    hasAllRoles,
  } = usePermissions()

  // Check single permission
  const hasSinglePermission = resource && action 
    ? hasPermission(resource, action, conditions)
    : true

  // Check multiple permissions
  const hasMultiplePermissions = permissions.length > 0
    ? requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    : true

  // Check roles
  const hasRequiredRoles = roles.length > 0
    ? requireAll
      ? hasAllRoles(roles)
      : hasAnyRole(roles)
    : true

  const hasAccess = hasSinglePermission && hasMultiplePermissions && hasRequiredRoles

  if (!hasAccess) {
    // If redirect path is specified, redirect there
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    }

    // If custom fallback is provided, render it
    if (fallback) {
      return <>{fallback}</>
    }

    // If access denied UI should be shown, render it
    if (showAccessDenied) {
      return <AccessDeniedUI />
    }

    // Otherwise, redirect to home or login
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

/**
 * Default Access Denied UI component
 */
function AccessDeniedUI() {
  const location = useLocation()

  const handleGoBack = () => {
    window.history.back()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="neutral.50"
      px={4}
    >
      <VStack gap={6} textAlign="center" maxW="500px">
        <Box fontSize="8xl" color="neutral.400">
          🔒
        </Box>
        
        <VStack gap={3}>
          <Heading size="xl" color="neutral.700">
            Access Denied
          </Heading>
          <Text color="neutral.600" fontSize="lg">
            You don't have permission to access this page
          </Text>
          <Text color="neutral.500" fontSize="sm">
            Please contact your administrator if you believe this is an error.
          </Text>
        </VStack>

        <VStack gap={3} w="full">
          <Button onClick={handleGoBack} variant="outline" w="full">
            Go Back
          </Button>
          <Button onClick={handleGoHome} w="full">
            Go to Dashboard
          </Button>
        </VStack>

        <Box p={4} bg="neutral.100" borderRadius="md" w="full">
          <Text fontSize="xs" color="neutral.600" fontFamily="mono">
            Requested path: {location.pathname}
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

/**
 * Higher-order component for route protection
 */
export function withRouteGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps: Omit<RouteGuardProps, 'children'>
) {
  const GuardedComponent = (props: P) => (
    <RouteGuard {...guardProps}>
      <WrappedComponent {...props} />
    </RouteGuard>
  )

  GuardedComponent.displayName = `withRouteGuard(${WrappedComponent.displayName || WrappedComponent.name})`

  return GuardedComponent
}

/**
 * Component for protecting admin routes
 */
interface AdminRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminRoute({ children, fallback }: AdminRouteProps) {
  return (
    <RouteGuard
      roles={['admin', 'super_admin']}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

/**
 * Component for protecting manager routes
 */
interface ManagerRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ManagerRoute({ children, fallback }: ManagerRouteProps) {
  return (
    <RouteGuard
      roles={['manager', 'admin', 'super_admin']}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

/**
 * Component for protecting editor routes
 */
interface EditorRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function EditorRoute({ children, fallback }: EditorRouteProps) {
  return (
    <RouteGuard
      roles={['editor', 'manager', 'admin', 'super_admin']}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

/**
 * Component for routes that require specific permissions
 */
interface PermissionRouteProps {
  children: React.ReactNode
  resource: PermissionResource
  action: PermissionAction
  conditions?: Record<string, any>
  fallback?: React.ReactNode
}

export function PermissionRoute({
  children,
  resource,
  action,
  conditions,
  fallback,
}: PermissionRouteProps) {
  return (
    <RouteGuard
      resource={resource}
      action={action}
      conditions={conditions}
      fallback={fallback}
    >
      {children}
    </RouteGuard>
  )
}

/**
 * Utility function to create route configuration with permissions
 */
export interface ProtectedRouteConfig {
  path: string
  element: React.ComponentType
  resource?: PermissionResource
  action?: PermissionAction
  conditions?: Record<string, any>
  permissions?: PermissionCheck[]
  roles?: string[]
  requireAll?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function createProtectedRoute(config: ProtectedRouteConfig) {
  const {
    element: Element,
    resource,
    action,
    conditions,
    permissions,
    roles,
    requireAll,
    redirectTo,
    fallback,
  } = config

  return (
    <RouteGuard
      resource={resource}
      action={action}
      conditions={conditions}
      permissions={permissions}
      roles={roles}
      requireAll={requireAll}
      redirectTo={redirectTo}
      fallback={fallback}
    >
      <Element />
    </RouteGuard>
  )
}