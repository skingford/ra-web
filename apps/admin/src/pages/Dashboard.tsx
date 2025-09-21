import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  Field,
  Grid,
  Card,
  Text,
  Icon,
  VStack,
  Badge,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react';
import { Switch } from '@chakra-ui/react';
import { useToaster } from '../lib/hooks/useToaster';
import { 
  FiRefreshCw, 
  FiSettings, 
  FiUsers, 
  FiBarChart, 
  FiFileText, 
  FiTrendingUp,
  FiActivity,
  FiDollarSign,
  FiShoppingCart,
  FiArrowRight
} from 'react-icons/fi';
import {
  DashboardGrid,
  useDashboardLayout,
  WidgetConfig,
  WidgetData,
  DashboardLayout,
} from '../components/widgets';
import { AdminLayout } from '../components/layout';

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
        label: 'Active Users',
        subtitle: 'Registered this month',
        trend: {
          value: 12,
          direction: 'up',
          period: 'vs last month',
        },
        format: 'number',
        target: 15000,
        showProgress: true,
        status: 'success',
        comparison: {
          value: 11200,
          label: 'Last Month',
          period: 'Previous Period',
        },
        showComparison: true,
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
        subtitle: 'Total earnings',
        trend: {
          value: 8,
          direction: 'up',
          period: 'vs last month',
        },
        format: 'currency',
        target: 50000,
        showProgress: true,
        status: 'info',
        comparison: {
          value: 42300,
          label: 'Last Month',
          period: 'Previous Period',
        },
        showComparison: true,
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
        subtitle: 'Visitor to customer',
        trend: {
          value: 5,
          direction: 'down',
          period: 'vs last month',
        },
        format: 'percentage',
        target: 5.0,
        showProgress: true,
        status: 'warning',
        comparison: {
          value: 3.4,
          label: 'Last Month',
          period: 'Previous Period',
        },
        showComparison: true,
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

// Quick action cards for navigation
const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  badge?: string;
}> = ({ title, description, icon, color, onClick, badge }) => (
  <Card.Root 
    cursor="pointer" 
    onClick={onClick}
    _hover={{ 
      transform: 'translateY(-2px)', 
      shadow: 'lg',
      borderColor: `${color}.200`
    }}
    transition="all 0.2s"
    borderWidth="1px"
    borderColor="gray.200"
  >
    <Card.Body p={6}>
      <Flex align="center" justify="space-between" mb={3}>
        <Box
          p={3}
          borderRadius="lg"
          bg={`${color}.50`}
          color={`${color}.600`}
        >
          <Icon as={icon} boxSize={6} />
        </Box>
        {badge && (
          <Badge colorScheme={color} variant="subtle">
            {badge}
          </Badge>
        )}
      </Flex>
      <VStack align="start" gap={1}>
        <Text fontWeight="semibold" fontSize="lg">
          {title}
        </Text>
        <Text color="gray.600" fontSize="sm">
          {description}
        </Text>
      </VStack>
      <Flex align="center" mt={4} color={`${color}.600`}>
        <Text fontSize="sm" fontWeight="medium">
          View Details
        </Text>
        <Icon as={FiArrowRight} ml={2} boxSize={4} />
      </Flex>
    </Card.Body>
  </Card.Root>
);

