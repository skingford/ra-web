import React, { useState, useMemo } from 'react'
import {
  Box,
  Table,
  Button,
  Input,
  HStack,
  VStack,
  Text,
  Checkbox,
  Select,
  Spinner,
  Badge,
} from '@chakra-ui/react'

export interface Column<T> {
  key: keyof T | string
  header: string
  accessor?: (item: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  sorting?: {
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  }
  filtering?: {
    filters: Record<string, string>
    onFilterChange: (filters: Record<string, string>) => void
  }
  selection?: {
    selectedItems: T[]
    onSelectionChange: (items: T[]) => void
    getItemId: (item: T) => string | number
  }
  actions?: {
    label: string
    onClick: (items: T[]) => void
    variant?: 'solid' | 'outline' | 'ghost'
    colorScheme?: string
    disabled?: boolean
  }[]
  emptyState?: React.ReactNode
  rowActions?: (item: T) => React.ReactNode
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  filtering,
  selection,
  actions = [],
  emptyState,
  rowActions,
}: DataTableProps<T>) {
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({})

  const filters = filtering?.filters || localFilters
  const setFilters = filtering?.onFilterChange || setLocalFilters

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (!sorting) return

    const newOrder = 
      sorting.sortBy === columnKey && sorting.sortOrder === 'asc' 
        ? 'desc' 
        : 'asc'
    
    sorting.onSort(columnKey, newOrder)
  }

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (!selection) return

    if (checked) {
      selection.onSelectionChange(data)
    } else {
      selection.onSelectionChange([])
    }
  }

  const handleSelectItem = (item: T, checked: boolean) => {
    if (!selection) return

    const itemId = selection.getItemId(item)
    const currentSelection = selection.selectedItems

    if (checked) {
      selection.onSelectionChange([...currentSelection, item])
    } else {
      selection.onSelectionChange(
        currentSelection.filter(selected => 
          selection.getItemId(selected) !== itemId
        )
      )
    }
  }

  const isItemSelected = (item: T): boolean => {
    if (!selection) return false
    
    const itemId = selection.getItemId(item)
    return selection.selectedItems.some(selected => 
      selection.getItemId(selected) === itemId
    )
  }

  const isAllSelected = useMemo(() => {
    if (!selection || data.length === 0) return false
    return data.every(item => isItemSelected(item))
  }, [selection, data])

  const isIndeterminate = useMemo(() => {
    if (!selection || data.length === 0) return false
    const selectedCount = data.filter(item => isItemSelected(item)).length
    return selectedCount > 0 && selectedCount < data.length
  }, [selection, data])

  // Handle filtering
  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters({
      ...filters,
      [columnKey]: value,
    })
  }

  // Render cell content
  const renderCell = (item: T, column: Column<T>) => {
    if (column.accessor) {
      return column.accessor(item)
    }

    const value = item[column.key as keyof T]
    
    if (value === null || value === undefined) {
      return <Text color="neutral.400">-</Text>
    }

    if (typeof value === 'boolean') {
      return (
        <Badge colorScheme={value ? 'success' : 'neutral'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    }

    if (value instanceof Date) {
      return <Text>{value.toLocaleDateString()}</Text>
    }

    return <Text>{String(value)}</Text>
  }

  // Pagination info
  const paginationInfo = pagination ? {
    start: (pagination.page - 1) * pagination.pageSize + 1,
    end: Math.min(pagination.page * pagination.pageSize, pagination.total),
    total: pagination.total,
  } : null

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <VStack gap={3}>
          <Spinner size="lg" color="brand.500" />
          <Text color="neutral.600">Loading data...</Text>
        </VStack>
      </Box>
    )
  }

  if (data.length === 0 && !loading) {
    return (
      <Box textAlign="center" py={10}>
        {emptyState || (
          <VStack gap={3}>
            <Text fontSize="lg" color="neutral.600">
              No data available
            </Text>
            <Text color="neutral.500">
              There are no items to display at the moment.
            </Text>
          </VStack>
        )}
      </Box>
    )
  }

  return (
    <VStack gap={4} align="stretch">
      {/* Actions and Filters */}
      {(actions.length > 0 || columns.some(col => col.filterable)) && (
        <HStack justify="space-between" wrap="wrap" gap={4}>
          {/* Bulk Actions */}
          {actions.length > 0 && selection && selection.selectedItems.length > 0 && (
            <HStack gap={2}>
              <Text fontSize="sm" color="neutral.600">
                {selection.selectedItems.length} selected
              </Text>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'outline'}
                  colorScheme={action.colorScheme}
                  disabled={action.disabled}
                  onClick={() => action.onClick(selection.selectedItems)}
                >
                  {action.label}
                </Button>
              ))}
            </HStack>
          )}

          {/* Filters */}
          {columns.some(col => col.filterable) && (
            <HStack gap={2}>
              {columns
                .filter(col => col.filterable)
                .map(column => (
                  <Input
                    key={String(column.key)}
                    placeholder={`Filter ${column.header}`}
                    size="sm"
                    value={filters[String(column.key)] || ''}
                    onChange={(e) => handleFilterChange(String(column.key), e.target.value)}
                    maxW="200px"
                  />
                ))}
            </HStack>
          )}
        </HStack>
      )}

      {/* Table */}
      <Box overflowX="auto" border="1px" borderColor="neutral.200" borderRadius="md">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              {selection && (
                <Table.ColumnHeader w="50px">
                  <Checkbox.Root
                    checked={isAllSelected}
                    _indeterminate={isIndeterminate ? {} : undefined}
                    onCheckedChange={(e) => handleSelectAll(!!e.checked)}
                  >
                    <Checkbox.Indicator />
                  </Checkbox.Root>
                </Table.ColumnHeader>
              )}
              
              {columns.map((column) => (
                <Table.ColumnHeader
                  key={String(column.key)}
                  w={column.width}
                  textAlign={column.align || 'left'}
                  cursor={column.sortable ? 'pointer' : 'default'}
                  onClick={column.sortable ? () => handleSort(String(column.key)) : undefined}
                  _hover={column.sortable ? { bg: 'neutral.50' } : undefined}
                >
                  <HStack gap={2} justify={column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start'}>
                    <Text>{column.header}</Text>
                    {column.sortable && sorting && (
                      <Text fontSize="xs" color="neutral.400">
                        {sorting.sortBy === String(column.key) 
                          ? sorting.sortOrder === 'asc' ? '↑' : '↓'
                          : '↕'
                        }
                      </Text>
                    )}
                  </HStack>
                </Table.ColumnHeader>
              ))}
              
              {rowActions && (
                <Table.ColumnHeader w="100px" textAlign="right">
                  Actions
                </Table.ColumnHeader>
              )}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {data.map((item, index) => (
              <Table.Row key={index} _hover={{ bg: 'neutral.25' }}>
                {selection && (
                  <Table.Cell>
                    <Checkbox.Root
                      checked={isItemSelected(item)}
                      onCheckedChange={(e) => handleSelectItem(item, !!e.checked)}
                    >
                      <Checkbox.Indicator />
                    </Checkbox.Root>
                  </Table.Cell>
                )}
                
                {columns.map((column) => (
                  <Table.Cell
                    key={String(column.key)}
                    textAlign={column.align || 'left'}
                  >
                    {renderCell(item, column)}
                  </Table.Cell>
                ))}
                
                {rowActions && (
                  <Table.Cell textAlign="right">
                    {rowActions(item)}
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination */}
      {pagination && (
        <HStack justify="space-between" align="center">
          <HStack gap={2}>
            <Text fontSize="sm" color="neutral.600">
              Showing {paginationInfo?.start} to {paginationInfo?.end} of {paginationInfo?.total} results
            </Text>
            
            <Select.Root
              value={String(pagination.pageSize)}
              onValueChange={(e) => pagination.onPageSizeChange(Number(e.value))}
              size="sm"
              w="auto"
            >
              <Select.Trigger>
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {[10, 25, 50, 100].map(size => (
                  <Select.Item key={size}>
                    {size} per page
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </HStack>

          <HStack gap={1}>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            
            <Text fontSize="sm" px={3}>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </Text>
            
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </HStack>
        </HStack>
      )}
    </VStack>
  )
}