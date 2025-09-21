import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Badge,
  Separator,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiRefreshCw, 
  FiMaximize2, 
  FiTrendingUp, 
  FiTrendingDown,
  FiBarChart,
  FiPieChart,
  FiActivity
} from 'react-icons/fi';
import { ChartWidget } from './ChartWidget';
import { MetricWidget } from './MetricWidget';
import { WidgetConfig, WidgetData } from './types';

interface InteractiveChartsProps {
  onDrillDown?: (data: any, context: string) => void;
  refreshInterval?: number;
}

// Sample data for demonstration
const generateSampleData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    name: month,
    revenue: Math.floor(Math.random() * 50000) + 20000,
    users: Math.floor(Math.random() * 1000) + 500,
    conversion: Math.floor(Math.random() * 20) + 10,
    orders: Math.floor(Math.random() * 200) + 100,
  }));
};

const pieData = [
  { name: 'Desktop', value: 45, color: '#3182CE' },
  { name: 'Mobile', value: 35, color: '#38A169' },
  { name: 'Tablet', value: 20, color: '#D69E2E' },
];

export const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  onDrillDown,
  refreshInterval = 30000,
}) => {
  const [chartData, setChartData] = useState(generateSampleData());
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Modal functionality temporarily disabled for Chakra UI v3 compatibility

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setChartData(generateSampleData());
    setIsRefreshing(false);
  }, []);

  const handleMetricDrillDown = useCallback((metric: any) => {
    setSelectedMetric(metric);
    console.log('Metric clicked:', metric);
    if (onDrillDown) {
      onDrillDown(metric, 'metric-detail');
    }
  }, [onDrillDown]);

  const handleChartDrillDown = useCallback((data: any, point: any) => {
    if (onDrillDown) {
      onDrillDown({ data, point }, 'chart-detail');
    }
  }, [onDrillDown]);

  // KPI Metric Configurations
  const kpiConfigs: WidgetConfig[] = [
    {
      id: 'revenue-kpi',
      title: 'Total Revenue',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 0, y: 0 },
      metricConfig: {
        value: 284750,
        label: 'Total Revenue',
        subtitle: 'This Quarter',
        format: 'currency',
        trend: {
          value: 12.5,
          direction: 'up',
          period: 'vs last quarter',
        },
        target: 300000,
        showProgress: true,
        status: 'success',
        comparison: {
          value: 253200,
          label: 'Last Quarter',
          period: 'Q2 2024',
        },
        showComparison: true,
      },
    },
    {
      id: 'users-kpi',
      title: 'Active Users',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 1, y: 0 },
      metricConfig: {
        value: 8547,
        label: 'Active Users',
        subtitle: 'Monthly Active',
        format: 'number',
        trend: {
          value: 8.3,
          direction: 'up',
          period: 'vs last month',
        },
        target: 10000,
        showProgress: true,
        status: 'info',
      },
    },
    {
      id: 'conversion-kpi',
      title: 'Conversion Rate',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 2, y: 0 },
      metricConfig: {
        value: 14.2,
        label: 'Conversion Rate',
        subtitle: 'Average CVR',
        format: 'percentage',
        trend: {
          value: 2.1,
          direction: 'down',
          period: 'vs last month',
        },
        target: 15,
        showProgress: true,
        status: 'warning',
      },
    },
    {
      id: 'orders-kpi',
      title: 'Total Orders',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 3, y: 0 },
      metricConfig: {
        value: 1247,
        label: 'Total Orders',
        subtitle: 'This Month',
        format: 'number',
        trend: {
          value: 15.7,
          direction: 'up',
          period: 'vs last month',
        },
        status: 'success',
        comparison: {
          value: 1078,
          label: 'Last Month',
          period: 'Previous',
        },
        showComparison: true,
      },
    },
  ];

  // Chart Configurations
  const chartConfigs: WidgetConfig[] = [
    {
      id: 'revenue-chart',
      title: 'Revenue Trend',
      type: 'chart',
      size: { width: 600, height: 400 },
      position: { x: 0, y: 1 },
      chartConfig: {
        chartType: 'area',
        xAxis: 'name',
        dataKey: 'revenue',
        colors: ['#3182CE', '#38A169'],
        showLegend: true,
        showGrid: true,
        showTooltip: true,
      },
    },
    {
      id: 'users-chart',
      title: 'User Growth',
      type: 'chart',
      size: { width: 600, height: 400 },
      position: { x: 1, y: 1 },
      chartConfig: {
        chartType: 'line',
        xAxis: 'name',
        dataKey: 'users',
        colors: ['#38A169'],
        showLegend: true,
        showGrid: true,
        showTooltip: true,
      },
    },
    {
      id: 'device-chart',
      title: 'Device Distribution',
      type: 'chart',
      size: { width: 400, height: 400 },
      position: { x: 0, y: 2 },
      chartConfig: {
        chartType: 'pie',
        dataKey: 'value',
        colors: ['#3182CE', '#38A169', '#D69E2E'],
        showLegend: true,
        showTooltip: true,
      },
    },
    {
      id: 'conversion-chart',
      title: 'Conversion Funnel',
      type: 'chart',
      size: { width: 600, height: 400 },
      position: { x: 1, y: 2 },
      chartConfig: {
        chartType: 'bar',
        xAxis: 'name',
        dataKey: 'conversion',
        colors: ['#D69E2E'],
        showLegend: true,
        showGrid: true,
        showTooltip: true,
      },
    },
  ];

  const chartDataMap: Record<string, WidgetData> = {
    'revenue-chart': { id: 'revenue-chart', data: chartData, loading: false },
    'users-chart': { id: 'users-chart', data: chartData, loading: false },
    'device-chart': { id: 'device-chart', data: pieData, loading: false },
    'conversion-chart': { id: 'conversion-chart', data: chartData, loading: false },
  };

  return (
    <Box p={6} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">
              Interactive Dashboard
            </Text>
            <Text color="gray.500">
              Real-time metrics and interactive visualizations
            </Text>
          </VStack>
          
          <HStack spacing={3}>
            <Badge colorScheme="green" p={2}>
              Live Data
            </Badge>
            <Tooltip label="Refresh all widgets">
              <IconButton
                aria-label="Refresh data"
                icon={<FiRefreshCw />}
                onClick={handleRefresh}
                isLoading={isRefreshing}
                variant="outline"
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* KPI Metrics Grid */}
        <Box>
          <HStack mb={4} align="center">
            <FiActivity />
            <Text fontSize="lg" fontWeight="semibold">
              Key Performance Indicators
            </Text>
          </HStack>
          
          <Grid 
            templateColumns={{ 
              base: '1fr', 
              md: 'repeat(2, 1fr)', 
              lg: 'repeat(4, 1fr)' 
            }} 
            gap={4}
          >
            {kpiConfigs.map((config) => (
              <Box
                key={config.id}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ 
                  shadow: 'lg',
                  transform: 'translateY(-2px)',
                }}
              >
                <MetricWidget
                  config={config}
                  onDrillDown={handleMetricDrillDown}
                  onRefresh={handleRefresh}
                />
              </Box>
            ))}
          </Grid>
        </Box>

        <Separator />

        {/* Charts Grid */}
        <Box>
          <HStack mb={4} align="center">
            <FiBarChart />
            <Text fontSize="lg" fontWeight="semibold">
              Interactive Charts
            </Text>
          </HStack>
          
          <Grid 
            templateColumns={{ 
              base: '1fr', 
              lg: 'repeat(2, 1fr)' 
            }} 
            gap={6}
          >
            {chartConfigs.map((config) => (
              <Box
                key={config.id}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                overflow="hidden"
                transition="all 0.2s"
                _hover={{ 
                  shadow: 'lg',
                  transform: 'translateY(-2px)',
                }}
                h="400px"
              >
                <ChartWidget
                  config={config}
                  data={chartDataMap[config.id]}
                  onDrillDown={handleChartDrillDown}
                  onRefresh={handleRefresh}
                />
              </Box>
            ))}
          </Grid>
        </Box>
      </VStack>

      {/* Modal functionality temporarily disabled for Chakra UI v3 compatibility */}
    </Box>
  );
};