// Optimized Chart Widget with React performance optimizations
import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Spinner,
  Alert,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { FiRefreshCw, FiDownload, FiSettings, FiAlertTriangle } from 'react-icons/fi'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Chart data interfaces
interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

interface ChartConfig {
  type: 'line' | 'bar' | 'pie'
  title: string
  dataKey: string
  xAxisKey?: string
  colors?: string[]
  showGrid?: boolean
  showLegend?: boolean
  animate?: boolean
}

interface OptimizedChartWidgetProps {
  data: ChartDataPoint[]
  config: ChartConfig
  loading?: boolean
  error?: string
  height?: number
  onRefresh?: () => void
  onExport?: (format: 'png' | 'svg' | 'csv') => void
  onConfigChange?: (config: Partial<ChartConfig>) => void
}

// Memoized chart components for better performance
const MemoizedLineChart = memo(({ 
  data, 
  config, 
  height 
}: { 
  data: ChartDataPoint[]
  config: ChartConfig
  height: number 
}) => {
  const colors = config.colors || ['#3182CE', '#38A169', '#E53E3E', '#D69E2E']
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          dataKey={config.xAxisKey || 'name'} 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#E2E8F0' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#E2E8F0' }}
        />
        <RechartsTooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E2E8F0',
            borderRadius: '6px'
          }}
        />
        {config.showLegend && <Legend />}
        <Line 
          type="monotone" 
          dataKey={config.dataKey} 
          stroke={colors[0]}
          strokeWidth={2}
          dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
          animationDuration={config.animate ? 1000 : 0}
        />
      </LineChart>
    </ResponsiveContainer>
  )
})

const MemoizedBarChart = memo(({ 
  data, 
  config, 
  height 
}: { 
  data: ChartDataPoint[]
  config: ChartConfig
  height: number 
}) => {
  const colors = config.colors || ['#3182CE', '#38A169', '#E53E3E', '#D69E2E']
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis 
          dataKey={config.xAxisKey || 'name'} 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#E2E8F0' }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          axisLine={{ stroke: '#E2E8F0' }}
        />
        <RechartsTooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E2E8F0',
            borderRadius: '6px'
          }}
        />
        {config.showLegend && <Legend />}
        <Bar 
          dataKey={config.dataKey} 
          fill={colors[0]}
          radius={[4, 4, 0, 0]}
          animationDuration={config.animate ? 1000 : 0}
        />
      </BarChart>
    </ResponsiveContainer>
  )
})

const MemoizedPieChart = memo(({ 
  data, 
  config, 
  height 
}: { 
  data: ChartDataPoint[]
  config: ChartConfig
  height: number 
}) => {
  const colors = config.colors || ['#3182CE', '#38A169', '#E53E3E', '#D69E2E', '#805AD5', '#D53F8C']
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={Math.min(height * 0.35, 120)}
          fill="#8884d8"
          dataKey={config.dataKey}
          animationDuration={config.animate ? 1000 : 0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <RechartsTooltip 
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #E2E8F0',
            borderRadius: '6px'
          }}
        />
        {config.showLegend && <Legend />}
      </PieChart>
    </ResponsiveContainer>
  )
})

// Memoized chart header with controls
const ChartHeader = memo(({
  title,
  onRefresh,
  onExport,
  onConfigChange,
  chartType,
  isLoading,
}: {
  title: string
  onRefresh?: () => void
  onExport?: (format: 'png' | 'svg' | 'csv') => void
  onConfigChange?: (config: Partial<ChartConfig>) => void
  chartType: 'line' | 'bar' | 'pie'
  isLoading: boolean
}) => {
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'csv'>('png')

  const handleExport = useCallback(() => {
    onExport?.(exportFormat)
  }, [onExport, exportFormat])

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange?.({ type: e.target.value as 'line' | 'bar' | 'pie' })
  }, [onConfigChange])

  return (
    <HStack justify="space-between" mb={4}>
      <Text fontSize="lg" fontWeight="semibold">{title}</Text>
      
      <HStack spacing={2}>
        {onConfigChange && (
          <Select size="sm" value={chartType} onChange={handleTypeChange} w="100px">
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="pie">Pie</option>
          </Select>
        )}
        
        {onExport && (
          <HStack spacing={1}>
            <Select 
              size="sm" 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value as 'png' | 'svg' | 'csv')}
              w="80px"
            >
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
              <option value="csv">CSV</option>
            </Select>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <IconButton
                  aria-label="Export chart"
                  size="sm"
                  onClick={handleExport}
                >
                  <FiDownload />
                </IconButton>
              </Tooltip.Trigger>
              <Tooltip.Content>Export chart</Tooltip.Content>
            </Tooltip.Root>
          </HStack>
        )}
        
        {onRefresh && (
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Refresh data"
                size="sm"
                onClick={onRefresh}
                isLoading={isLoading}
              >
                <FiRefreshCw />
              </IconButton>
            </Tooltip.Trigger>
            <Tooltip.Content>Refresh data</Tooltip.Content>
          </Tooltip.Root>
        )}
      </HStack>
    </HStack>
  )
})

