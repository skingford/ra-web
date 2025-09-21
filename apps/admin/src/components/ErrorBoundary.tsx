import React, { useState } from 'react'
import { 
  Box, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Collapsible,
  Alert
} from '@chakra-ui/react'
import { FiAlertTriangle, FiX, FiChevronDown, FiChevronRight } from 'react-icons/fi'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId?: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  level?: 'global' | 'route' | 'component'
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
}

interface ErrorFallbackProps {
  error: Error
  errorInfo?: React.ErrorInfo
  resetError: () => void
  level: 'global' | 'route' | 'component'
}

// Default fallback components for different levels
export const GlobalErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => setIsOpen(!isOpen)
  
  return (
    <Box p={8} minH="100vh" bg="red.50" display="flex" alignItems="center" justifyContent="center">
      <VStack gap={6} maxW="600px" textAlign="center">
        <Text fontSize="4xl">⚠️</Text>
        <VStack gap={2}>
          <Text fontSize="3xl" fontWeight="bold" color="red.600">
            Application Error
          </Text>
          <Text fontSize="lg" color="red.700">
            Something went wrong. The application has encountered an unexpected error.
          </Text>
        </VStack>
        
        <Alert.Root status="error" borderRadius="md">
          <Alert.Icon as={FiAlertTriangle} />
          <Box>
            <Alert.Title>Error Details:</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Box>
        </Alert.Root>

        <HStack gap={4}>
          <Button 
            colorScheme="red" 
            onClick={resetError}
            leftIcon={<Text>🔄</Text>}
          >
            Try Again
          </Button>
          <Button 
            variant="outline"
            colorScheme="red"
            onClick={() => window.location.href = '/'}
            leftIcon={<Text>🏠</Text>}
          >
            Go Home
          </Button>
        </HStack>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          rightIcon={<Text>{isOpen ? '▲' : '▼'}</Text>}
        >
          {isOpen ? 'Hide' : 'Show'} Technical Details
        </Button>

        <Collapsible.Root open={isOpen}>
          <Collapsible.Content>
            <Box 
              as="pre" 
              p={4} 
              bg="red.100" 
              borderRadius="md" 
              fontSize="xs" 
              textAlign="left" 
              overflow="auto"
              maxH="200px"
              w="100%"
            >
              {error.stack}
            </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      </VStack>
    </Box>
  )
}

export const RouteErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <Box p={6} bg="red.50" borderRadius="lg" border="1px" borderColor="red.200">
      <VStack gap={4} textAlign="center">
        <Text fontSize="2xl">⚠️</Text>
        <VStack gap={2}>
          <Text fontSize="xl" fontWeight="semibold" color="red.600">
            Page Error
          </Text>
          <Text color="red.700">
            This page encountered an error and couldn't load properly.
          </Text>
        </VStack>
        
        <Alert.Root status="error" size="sm">
          <Alert.Icon as={FiAlertTriangle} />
          <Alert.Description fontSize="sm">{error.message}</Alert.Description>
        </Alert.Root>

        <HStack gap={3}>
          <Button size="sm" colorScheme="red" onClick={resetError}>
            Retry
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}

export const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <Alert.Root status="error" borderRadius="md">
      <Alert.Icon as={FiAlertTriangle} />
      <Box flex="1">
        <Alert.Title fontSize="sm">Component Error</Alert.Title>
        <Alert.Description fontSize="xs">{error.message}</Alert.Description>
      </Box>
      <Button size="xs" variant="outline" colorScheme="red" onClick={resetError}>
        Retry
      </Button>
    </Alert.Root>
  )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { 
      hasError: true, 
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Store error info in state
    this.setState({ errorInfo })
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error to monitoring service (placeholder)
    this.reportError(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetError()
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetError()
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In a real application, you would send this to your error reporting service
    // e.g., Sentry, LogRocket, Bugsnag, etc.
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    }
    
    console.log('Error Report:', errorReport)
    
    // Example: Send to monitoring service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const { fallback: CustomFallback, level = 'global' } = this.props
      
      if (CustomFallback) {
        return (
          <CustomFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
            level={level}
          />
        )
      }

      // Use default fallback based on level
      const fallbackProps = {
        error: this.state.error,
        errorInfo: this.state.errorInfo,
        resetError: this.resetError,
        level
      }

      switch (level) {
        case 'route':
          return <RouteErrorFallback {...fallbackProps} />
        case 'component':
          return <ComponentErrorFallback {...fallbackProps} />
        case 'global':
        default:
          return <GlobalErrorFallback {...fallbackProps} />
      }
    }

    return this.props.children
  }
}

// Hook for functional components to trigger error boundaries
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Manual error trigger:', error, errorInfo)
    throw error
  }
}