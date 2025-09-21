import { lazy, Suspense } from 'react'
import { Box, Spinner, VStack, Text } from '@chakra-ui/react'

// Lazy load the heavy InteractiveCharts component
const InteractiveCharts = lazy(() => 
  import('../widgets/InteractiveCharts').then(module => ({
    default: module.InteractiveCharts
  }))
)

// Loading fallback for charts
const ChartsLoader = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minH="400px"
    w="100%"
    bg="gray.50"
    borderRadius="lg"
    border="1px"
    borderColor="gray.200"
  >
    <VStack gap={3}>
      <Spinner size="lg" colorScheme="blue" />
      <Text color="gray.600">Loading interactive charts...</Text>
      <Text fontSize="sm" color="gray.500">
        This may take a moment for the first load
      </Text>
    </VStack>
  </Box>
)

// Wrapper component with suspense
export const LazyInteractiveCharts = (props: any) => (
  <Suspense fallback={<ChartsLoader />}>
    <InteractiveCharts {...props} />
  </Suspense>
)