export const Dashboard: React.FC = () => {
  const toast = useToaster();
  const [isEditable, setIsEditable] = useState(false);
  const [widgetData, setWidgetData] = useState<Record<string, WidgetData>>({});

  const {
    layout,
    updateLayout,
  } = useDashboardLayout({
    initialLayout: SAMPLE_LAYOUT,
    persistKey: 'main-dashboard',
  });

  // Navigation handlers for quick actions
  const handleNavigateToUsers = useCallback(() => {
    toast({
      title: 'Navigating to User Management',
      description: 'Opening user management interface...',
      status: 'info',
      duration: 2000,
    });
    // In real app: navigate('/users')
    console.log('Navigate to: /users');
  }, [toast]);

  const handleNavigateToAnalytics = useCallback(() => {
    toast({
      title: 'Navigating to Analytics',
      description: 'Opening analytics dashboard...',
      status: 'info',
      duration: 2000,
    });
    // In real app: navigate('/analytics')
    console.log('Navigate to: /analytics');
  }, [toast]);

  const handleNavigateToReports = useCallback(() => {
    toast({
      title: 'Navigating to Reports',
      description: 'Opening report builder...',
      status: 'info',
      duration: 2000,
    });
    // In real app: navigate('/reports')
    console.log('Navigate to: /reports');
  }, [toast]);

  const handleNavigateToSettings = useCallback(() => {
    toast({
      title: 'Navigating to Settings',
      description: 'Opening system settings...',
      status: 'info',
      duration: 2000,
    });
    // In real app: navigate('/settings')
    console.log('Navigate to: /settings');
  }, [toast]);

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

  const handleChartDrillDown = useCallback((data: any, point: any) => {
    toast({
      title: 'Chart Drill-Down',
      description: `Exploring data point: ${point.name || 'Unknown'}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
    
    // Here you could navigate to a detailed view or open a modal
    console.log('Chart drill-down data:', { data, point });
  }, [toast]);

  const handleMetricDrillDown = useCallback((metric: any) => {
    toast({
      title: 'Metric Details',
      description: `Viewing details for: ${metric.label}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
    
    // Here you could navigate to a detailed view or open a modal
    console.log('Metric drill-down data:', metric);
  }, [toast]);

  // Initialize widget data on mount
  React.useEffect(() => {
    refreshAllWidgets();
  }, []);

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  const headerActions = (
    <HStack gap={4}>
      <Field.Root display="flex" alignItems="center">
        <Field.Label htmlFor="edit-mode" mb="0" fontSize="sm">
          Edit Mode
        </Field.Label>
        <Switch.Root
          id="edit-mode"
          checked={isEditable}
          onCheckedChange={(details) => setIsEditable(details.checked)}
        >
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </Field.Root>
      
      <Button
        variant="outline"
        size="sm"
        onClick={refreshAllWidgets}
      >
        <FiRefreshCw />
        Refresh All
      </Button>
      
      <Button
        colorScheme="blue"
        size="sm"
        disabled={!isEditable}
      >
        <FiSettings />
        Configure
      </Button>
    </HStack>
  );

  return (
    <AdminLayout 
      title="Dashboard Overview" 
      breadcrumbs={breadcrumbs}
      actions={headerActions}
    >
      <VStack gap={8} align="stretch">
        {/* Quick Actions Section */}
        <Box>
          <Heading size="md" mb={4} color="gray.800">
            Quick Actions
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <QuickActionCard
              title="User Management"
              description="Manage users, roles, and permissions"
              icon={FiUsers}
              color="blue"
              onClick={handleNavigateToUsers}
              badge="24 Active"
            />
            <QuickActionCard
              title="Analytics"
              description="View detailed analytics and insights"
              icon={FiBarChart}
              color="green"
              onClick={handleNavigateToAnalytics}
              badge="Live Data"
            />
            <QuickActionCard
              title="Reports"
              description="Generate and export custom reports"
              icon={FiFileText}
              color="purple"
              onClick={handleNavigateToReports}
              badge="5 Pending"
            />
            <QuickActionCard
              title="System Settings"
              description="Configure system preferences"
              icon={FiSettings}
              color="orange"
              onClick={handleNavigateToSettings}
            />
          </SimpleGrid>
        </Box>

        {/* Main Dashboard Widgets */}
        <Box>
          <Heading size="md" mb={4} color="gray.800">
            Key Metrics & Analytics
          </Heading>
          <DashboardGrid
            layout={layout}
            widgetData={widgetData}
            onLayoutChange={updateLayout}
            onWidgetRefresh={refreshWidget}
            onChartDrillDown={handleChartDrillDown}
            onMetricDrillDown={handleMetricDrillDown}
            isEditable={isEditable}
          />
        </Box>
      </VStack>
    </AdminLayout>
  );
};

// Mock data generator (same as in useWidgetData hook)
const generateMockData = (config: WidgetConfig) => {
  switch (config.type) {
    case 'metric':
      const baseValue = Math.floor(Math.random() * 10000) + 1000;
      const target = config.metricConfig?.target || baseValue * 1.2;
      return {
        ...config.metricConfig,
        value: baseValue,
        trend: {
          value: Math.floor(Math.random() * 20) - 10,
          direction: Math.random() > 0.5 ? 'up' : 'down',
          period: 'vs last month',
        },
        progress: Math.min((baseValue / target) * 100, 100),
        comparison: {
          value: baseValue - Math.floor(Math.random() * 2000) + 500,
          label: 'Last Month',
          period: 'Previous Period',
        },
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