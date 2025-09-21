import { lazy, Suspense } from 'react'
import { Box, Spinner, VStack, Text, Skeleton, SkeletonText } from '@chakra-ui/react'

// Lazy load the FormBuilder component
const FormBuilder = lazy(() => 
  import('../forms/FormBuilder').then(module => ({
    default: module.FormBuilder
  }))
)

// Form skeleton loader
const FormSkeleton = () => (
  <VStack gap={6} align="stretch">
    {/* Form title skeleton */}
    <VStack align="start" gap={2}>
      <Skeleton height="32px" width="300px" />
      <SkeletonText noOfLines={2} width="500px" />
    </VStack>
    
    {/* Form fields skeleton */}
    {Array.from({ length: 4 }).map((_, index) => (
      <VStack key={index} align="stretch" gap={2}>
        <Skeleton height="20px" width="120px" />
        <Skeleton height="40px" width="100%" />
        <SkeletonText noOfLines={1} width="250px" />
      </VStack>
    ))}
    
    {/* Form actions skeleton */}
    <Box display="flex" justifyContent="flex-end" gap={3} pt={4}>
      <Skeleton height="40px" width="80px" />
      <Skeleton height="40px" width="100px" />
    </Box>
  </VStack>
)

// Simple loader for initial load
const FormLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minH="300px"
    w="100%"
  >
    <VStack gap={3}>
      <Spinner size="lg" colorScheme="blue" />
      <Text color="gray.600">Loading form builder...</Text>
    </VStack>
  </Box>
)

// Wrapper component with suspense
export const LazyFormBuilder = (props: any) => {
  const useSkeletonLoader = props.showSkeleton !== false
  
  return (
    <Suspense fallback={useSkeletonLoader ? <FormSkeleton /> : <FormLoader />}>
      <FormBuilder {...props} />
    </Suspense>
  )
}