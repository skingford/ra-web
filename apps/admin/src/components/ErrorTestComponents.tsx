import React, { useState } from 'react'
import { 
  Box, 
  Button, 
  VStack, 
  HStack, 
  Text, 
  Alert, 
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code
} from '@chakra-ui/react'
import { ErrorBoundary } from './ErrorBoundary'
import { WidgetErrorBoundary } from './WidgetErrorBoundary'
import { withErrorBoundary } from './withErrorBoundary'

// Component that throws an error on demand
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean; errorType: string }> = ({ 
  shouldThrow, 
  errorType 
}) => {
  if (shouldThrow) {
    switch (errorType) {
      case 'render':
        throw new Error('Simulated render error')
      case 'async':
        setTimeout(() => {
          throw new Error('Simulated async error')
        }, 100)
        break
      case 'network':
        throw new Error('Network request failed: 500 Internal Server Error')
      default:
        throw new Error('Generic error')
    }
  }
  
  return (
    <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
      <Text color="green.700">✅ Component is working normally</Text>
    </Box>
  )
}

// Widget component wrapped with error boundary
const TestWidget: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  return (
    <WidgetErrorBoundary widgetName="Test Widget">
      <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
        <Text fontWeight="semibold" mb={2}>Test Widget</Text>
        <ErrorThrowingComponent shouldThrow={shouldError} errorType="render" />
      </Box>
    </WidgetErrorBoundary>
  )
}

// Component wrapped with HOC
const HOCWrappedComponent = withErrorBoundary(
  ({ shouldError }: { shouldError: boolean }) => (
    <Box p={4} bg="purple.50" borderRadius="md" border="1px" borderColor="purple.200">
      <Text fontWeight="semibold" mb={2}>HOC Wrapped Component</Text>
      <ErrorThrowingComponent shouldThrow={shouldError} errorType="render" />
    </Box>
  ),
  { level: 'component' }
)

export const ErrorBoundaryTestSuite: React.FC = () => {
  const [globalError, setGlobalError] = useState(false)
  const [routeError, setRouteError] = useState(false)
  const [widgetError, setWidgetError] = useState(false)
  const [hocError, setHocError] = useState(false)

  return (
    <Box p={6} maxW="800px" mx="auto">
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Error Boundary Test Suite
          </Text>
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Testing Error Boundaries</AlertTitle>
              <AlertDescription>
                Use the buttons below to test different levels of error boundaries.
                Each test will simulate an error at different component levels.
              </AlertDescription>
            </Box>
          </Alert>
        </Box>

        {/* Global Error Test */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            1. Global Error Boundary Test
          </Text>
          <VStack gap={3} align="stretch">
            <HStack>
              <Button 
                colorScheme="red" 
                size="sm"
                onClick={() => setGlobalError(true)}
              >
                Trigger Global Error
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setGlobalError(false)}
              >
                Reset
              </Button>
            </HStack>
            <ErrorThrowingComponent shouldThrow={globalError} errorType="render" />
          </VStack>
        </Box>

        {/* Route Error Test */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            2. Route Error Boundary Test
          </Text>
          <VStack gap={3} align="stretch">
            <HStack>
              <Button 
                colorScheme="orange" 
                size="sm"
                onClick={() => setRouteError(true)}
              >
                Trigger Route Error
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setRouteError(false)}
              >
                Reset
              </Button>
            </HStack>
            <ErrorBoundary level="route">
              <ErrorThrowingComponent shouldThrow={routeError} errorType="render" />
            </ErrorBoundary>
          </VStack>
        </Box>

        {/* Widget Error Test */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            3. Widget Error Boundary Test
          </Text>
          <VStack gap={3} align="stretch">
            <HStack>
              <Button 
                colorScheme="blue" 
                size="sm"
                onClick={() => setWidgetError(true)}
              >
                Trigger Widget Error
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setWidgetError(false)}
              >
                Reset
              </Button>
            </HStack>
            <TestWidget shouldError={widgetError} />
          </VStack>
        </Box>

        {/* HOC Error Test */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            4. HOC Wrapped Component Test
          </Text>
          <VStack gap={3} align="stretch">
            <HStack>
              <Button 
                colorScheme="purple" 
                size="sm"
                onClick={() => setHocError(true)}
              >
                Trigger HOC Error
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setHocError(false)}
              >
                Reset
              </Button>
            </HStack>
            <HOCWrappedComponent shouldError={hocError} />
          </VStack>
        </Box>

        {/* Error Types Demo */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={3}>
            5. Different Error Types
          </Text>
          <VStack gap={2} align="stretch">
            <HStack wrap="wrap" gap={2}>
              <Button size="sm" colorScheme="red" variant="outline">
                Render Error
              </Button>
              <Button size="sm" colorScheme="red" variant="outline">
                Async Error
              </Button>
              <Button size="sm" colorScheme="red" variant="outline">
                Network Error
              </Button>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              <Code>Note:</Code> Different error types help test various error boundary scenarios
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}