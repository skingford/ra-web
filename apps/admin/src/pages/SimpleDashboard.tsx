import React from 'react'
import { Box, Text, VStack, HStack, Button, Grid, GridItem } from '@chakra-ui/react'
import { FiUsers, FiBarChart, FiSettings, FiTrendingUp } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { usePerformanceTracking } from '../utils/performance'
import { AdminLayout } from '../components/layout'

export default function SimpleDashboard() {
  const { renderTime } = usePerformanceTracking('SimpleDashboard')

  const breadcrumbs = [
    { label: 'Home', href: '/' },
  ];

  return (
    <AdminLayout title="Welcome" breadcrumbs={breadcrumbs}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Modern Admin Dashboard
          </Text>
          <Text color="gray.600">
            Welcome to your performance-optimized admin dashboard
          </Text>
          {process.env.NODE_ENV === 'development' && (
            <Text fontSize="xs" color="gray.400" mt={1}>
              Render time: {renderTime.toFixed(2)}ms
            </Text>
          )}
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
          <GridItem>
            <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">Total Users</Text>
                <FiUsers color="blue" />
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">1,234</Text>
              <Text fontSize="sm" color="green.500">+12% from last month</Text>
            </Box>
          </GridItem>

          <GridItem>
            <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">Revenue</Text>
                <FiTrendingUp color="green" />
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">$45,678</Text>
              <Text fontSize="sm" color="green.500">+8% from last month</Text>
            </Box>
          </GridItem>

          <GridItem>
            <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">Orders</Text>
                <FiBarChart color="purple" />
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">892</Text>
              <Text fontSize="sm" color="red.500">-3% from last month</Text>
            </Box>
          </GridItem>

          <GridItem>
            <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
              <HStack justify="space-between" mb={4}>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">Conversion</Text>
                <FiSettings color="orange" />
              </HStack>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">3.2%</Text>
              <Text fontSize="sm" color="green.500">+0.5% from last month</Text>
            </Box>
          </GridItem>
        </Grid>

        {/* Navigation to Lazy-Loaded Components */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm" border="1px" borderColor="gray.200">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>Explore Features (Lazy Loaded)</Text>
          <HStack gap={4} wrap="wrap">
            <Button as={Link} to="/charts" colorScheme="blue" size="sm">
              Interactive Charts
            </Button>
            <Button as={Link} to="/data-table" variant="outline" size="sm">
              Data Table Demo
            </Button>
            <Button as={Link} to="/form-builder" variant="outline" size="sm">
              Form Builder Demo
            </Button>
            <Button as={Link} to="/export" variant="outline" size="sm">
              Export Features
            </Button>
          </HStack>
        </Box>

        {/* Performance Info */}
        <Box bg="blue.50" p={4} borderRadius="lg" border="1px" borderColor="blue.200">
          <Text fontSize="sm" fontWeight="semibold" color="blue.800" mb={2}>
            ⚡ Performance Optimizations Active
          </Text>
          <VStack align="start" gap={1}>
            <Text fontSize="xs" color="blue.700">✅ Route-based code splitting enabled</Text>
            <Text fontSize="xs" color="blue.700">✅ Component lazy loading implemented</Text>
            <Text fontSize="xs" color="blue.700">✅ Bundle optimization configured</Text>
            <Text fontSize="xs" color="blue.700">✅ Performance monitoring active</Text>
          </VStack>
        </Box>
      </VStack>
    </AdminLayout>
  )
}