import { lazy, Suspense } from 'react'
import { Box, Spinner, VStack, Text, Skeleton, SkeletonText } from '@chakra-ui/react'

// Lazy load the heavy DataTable component
const DataTable = lazy(() => 
  import('../data/DataTable').then(module => ({
    default: module.DataTable
  }))
)

// Loading skeleton for data table
const DataTableSkeleton = () => (
  <VStack gap={4} align="stretch">
    {/* Toolbar skeleton */}
    <Box display="flex" justifyContent="space-between" align="center">
      <Skeleton height="40px" width="300px" />
      <Skeleton height="40px" width="120px" />
    </Box>
    
    {/* Table header skeleton */}
    <Box border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden">
      <Box bg="gray.50" p={4}>
        <Box display="flex" gap={4}>
          <Skeleton height="20px" width="30px" />
          <Skeleton height="20px" width="150px" />
          <Skeleton height="20px" width="120px" />
          <Skeleton height="20px" width="100px" />
          <Skeleton height="20px" width="80px" />
        </Box>
      </Box>
      
      {/* Table rows skeleton */}
      {Array.from({ length: 5 }).map((_, index) => (
        <Box key={index} p={4} borderTop="1px" borderColor="gray.100">
          <Box display="flex" gap={4} align="center">
            <Skeleton height="16px" width="30px" />
            <SkeletonText noOfLines={1} width="150px" />
            <SkeletonText noOfLines={1} width="120px" />
            <SkeletonText noOfLines={1} width="100px" />
            <Skeleton height="24px" width="80px" />
          </Box>
        </Box>
      ))}
    </Box>
    
    {/* Pagination skeleton */}
    <Box display="flex" justifyContent="space-between" align="center">
      <SkeletonText noOfLines={1} width="200px" />
      <Box display="flex" gap={2}>
        <Skeleton height="32px" width="60px" />
        <Skeleton height="32px" width="80px" />
        <Skeleton height="32px" width="60px" />
        <Skeleton height="32px" width="60px" />
      </Box>
    </Box>
  </VStack>
)

// Fallback loader for initial load
const DataTableLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minH="200px"
    w="100%"
  >
    <VStack gap={3}>
      <Spinner size="lg" colorScheme="blue" />
      <Text color="gray.600">Loading data table...</Text>
    </VStack>
  </Box>
)

// Wrapper component with suspense and enhanced loading states
export const LazyDataTable = (props: any) => {
  // Use skeleton for better UX when we know the structure
  const useSkeletonLoader = props.showSkeleton !== false
  
  return (
    <Suspense fallback={useSkeletonLoader ? <DataTableSkeleton /> : <DataTableLoader />}>
      <DataTable {...props} />
    </Suspense>
  )
}