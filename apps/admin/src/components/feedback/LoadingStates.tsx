import React from 'react'
import {
  Box,
  Spinner,
  Progress,
  Text,
  VStack,
  HStack,
  Skeleton,
  SkeletonText,
  SkeletonCircle
} from '@chakra-ui/react'
import { CircularProgress } from '../ui/CircularProgress'

// Basic loading spinner
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  label?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue.500',
  label
}) => {
  return (
    <VStack spacing={3}>
      <Spinner size={size} color={color} />
      {label && (
        <Text fontSize="sm" color="gray.600">
          {label}
        </Text>
      )}
    </VStack>
  )
}

// Progress bar with percentage
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  colorScheme?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  colorScheme = 'blue',
  size = 'md'
}) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <VStack spacing={2} w="full">
      {label && (
        <HStack w="full" justify="space-between">
          <Text fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          {showPercentage && (
            <Text fontSize="sm" color="gray.600">
              {percentage}%
            </Text>
          )}
        </HStack>
      )}
      <Progress
        value={percentage}
        colorScheme={colorScheme}
        size={size}
        w="full"
        borderRadius="md"
      />
    </VStack>
  )
}

// Circular progress indicator
interface CircularProgressIndicatorProps {
  value: number
  max?: number
  size?: string
  color?: string
  trackColor?: string
  showLabel?: boolean
  label?: string
}

export const CircularProgressIndicator: React.FC<CircularProgressIndicatorProps> = ({
  value,
  max = 100,
  size = '60px',
  color = 'blue.400',
  trackColor,
  showLabel = true,
  label
}) => {
  const percentage = Math.round((value / max) * 100)

  return (
    <VStack spacing={2}>
      <CircularProgress
        value={percentage}
        size={size}
        color={color}
        trackColor={trackColor}
        showLabel={showLabel}
        label={`${percentage}%`}
      />
      {label && (
        <Text fontSize="sm" textAlign="center">
          {label}
        </Text>
      )}
    </VStack>
  )
}

// Skeleton loaders for different content types
interface SkeletonLoaderProps {
  type: 'text' | 'card' | 'list' | 'table' | 'avatar' | 'custom'
  lines?: number
  height?: string | number
  width?: string | number
  isLoaded?: boolean
  children?: React.ReactNode
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type,
  lines = 3,
  height = '20px',
  width = '100%',
  isLoaded = false,
  children
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return <SkeletonText noOfLines={lines} spacing="4" skeletonHeight="2" />
      
      case 'card':
        return (
          <Box p={6} boxShadow="lg" bg="white" borderRadius="md">
            <SkeletonCircle size="10" />
            <SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
          </Box>
        )
      
      case 'list':
        return (
          <VStack spacing={4} align="stretch">
            {Array.from({ length: lines }).map((_, index) => (
              <HStack key={index} spacing={4}>
                <SkeletonCircle size="8" />
                <VStack align="stretch" flex={1} spacing={2}>
                  <Skeleton height="16px" />
                  <Skeleton height="12px" width="60%" />
                </VStack>
              </HStack>
            ))}
          </VStack>
        )
      
      case 'table':
        return (
          <VStack spacing={2} align="stretch">
            <Skeleton height="40px" /> {/* Header */}
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton key={index} height="32px" />
            ))}
          </VStack>
        )
      
      case 'avatar':
        return <SkeletonCircle size={height as string} />
      
      case 'custom':
        return <Skeleton height={height} width={width} />
      
      default:
        return <Skeleton height={height} width={width} />
    }
  }

  if (isLoaded && children) {
    return <>{children}</>
  }

  return renderSkeleton()
}

// Full page loading overlay
interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children
}) => {
  const overlayBg = 'rgba(255, 255, 255, 0.8)'

  return (
    <Box position="relative">
      {children}
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={overlayBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={999}
          backdropFilter="blur(2px)"
        >
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text fontSize="lg" fontWeight="medium">
              {message}
            </Text>
          </VStack>
        </Box>
      )}
    </Box>
  )
}

// Button loading state
interface LoadingButtonProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  [key: string]: any
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText,
  children,
  ...props
}) => {
  return (
    <Box {...props} opacity={isLoading ? 0.6 : 1} cursor={isLoading ? 'not-allowed' : 'pointer'}>
      {isLoading ? (
        <HStack spacing={2}>
          <Spinner size="sm" />
          <Text>{loadingText || 'Loading...'}</Text>
        </HStack>
      ) : (
        children
      )}
    </Box>
  )
}