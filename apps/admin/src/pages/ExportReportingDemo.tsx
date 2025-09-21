import { useState, useMemo, useCallback } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Tabs,
  Badge,
  Alert,
  Spinner,
} from '@chakra-ui/react'
import { FiDownload, FiFileText, FiBarChart } from 'react-icons/fi'
import { DataTable, ColumnDef } from '../components/data/DataTable'
import { ReportBuilder, ReportField } from '../components/data/ReportBuilder'
import { DateRangeFilter, DateRange } from '../components/data/DateRangeFilter'
import { useExport } from '../lib/hooks/useExport'
import { ReportConfig } from '../lib/export'
import { format, subDays, addDays } from 'date-fns'

// Sample data types
interface SalesRecord {
  id: string
  date: Date
  customerName: string
  product: string
  category: string
  quantity: number
  unitPrice: number
  totalAmount: number
  region: string
  salesRep: string
  status: 'completed' | 'pending' | 'cancelled'
}

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  department: string
  joinDate: Date
  lastLogin: Date
  isActive: boolean
  projectsCount: number
}

// Generate sample data
const generateSalesData = (count: number): SalesRecord[] => {
  const products = ['Laptop', 'Desktop', 'Monitor', 'Keyboard', 'Mouse', 'Headphones']
  const categories = ['Electronics', 'Accessories', 'Peripherals']
  const regions = ['North', 'South', 'East', 'West', 'Central']
  const salesReps = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson']
  const statuses: SalesRecord['status'][] = ['completed', 'pending', 'cancelled']

  return Array.from({ length: count }, (_, i) => {
    const date = subDays(new Date(), Math.floor(Math.random() * 90))
    const quantity = Math.floor(Math.random() * 10) + 1
    const unitPrice = Math.floor(Math.random() * 1000) + 100
    
    return {
      id: `sale-${i + 1}`,
      date,
      customerName: `Customer ${i + 1}`,
      product: products[Math.floor(Math.random() * products.length)]!,
      category: categories[Math.floor(Math.random() * categories.length)]!,
      quantity,
      unitPrice,
      totalAmount: quantity * unitPrice,
      region: regions[Math.floor(Math.random() * regions.length)]!,
      salesRep: salesReps[Math.floor(Math.random() * salesReps.length)]!,
      status: statuses[Math.floor(Math.random() * statuses.length)]!,
    }
  })
}

