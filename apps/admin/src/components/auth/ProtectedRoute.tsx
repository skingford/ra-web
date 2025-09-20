import { Navigate, useLocation } from 'react-router-dom'
import { Box, Spinner, VStack, Text } from '@chakra-ui/react'
import { useAuthStore } from '../../stores/authStore'
import { authTokenManager } from '../../lib/auth'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [],
  fallback 
}: ProtectedRouteProps) {
  const location = useLocation()
  const { isAuthenticated, token, hasPermission, isLoading } = useAuthStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!isAuthenticated || !token) {
        setIsCheckingAuth(false)
        return
      }

      // Check if token is expired
      if (authTokenManager.isTokenExpired(token)) {
        try {
          await authTokenManager.refreshAccessToken()
        } catch (error) {
          console.error('Token refresh failed:', error)
        }
      }

      setIsCheckingAuth(false)
    }

    checkAuthentication()
  }, [isAuthenticated, token])

  // Show loading spinner while checking authentication
  if (isLoading || isCheckingAuth) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="neutral.50"
      >
        <VStack gap={4}>
          <Spinner size="lg" color="brand.500" />
          <Text color="neutral.600">Checking authentication...</Text>
        </VStack>
      </Box>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    )
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )

    if (!hasAllPermissions) {
      if (fallback) {
        return <>{fallback}</>
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
          <VStack gap={4} textAlign="center">
            <Text fontSize="6xl">🔒</Text>
            <Text fontSize="xl" fontWeight="semibold" color="neutral.700">
              Access Denied
            </Text>
            <Text color="neutral.600" maxW="400px">
              You don't have the required permissions to access this page.
              Please contact your administrator if you believe this is an error.
            </Text>
          </VStack>
        </Box>
      )
    }
  }

  return <>{children}</>
}

interface RequirePermissionProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequirePermission({ 
  permission, 
  children, 
  fallback 
}: RequirePermissionProps) {
  const { hasPermission } = useAuthStore()

  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null
  }

  return <>{children}</>
}

interface RequireRoleProps {
  role: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequireRole({ 
  role, 
  children, 
  fallback 
}: RequireRoleProps) {
  const { user } = useAuthStore()

  const hasRole = user?.roles.some(userRole => userRole.name === role) ?? false

  if (!hasRole) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null
  }

  return <>{children}</>
}