import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  Switch,
  FormControl,
  FormLabel,
  useToast,
} from '@chakra-ui/react';
import { FiRefreshCw, FiSettings } from 'react-icons/fi';
import {
  DashboardGrid,
  useDashboardLayout,
  useWidgetData,
  WidgetConfig,
  WidgetData,
  DashboardLayout,
} from '../components/widgets';

// Sample dashboard configuration
const SAMPLE_LAYOUT: DashboardLayout = {
  id: 'main-dashboard',
  name: 'Analytics Dashboard',
  columns: 3,
  gap: 6,
  widgets: [
    {
      id: 'total-users',
      title: 'Total Users',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 0, y: 0 },
      metricConfig: {
        value: 12543,
        label: 'Total Users',
        trend: {
          value: 12,
          direction: 'up',
          period: 'vs last month',
        },
        format: 'number',
      },
    },
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 1, y: 0 },
      metricConfig: {
        value: 45678,
        label: 'Revenue',
        trend: {
          value: 8,
          direction: 'up',
          period: 'vs last month',
        },
        format: 'currency',
      },
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 2, y: 0 },
      metricConfig: {
        value: 3.2,
        label: 'Conversion Rate',
        trend: {
          value: 5,
          direction: 'down',
          period: 'vs last month',
        },
        format: 'percentage',
      },
    },
    {
      id: 'sales-chart',
      title: 'Sales Trend',
      type: 'chart',
      size: { width: 600, height: 300 },
      position: { x: 0, y: 1 },
      chartConfig: {
        chartType: 'line',
        xAxis: 'name',
        yAxis: 'value',
        dataKey: 'value',
        showLegend: true,
        showGrid: true,
        showTooltip: true,
        colors: ['#3182CE'],
      },
    },
    {
      id: 'traffic-sources',
      title: 'Traffic Sources',
      type: 'chart',
      size: { width: 300, height: 300 },
      position: { x: 2, y: 1 },
      chartConfig: {
        chartType: 'pie',
        dataKey: 'value',
        showLegend: true,
        showTooltip: true,
        colors: ['#3182CE', '#38A169', '#D69E2E', '#E53E3E'],
      },
    },
  ],
};

export const Dashboard: React.FC = () => {
  const toast = useToast();
  const [isEditable, setIsEditable] = useState(false);
  const [widgetData, setWidgetData] = useState<Record<string, WidgetData>>({});

  const {
    layout,
    updateLayout,
  } = useDashboardLayout({
    initialLayout: SAMPLE_LAYOUT,
    persistKey: 'main-dashboard',
  });

  // Simulate real-time data updates
  const refreshAllWidgets = useCallback(() => {
    const newData: Record<string, WidgetData> = {};
    
    layout.widgets.forEach((widget) => {
      newData[widget.id] = {
        id: widget.id,
        data: generateMockData(widget),
        loading: false,
        lastUpdated: new Date(),
      };
    });

    setWidgetData(newData);
    
    toast({
      title: 'Dashboard Refreshed',
      description: 'All widgets have been updated with fresh data.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [layout.widgets, toast]);

  const refreshWidget = useCallback((widgetId: string) => {
    const widget = layout.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setWidgetData(prev => ({
      ...prev,
      [widgetId]: {
        id: widgetId,
        data: generateMockData(widget),
        loading: false,
        lastUpdated: new Date(),
      },
    }));

    toast({
      title: 'Widget Refreshed',
      description: `${widget.title} has been updated.`,
      status: 'info',
      duration: 1500,
      isClosable: true,
    });
  }, [layout.widgets, toast]);

  // Initialize widget data on mount
  React.useEffect(() => {
    refreshAllWidgets();
  }, []);

  return (
    <Container maxW="full" p={0}>
      <Box bg="gray.50" minH="100vh">
        <Box bg="white" borderBottom="1px" borderColor="gray.200" p={6}>
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="gray.800">
              Dashboard
            </Heading>
            
            <HStack spacing={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="edit-mode" mb="0" fontSize="sm">
                  Edit Mode
                </FormLabel>
                <Switch
                  id="edit-mode"
                  isChecked={isEditable}
                  onChange={(e) => setIsEditable(e.target.checked)}
                />
              </FormControl>
              
              <Button
                leftIcon={<FiRefreshCw />}
                variant="outline"
                size="sm"
                onClick={refreshAllWidgets}
              >
                Refresh All
              </Button>
              
              <Button
                leftIcon={<FiSettings />}
                colorScheme="blue"
                size="sm"
                isDisabled={!isEditable}
              >
                Configure
              </Button>
            </HStack>
          </HStack>
        </Box>

        <DashboardGrid
          layout={layout}
          widgetData={widgetData}
          onLayoutChange={updateLayout}
          onWidgetRefresh={refreshWidget}
          isEditable={isEditable}
        />
      </Box>
    </Container>
  );
};

// Mock data generator (same as in useWidgetData hook)
const generateMockData = (config: WidgetConfig) => {
  switch (config.type) {
    case 'metric':
      return {
        value: Math.floor(Math.random() * 10000),
        label: config.title,
        trend: {
          value: Math.floor(Math.random() * 20) - 10,
          direction: Math.random() > 0.5 ? 'up' : 'down',
          period: 'vs last month',
        },
        format: config.metricConfig?.format || 'number',
      };

    case 'chart':
      const chartType = config.chartConfig?.chartType || 'line';
      
      if (chartType === 'pie') {
        return [
          { name: 'Desktop', value: Math.floor(Math.random() * 500) + 100 },
          { name: 'Mobile', value: Math.floor(Math.random() * 400) + 100 },
          { name: 'Tablet', value: Math.floor(Math.random() * 300) + 100 },
          { name: 'Other', value: Math.floor(Math.random() * 200) + 50 },
        ];
      }

      return Array.from({ length: 7 }, (_, i) => ({
        name: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 100,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      }));

    default:
      return null;
  }
};