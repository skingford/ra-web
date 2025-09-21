import React from 'react';
import { Box, VStack, Text, Button, HStack } from '@chakra-ui/react';
import { FiBarChart, FiTrendingUp } from 'react-icons/fi';
import { useToaster } from '../lib/hooks/useToaster';
import { InteractiveCharts } from '../components/widgets';
import { AdminLayout } from '../components/layout';

export const InteractiveChartsDemo: React.FC = () => {
  const toast = useToaster();

  const handleDrillDown = (data: any, context: string) => {
    toast({
      title: 'Drill-down Triggered',
      description: `Context: ${context} - Data: ${JSON.stringify(data, null, 2).substring(0, 100)}...`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Interactive Charts', href: '/charts' },
  ];

  const headerActions = (
    <HStack gap={4}>
      <Button colorScheme="blue" variant="outline">
        <FiTrendingUp />
        View Analytics
      </Button>
      <Button colorScheme="green" variant="outline">
        Export Data
      </Button>
    </HStack>
  );

  return (
    <AdminLayout 
      title="Interactive Charts & Metrics Demo" 
      breadcrumbs={breadcrumbs}
      actions={headerActions}
    >
      <VStack gap={6} align="stretch">
        {/* Description */}
        <Box>
          <Text color="gray.600" mb={4}>
            This demo showcases the interactive chart and metric widgets with drill-down functionality,
            responsive design, and real-time data updates.
          </Text>
        </Box>

        {/* Interactive Charts Component */}
        <InteractiveCharts 
          onDrillDown={handleDrillDown}
          refreshInterval={30000}
        />

        {/* Features List */}
        <Box mt={8} p={6} bg="gray.50" borderRadius="lg">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            ✅ Implemented Features
          </Text>
          <VStack align="stretch" gap={2}>
            <Text>• Interactive Recharts integration with Chakra UI</Text>
            <Text>• KPI metric cards with trend indicators and progress bars</Text>
            <Text>• Drill-down functionality with detailed modal views</Text>
            <Text>• Responsive design across mobile, tablet, and desktop</Text>
            <Text>• Real-time data refresh capabilities</Text>
            <Text>• Multiple chart types: Line, Bar, Area, Pie, Scatter</Text>
            <Text>• Enhanced metric widgets with status indicators</Text>
            <Text>• Hover effects and interactive animations</Text>
            <Text>• Comprehensive test coverage for chart interactions</Text>
            <Text>• Responsive chart utilities and breakpoint detection</Text>
          </VStack>
        </Box>
      </VStack>
    </AdminLayout>
  );
};