const generateUserData = (count: number): UserRecord[] => {
  const roles = ['Admin', 'Manager', 'Developer', 'Designer', 'Analyst']
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']

  return Array.from({ length: count }, (_, i) => {
    const joinDate = subDays(new Date(), Math.floor(Math.random() * 365))
    const lastLogin = addDays(joinDate, Math.floor(Math.random() * 30))
    
    return {
      id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@company.com`,
      role: roles[Math.floor(Math.random() * roles.length)]!,
      department: departments[Math.floor(Math.random() * departments.length)]!,
      joinDate,
      lastLogin,
      isActive: Math.random() > 0.1,
      projectsCount: Math.floor(Math.random() * 20),
    }
  })
}

export function ExportReportingDemo() {
  const [activeTab, setActiveTab] = useState('sales')
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [reportLoading, setReportLoading] = useState(false)

  // Sample data
  const salesData = useMemo(() => generateSalesData(150), [])
  const userData = useMemo(() => generateUserData(100), [])

  // Filter data based on date range
  const filteredSalesData = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return salesData
    
    return salesData.filter(record => 
      record.date >= dateRange.startDate! && record.date <= dateRange.endDate!
    )
  }, [salesData, dateRange])

  // Column definitions for sales data
  const salesColumns: ColumnDef<SalesRecord>[] = [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      width: 100,
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'date',
      cell: ({ getValue }) => format(getValue() as Date, 'MMM dd, yyyy'),
      sortable: true,
      filterable: true,
    },
    {
      id: 'customerName',
      header: 'Customer',
      accessorKey: 'customerName',
      sortable: true,
      filterable: true,
    },
    {
      id: 'product',
      header: 'Product',
      accessorKey: 'product',
      sortable: true,
      filterable: true,
    },
    {
      id: 'category',
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      filterable: true,
    },
    {
      id: 'quantity',
      header: 'Quantity',
      accessorKey: 'quantity',
      sortable: true,
      align: 'right',
    },
    {
      id: 'unitPrice',
      header: 'Unit Price',
      accessorKey: 'unitPrice',
      cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
      sortable: true,
      align: 'right',
    },
    {
      id: 'totalAmount',
      header: 'Total',
      accessorKey: 'totalAmount',
      cell: ({ getValue }) => `$${(getValue() as number).toLocaleString()}`,
      sortable: true,
      align: 'right',
    },
    {
      id: 'region',
      header: 'Region',
      accessorKey: 'region',
      sortable: true,
      filterable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = getValue() as string
        const colorScheme = status === 'completed' ? 'green' : status === 'pending' ? 'yellow' : 'red'
        return <Badge colorScheme={colorScheme}>{status}</Badge>
      },
      sortable: true,
      filterable: true,
    },
  ]

  // Column definitions for user data
  const userColumns: ColumnDef<UserRecord>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
      filterable: true,
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'role',
      sortable: true,
      filterable: true,
    },
    {
      id: 'department',
      header: 'Department',
      accessorKey: 'department',
      sortable: true,
      filterable: true,
    },
    {
      id: 'joinDate',
      header: 'Join Date',
      accessorKey: 'joinDate',
      cell: ({ getValue }) => format(getValue() as Date, 'MMM dd, yyyy'),
      sortable: true,
    },
    {
      id: 'isActive',
      header: 'Active',
      accessorKey: 'isActive',
      cell: ({ getValue }) => (
        <Badge colorScheme={getValue() ? 'green' : 'gray'}>
          {getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
      sortable: true,
      filterable: true,
    },
    {
      id: 'projectsCount',
      header: 'Projects',
      accessorKey: 'projectsCount',
      sortable: true,
      align: 'right',
    },
  ]

  // Report field definitions
  const salesReportFields: ReportField[] = [
    { key: 'id', label: 'ID', type: 'string' },
    { key: 'date', label: 'Date', type: 'date', filterable: true, sortable: true },
    { key: 'customerName', label: 'Customer', type: 'string', filterable: true, sortable: true },
    { key: 'product', label: 'Product', type: 'string', filterable: true, sortable: true, groupable: true },
    { key: 'category', label: 'Category', type: 'string', filterable: true, sortable: true, groupable: true },
    { key: 'quantity', label: 'Quantity', type: 'number', sortable: true },
    { key: 'unitPrice', label: 'Unit Price', type: 'number', sortable: true },
    { key: 'totalAmount', label: 'Total Amount', type: 'number', sortable: true },
    { key: 'region', label: 'Region', type: 'string', filterable: true, sortable: true, groupable: true },
    { key: 'salesRep', label: 'Sales Rep', type: 'string', filterable: true, sortable: true, groupable: true },
    { key: 'status', label: 'Status', type: 'string', filterable: true, sortable: true, groupable: true },
  ]

  const userReportFields: ReportField[] = [
    { key: 'name', label: 'Name', type: 'string', filterable: true, sortable: true },
    { key: 'email', label: 'Email', type: 'string', filterable: true, sortable: true },
    { key: 'role', label: 'Role', type: 'string', filterable: true, sortable: true, groupable: true },
    { key: 'department', label: 'Department', type: 'string', filterable: true, sortable: true, groupable: true },
    { key: 'joinDate', label: 'Join Date', type: 'date', filterable: true, sortable: true },
    { key: 'lastLogin', label: 'Last Login', type: 'date', sortable: true },
    { key: 'isActive', label: 'Active', type: 'boolean', filterable: true, sortable: true },
    { key: 'projectsCount', label: 'Projects Count', type: 'number', sortable: true },
  ]

  // Export hooks
  const salesExport = useExport(filteredSalesData, salesColumns, {
    filename: 'sales-report',
  })

  const userExport = useExport(userData, userColumns, {
    filename: 'user-report',
  })

  // Report generation
  const handleGenerateReport = useCallback(async (config: ReportConfig) => {
    setReportLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Apply filters and return filtered data
      let data: any[] = activeTab === 'sales' ? [...salesData] : [...userData]
      
      // Apply date range filter
      if (config.dateRange?.startDate && config.dateRange?.endDate && config.dateRange?.field) {
        data = data.filter((record: any) => {
          const recordDate = record[config.dateRange!.field]
          return recordDate >= config.dateRange!.startDate! && recordDate <= config.dateRange!.endDate!
        })
      }
      
      // Apply other filters
      if (config.filters) {
        Object.entries(config.filters).forEach(([key, value]) => {
          if (value) {
            data = data.filter((record: any) => {
              const recordValue = record[key]
              if (typeof recordValue === 'string') {
                return recordValue.toLowerCase().includes(value.toLowerCase())
              }
              if (typeof recordValue === 'boolean') {
                return String(recordValue) === value
              }
              return String(recordValue) === value
            })
          }
        })
      }
      
      // Apply sorting
      if (config.sortBy) {
        data.sort((a: any, b: any) => {
          const aValue = a[config.sortBy!]
          const bValue = b[config.sortBy!]
          
          if (aValue < bValue) return config.sortOrder === 'asc' ? -1 : 1
          if (aValue > bValue) return config.sortOrder === 'asc' ? 1 : -1
          return 0
        })
      }
      
      return data
    } catch (error) {
      console.error('Report generation failed:', error)
      throw error
    } finally {
      setReportLoading(false)
    }
  }, [activeTab, salesData, userData])

  // Quick export functions
  const handleQuickExport = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    const exportHook = activeTab === 'sales' ? salesExport : userExport
    exportHook.exportData(format)
  }, [activeTab, salesExport, userExport])

  const currentData = activeTab === 'sales' ? filteredSalesData : userData
  const currentFields = activeTab === 'sales' ? salesReportFields : userReportFields
  const currentExport = activeTab === 'sales' ? salesExport : userExport

  return (
    <VStack gap={6} align="stretch" p={6}>
      {/* Header */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          Export & Reporting Demo
        </Text>
        <Text color="gray.600">
          Comprehensive data export and report generation with filtering, date ranges, and multiple formats
        </Text>
      </Box>

      {/* Quick Actions */}
      <Card.Root>
        <Card.Body>
          <HStack justify="space-between" wrap="wrap" gap={4}>
            <HStack gap={4}>
              <Text fontWeight="medium">Quick Export:</Text>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickExport('csv')}
                disabled={currentExport.isExporting}
              >
                <FiDownload />
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickExport('excel')}
                disabled={currentExport.isExporting}
              >
                <FiDownload />
                Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleQuickExport('pdf')}
                disabled={currentExport.isExporting}
              >
                <FiDownload />
                PDF
              </Button>
            </HStack>

            <HStack gap={4}>
              <Text fontSize="sm" color="gray.600">
                Records: {currentData.length.toLocaleString()}
              </Text>
              {currentExport.isExporting && (
                <HStack gap={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm">Exporting {currentExport.exportFormat}...</Text>
                </HStack>
              )}
            </HStack>
          </HStack>

          {currentExport.error && (
            <Alert.Root status="error" mt={4}>
              <Alert.Title>Export Error</Alert.Title>
              <Alert.Description>{currentExport.error}</Alert.Description>
            </Alert.Root>
          )}
        </Card.Body>
      </Card.Root>

      {/* Date Range Filter */}
      {activeTab === 'sales' && (
        <Card.Root>
          <Card.Body>
            <HStack gap={4} align="center">
              <Text fontWeight="medium">Date Range Filter:</Text>
              <DateRangeFilter
                value={dateRange}
                onChange={setDateRange}
                placeholder="Filter by date range"
              />
              {(dateRange.startDate || dateRange.endDate) && (
                <Badge colorScheme="blue">
                  {filteredSalesData.length} of {salesData.length} records
                </Badge>
              )}
            </HStack>
          </Card.Body>
        </Card.Root>
      )}

      {/* Main Content */}
      <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
        <Tabs.List>
          <Tabs.Trigger value="sales">
            <FiBarChart />
            Sales Data
          </Tabs.Trigger>
          <Tabs.Trigger value="users">
            <FiFileText />
            User Data
          </Tabs.Trigger>
          <Tabs.Trigger value="reports">
            <FiFileText />
            Report Builder
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="sales">
          <DataTable
            data={filteredSalesData}
            columns={salesColumns}
            exportable
            onExport={salesExport.exportData}
            pagination={{
              page: 1,
              pageSize: 25,
              total: filteredSalesData.length,
              onPageChange: () => {},
              onPageSizeChange: () => {},
            }}
            stickyHeader
            striped
          />
        </Tabs.Content>

        <Tabs.Content value="users">
          <DataTable
            data={userData}
            columns={userColumns}
            exportable
            onExport={userExport.exportData}
            pagination={{
              page: 1,
              pageSize: 25,
              total: userData.length,
              onPageChange: () => {},
              onPageSizeChange: () => {},
            }}
            stickyHeader
            striped
          />
        </Tabs.Content>

        <Tabs.Content value="reports">
          <ReportBuilder
            fields={currentFields}
            data={currentData}
            loading={reportLoading}
            onGenerateReport={handleGenerateReport}
            defaultConfig={{
              title: `${activeTab === 'sales' ? 'Sales' : 'User'} Report`,
              description: `Comprehensive ${activeTab === 'sales' ? 'sales' : 'user'} data analysis`,
            }}
          />
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  )
}