// Memoized chart statistics
const ChartStats = memo(({ data, dataKey }: { data: ChartDataPoint[], dataKey: string }) => {
  const stats = useMemo(() => {
    if (!data.length) return null
    
    const values = data.map(d => Number(d[dataKey]) || 0)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    return { sum, avg, min, max, count: values.length }
  }, [data, dataKey])

  if (!stats) return null

  return (
    <HStack spacing={6} p={3} bg="gray.50" borderRadius="md" fontSize="sm">
      <VStack spacing={0} align="start">
        <Text color="gray.600">Total</Text>
        <Text fontWeight="semibold">{stats.sum.toLocaleString()}</Text>
      </VStack>
      <VStack spacing={0} align="start">
        <Text color="gray.600">Average</Text>
        <Text fontWeight="semibold">{stats.avg.toFixed(1)}</Text>
      </VStack>
      <VStack spacing={0} align="start">
        <Text color="gray.600">Min</Text>
        <Text fontWeight="semibold">{stats.min.toLocaleString()}</Text>
      </VStack>
      <VStack spacing={0} align="start">
        <Text color="gray.600">Max</Text>
        <Text fontWeight="semibold">{stats.max.toLocaleString()}</Text>
      </VStack>
      <VStack spacing={0} align="start">
        <Text color="gray.600">Count</Text>
        <Text fontWeight="semibold">{stats.count}</Text>
      </VStack>
    </HStack>
  )
})

// Main optimized chart widget component
export const OptimizedChartWidget = memo(({
  data,
  config,
  loading = false,
  error,
  height = 300,
  onRefresh,
  onExport,
  onConfigChange,
}: OptimizedChartWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  // Use static colors instead of useColorModeValue for Chakra UI v3 compatibility
  const bgColor = 'white'
  const borderColor = 'gray.200'

  // Intersection observer for lazy rendering
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Memoized chart component selection
  const ChartComponent = useMemo(() => {
    if (!isVisible || loading || error || !data.length) return null
    
    switch (config.type) {
      case 'line':
        return <MemoizedLineChart data={data} config={config} height={height} />
      case 'bar':
        return <MemoizedBarChart data={data} config={config} height={height} />
      case 'pie':
        return <MemoizedPieChart data={data} config={config} height={height} />
      default:
        return <MemoizedLineChart data={data} config={config} height={height} />
    }
  }, [data, config, height, isVisible, loading, error])

  // Memoized empty state
  const EmptyState = useMemo(() => (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      height={height}
      bg="gray.50"
      borderRadius="md"
    >
      <VStack spacing={2}>
        <Text color="gray.500">No data available</Text>
        {onRefresh && (
          <Button size="sm" onClick={onRefresh} variant="outline">
            Refresh Data
          </Button>
        )}
      </VStack>
    </Box>
  ), [height, onRefresh])

  return (
    <Box
      ref={containerRef}
      p={4}
      bg={bgColor}
      border="1px"
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
    >
      <ChartHeader
        title={config.title}
        onRefresh={onRefresh}
        onExport={onExport}
        onConfigChange={onConfigChange}
        chartType={config.type}
        isLoading={loading}
      />

      {error && (
        <Alert.Root status="error" mb={4}>
          <Alert.Icon as={FiAlertTriangle} />
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}

      {loading ? (
        <Box 
          display="flex" 
          alignItems="center" 
          justifyContent="center" 
          height={height}
        >
          <VStack spacing={3}>
            <Spinner size="lg" />
            <Text color="gray.500">Loading chart data...</Text>
          </VStack>
        </Box>
      ) : data.length === 0 ? (
        EmptyState
      ) : (
        <VStack spacing={4} align="stretch">
          {ChartComponent}
          <ChartStats data={data} dataKey={config.dataKey} />
        </VStack>
      )}
    </Box>
  )
})

OptimizedChartWidget.displayName = 'OptimizedChartWidget'