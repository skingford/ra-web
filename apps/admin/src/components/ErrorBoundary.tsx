import React from 'react'
import { Box, Text, Button, VStack } from '@chakra-ui/react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} minH="100vh" bg="red.50" display="flex" alignItems="center" justifyContent="center">
          <VStack gap={4} maxW="600px" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              应用出现错误
            </Text>
            <Text color="red.700">
              {this.state.error?.message || '未知错误'}
            </Text>
            <Button 
              colorScheme="red" 
              onClick={() => window.location.reload()}
            >
              重新加载页面
            </Button>
            <Box as="pre" p={4} bg="red.100" borderRadius="md" fontSize="sm" textAlign="left" overflow="auto">
              {this.state.error?.stack}
            </Box>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}