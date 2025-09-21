// Performance optimization demonstration page
import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'
import { 
  OptimizedDataTable, 
  OptimizedChartWidget, 
  VirtualizedList,
  usePerformanceMonitor,
  useMemoryMonitor,
  useDebounce,
  useThrottle,
} from '../components/optimized'

// Generate mock data for demonstrations
const generateMockData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
    category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
    date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)],
  }))
}

const generateChartData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    name: `Point ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 20,
    category: ['Sales', 'Marketing', 'Support'][Math.floor(Math.random() * 3)],
  }))
}

export default function PerformanceDemo() {
  const [dataSize, setDataSize] = useState(1000)
  const [renderCount, setRenderCount] = useState(0)
  const { getStats } = usePerformanceMonitor('PerformanceDemo')
  const { getMemoryStats } = useMemoryMonitor()

  // Memoized data generation
  const tableData = useMemo(() => generateMockData(dataSize), [dataSize])
  const chartData = useMemo(() => generateChartData(50), [])
  const virtualListData = useMemo(() => generateMockData(10000), [])

  // Table columns configuration
  const tableColumns = useMemo(() => [
    { key: 'name' as const, label: 'Name', sortable: true, filterable: true },
    { key: 'value' as const, label: 'Value', sortable: true },
    { key: 'category' as const, label: 'Category', filterable: true },
    { key: 'date' as const, label: 'Date', sortable: true },
    { 
      key: 'status' as const, 
      label: 'Status', 
      render: (value: string) => (
        <Badge colorScheme={value === 'active' ? 'green' : value === 'inactive' ? 'red' : 'yellow'}>
          {value}
        </Badge>
      )
    },
  ], [])

  // Chart configuration
  const chartConfig = useMemo(() => ({
    type: 'line' as const,
    title: 'Performance Chart',
    dataKey: 'value',
    xAxisKey: 'name',
    showGrid: true,
    showLegend: true,
    animate: true,
  }), [])

  // Optimized event handlers
  const handleDataSizeChange = useCallback((size: number) => {
    setDataSize(size)
  }, [])

  const handleForceRerender = useCallback(() => {
    setRenderCount(prev => prev + 1)
  }, [])

  // Debounced search handler
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Throttled scroll handler
  const handleScroll = useThrottle(() => {
    console.log('Scroll event handled')
  }, 100)

  // Virtual list item renderer
  const renderVirtualItem = useCallback((item: any, index: number) => (
    <Box
      p={3}
      borderBottom="1px"
      borderColor="gray.200"
      bg={index % 2 === 0 ? 'white' : 'gray.50'}
    >
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Text fontWeight="semibold">{item.name}</Text>
          <Text fontSize="sm" color="gray.600">Category: {item.category}</Text>
        </VStack>
        <VStack align="end" spacing={1}>
          <Text fontWeight="bold">{item.value}</Text>
          <Badge colorScheme={item.status === 'active' ? 'green' : 'red'}>
            {item.status}
          </Badge>
        </VStack>
      </HStack>
    </Box>
  ), [])

  const performanceStats = getStats()
  const memoryStats = getMemoryStats()

  return (
    <Box p={6} maxW="1400px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>Performance Optimization Demo</Heading>
          <Text color="gray.600">
            Demonstrating React performance optimizations including memoization, 
            virtualization, and efficient rendering techniques.
          </Text>
        </Box>

        {/* Performance Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Render Count</StatLabel>
                <StatNumber>{performanceStats.renderCount}</StatNumber>
                <StatHelpText>Component renders</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Avg Render Time</StatLabel>
                <StatNumber>{performanceStats.avgRenderTime}ms</StatNumber>
                <StatHelpText>Average render duration</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Slow Renders</StatLabel>
                <StatNumber>{performanceStats.slowRenders}</StatNumber>
                <StatHelpText>Renders &gt; 16ms</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {memoryStats && (
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Memory Usage</StatLabel>
                  <StatNumber>{memoryStats.usedMB}MB</StatNumber>
                  <StatHelpText>{memoryStats.usagePercent}% of limit</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          )}
        </Grid>

        {/* Controls */}
        <Card>
          <CardHeader>
            <Heading size="md">Performance Controls</Heading>
          </CardHeader>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Button onClick={() => handleDataSizeChange(100)} size="sm">
                100 Items
              </Button>
              <Button onClick={() => handleDataSizeChange(1000)} size="sm">
                1K Items
              </Button>
              <Button onClick={() => handleDataSizeChange(5000)} size="sm">
                5K Items
              </Button>
              <Button onClick={() => handleDataSizeChange(10000)} size="sm">
                10K Items
              </Button>
              <Button onClick={handleForceRerender} colorScheme="orange" size="sm">
                Force Re-render
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Performance Warnings */}
        {performanceStats.slowRenders > 0 && (
          <Alert status="warning">
            <AlertIcon />
            Detected {performanceStats.slowRenders} slow renders. Consider optimizing components.
          </Alert>
        )}

        {/* Demo Tabs */}
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Optimized Data Table</Tab>
            <Tab>Optimized Charts</Tab>
            <Tab>Virtual Scrolling</Tab>
            <Tab>Performance Hooks</Tab>
          </TabList>

          <TabPanels>
            {/* Optimized Data Table */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md" mb={2}>Optimized Data Table</Heading>
                  <Text color="gray.600" mb={4}>
                    Features: React.memo, useMemo for filtering/sorting, useCallback for event handlers,
                    memoized sub-components, and efficient pagination.
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    Current dataset: {dataSize.toLocaleString()} items
                  </Text>
                </Box>
                
                <OptimizedDataTable
                  data={tableData}
                  columns={tableColumns}
                  pageSize={25}
                />
              </VStack>
            </TabPanel>

            {/* Optimized Charts */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md" mb={2}>Optimized Chart Widget</Heading>
                  <Text color="gray.600" mb={4}>
                    Features: Memoized chart components, intersection observer for lazy rendering,
                    optimized re-renders, and efficient data processing.
                  </Text>
                </Box>

                <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
                  <OptimizedChartWidget
                    data={chartData}
                    config={{ ...chartConfig, type: 'line' }}
                    height={300}
                  />
                  <OptimizedChartWidget
                    data={chartData}
                    config={{ ...chartConfig, type: 'bar', title: 'Bar Chart' }}
                    height={300}
                  />
                </Grid>
              </VStack>
            </TabPanel>

            {/* Virtual Scrolling */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md" mb={2}>Virtual Scrolling</Heading>
                  <Text color="gray.600" mb={4}>
                    Efficiently renders large lists by only rendering visible items.
                    This demo shows 10,000 items with smooth scrolling performance.
                  </Text>
                </Box>

                <VirtualizedList
                  items={virtualListData}
                  renderItem={renderVirtualItem}
                  searchable
                  onSearch={(query) => console.log('Search:', query)}
                  containerHeight={400}
                />
              </VStack>
            </TabPanel>

            {/* Performance Hooks */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Heading size="md" mb={2}>Performance Hooks Demo</Heading>
                  <Text color="gray.600" mb={4}>
                    Demonstrating custom hooks for debouncing, throttling, and other optimizations.
                  </Text>
                </Box>

                <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                  <Card>
                    <CardHeader>
                      <Heading size="sm">Debounced Search</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <input
                          type="text"
                          placeholder="Type to search (300ms delay)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <Text fontSize="sm">
                          Debounced value: <Badge>{debouncedSearch || 'None'}</Badge>
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Heading size="sm">Throttled Events</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <Box
                          h="100px"
                          bg="gray.100"
                          borderRadius="md"
                          onScroll={handleScroll}
                          overflow="auto"
                          p={3}
                        >
                          <Box h="300px">
                            <Text>Scroll this area to see throttled events in console</Text>
                          </Box>
                        </Box>
                        <Text fontSize="sm" color="gray.600">
                          Scroll events are throttled to 100ms intervals
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}