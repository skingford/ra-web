import React, { useState, useMemo, useCallback } from 'react'
import {
  Box,
  Table,
  Button,
  Input,
  HStack,
  VStack,
  Text,
  Checkbox,
  Spinner,
  Badge,
  IconButton,
  Alert,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
} from '@chakra-ui/react'
import { FiDownload, FiRefreshCw } from 'react-icons/fi'

export interface ColumnDef<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => any
  cell?: (info: { getValue: () => any; row: { original: T } }) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  align?: 'left' | 'center' | 'right'
  meta?: {
    filterType?: 'text' | 'select' | 'date' | 'number'
    filterOptions?: { label: string; value: string }[]
  }
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export interface SortingConfig {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export interface FilterConfig {
  filters: Record<string, any>
  onFilterChange: (filters: Record<string, any>) => void
  globalFilter?: string
  onGlobalFilterChange?: (filter: string) => void
}

export interface SelectionConfig<T> {
  selectedItems: T[]
  onSelectionChange: (items: T[]) => void
  getItemId: (item: T) => string | number
  enableSelectAll?: boolean
  maxSelection?: number
}

export interface TableAction<T> {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: (items: T[]) => void | Promise<void>
  variant?: 'solid' | 'outline' | 'ghost'
  colorScheme?: string
  disabled?: boolean | ((items: T[]) => boolean)
  confirmMessage?: string
  requiresSelection?: boolean
}

export interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  error?: string | null
  pagination?: PaginationConfig
  sorting?: SortingConfig
  filtering?: FilterConfig
  selection?: SelectionConfig<T>
  actions?: TableAction<T>[]
  emptyState?: React.ReactNode
  rowActions?: (item: T) => React.ReactNode
  onRefresh?: () => void
  exportable?: boolean
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void
  stickyHeader?: boolean
  striped?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  pagination,
  sorting,
  filtering,
  selection,
  actions = [],
  emptyState,
  rowActions,
  onRefresh,
  exportable = false,
  onExport,
  stickyHeader = false,
  striped = false,
  size = 'md',
  className,
}: DataTableProps<T>) {
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filters = filtering?.filters || localFilters
  const setFilters = filtering?.onFilterChange || setLocalFilters

  // Handle sorting
  const handleSort = useCallback((columnId: string) => {
    if (!sorting) return

    const newOrder = 
      sorting.sortBy === columnId && sorting.sortOrder === 'asc' 
        ? 'desc' 
        : 'asc'
    
    sorting.onSort(columnId, newOrder)
  }, [sorting])

  // Handle selection with improved logic
  const handleSelectAll = useCallback((checked: boolean) => {
    if (!selection) return

    if (checked) {
      // Respect maxSelection if set
      const itemsToSelect = selection.maxSelection 
        ? data.slice(0, selection.maxSelection)
        : data
      selection.onSelectionChange(itemsToSelect)
    } else {
      selection.onSelectionChange([])
    }
  }, [selection, data])

  const handleSelectItem = useCallback((item: T, checked: boolean) => {
    if (!selection) return

    const itemId = selection.getItemId(item)
    const currentSelection = selection.selectedItems

    if (checked) {
      // Check maxSelection limit
      if (selection.maxSelection && currentSelection.length >= selection.maxSelection) {
        return
      }
      selection.onSelectionChange([...currentSelection, item])
    } else {
      selection.onSelectionChange(
        currentSelection.filter(selected => 
          selection.getItemId(selected) !== itemId
        )
      )
    }
  }, [selection])

  const isItemSelected = useCallback((item: T): boolean => {
    if (!selection) return false
    
    const itemId = selection.getItemId(item)
    return selection.selectedItems.some(selected => 
      selection.getItemId(selected) === itemId
    )
  }, [selection])

  const isAllSelected = useMemo(() => {
    if (!selection || data.length === 0) return false
    const selectableItems = selection.maxSelection 
      ? data.slice(0, selection.maxSelection)
      : data
    return selectableItems.every(item => isItemSelected(item))
  }, [selection, data, isItemSelected])

  const isIndeterminate = useMemo(() => {
    if (!selection || data.length === 0) return false
    const selectedCount = data.filter(item => isItemSelected(item)).length
    return selectedCount > 0 && selectedCount < data.length
  }, [selection, data, isItemSelected])

  // Handle filtering with different types
  const handleFilterChange = useCallback((columnId: string, value: any) => {
    setFilters({
      ...filters,
      [columnId]: value,
    })
  }, [filters, setFilters])

  const handleGlobalFilterChange = useCallback((value: string) => {
    if (filtering?.onGlobalFilterChange) {
      filtering.onGlobalFilterChange(value)
    }
  }, [filtering])

  // Handle actions with loading states
  const handleAction = useCallback(async (action: TableAction<T>, items: T[]) => {
    if (typeof action.disabled === 'function' && action.disabled(items)) return
    if (typeof action.disabled === 'boolean' && action.disabled) return

    try {
      setActionLoading(action.id)
      await action.onClick(items)
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setActionLoading(null)
    }
  }, [])

  // Render cell content with improved type handling
  const renderCell = useCallback((item: T, column: ColumnDef<T>) => {
    let value: any

    if (column.cell) {
      const getValue = () => {
        if (column.accessorFn) return column.accessorFn(item)
        if (column.accessorKey) return item[column.accessorKey]
        return null
      }
      return column.cell({ getValue, row: { original: item } })
    }

    if (column.accessorFn) {
      value = column.accessorFn(item)
    } else if (column.accessorKey) {
      value = item[column.accessorKey]
    } else {
      return <Text color="gray.400">-</Text>
    }
    
    if (value === null || value === undefined) {
      return <Text color="gray.400">-</Text>
    }

    if (typeof value === 'boolean') {
      return (
        <Badge colorScheme={value ? 'green' : 'gray'} size="sm">
          {value ? 'Yes' : 'No'}
        </Badge>
      )
    }

    if (value instanceof Date) {
      return <Text>{value.toLocaleDateString()}</Text>
    }

    if (typeof value === 'number') {
      return <Text>{value.toLocaleString()}</Text>
    }

    return <Text>{String(value)}</Text>
  }, [])

  // Render filter input based on column type
  const renderFilterInput = useCallback((column: ColumnDef<T>) => {
    const filterType = column.meta?.filterType || 'text'
    const currentValue = filters[column.id] || ''

    switch (filterType) {
      case 'select':
        const items = [
          { label: 'All', value: '' },
          ...(column.meta?.filterOptions || [])
        ]
        return (
          <SelectRoot
            value={[currentValue]}
            onValueChange={(e) => handleFilterChange(column.id, e.value[0] || '')}
            size="sm"
          >
            <SelectTrigger>
              <SelectValueText placeholder={`Filter ${column.header}`} />
            </SelectTrigger>
            <SelectContent>
              {items.map(option => (
                <SelectItem key={option.value} item={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        )
      case 'number':
        return (
          <Input
            type="number"
            placeholder={`Filter ${column.header}`}
            size="sm"
            value={currentValue}
            onChange={(e) => handleFilterChange(column.id, e.target.value)}
          />
        )
      case 'date':
        return (
          <Input
            type="date"
            placeholder={`Filter ${column.header}`}
            size="sm"
            value={currentValue}
            onChange={(e) => handleFilterChange(column.id, e.target.value)}
          />
        )
      default:
        return (
          <Input
            placeholder={`Filter ${column.header}`}
            size="sm"
            value={currentValue}
            onChange={(e) => handleFilterChange(column.id, e.target.value)}
          />
        )
    }
  }, [filters, handleFilterChange])

  // Pagination info
  const paginationInfo = pagination ? {
    start: (pagination.page - 1) * pagination.pageSize + 1,
    end: Math.min(pagination.page * pagination.pageSize, pagination.total),
    total: pagination.total,
    totalPages: Math.ceil(pagination.total / pagination.pageSize),
  } : null

  // Error state
  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Title>Error loading data</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
        {onRefresh && (
          <Button size="sm" variant="outline" onClick={onRefresh} ml="auto">
            Retry
          </Button>
        )}
      </Alert.Root>
    )
  }

  // Loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <VStack gap={3}>
          <Spinner size="lg" colorScheme="blue" />
          <Text color="gray.600">Loading data...</Text>
        </VStack>
      </Box>
    )
  }

  // Empty state
  if (data.length === 0 && !loading) {
    return (
      <Box textAlign="center" py={10}>
        {emptyState || (
          <VStack gap={3}>
            <Text fontSize="lg" color="gray.600">
              No data available
            </Text>
            <Text color="gray.500">
              There are no items to display at the moment.
            </Text>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh}>
                <FiRefreshCw />
                Refresh
              </Button>
            )}
          </VStack>
        )}
      </Box>
    )
  }

  return (
    <VStack gap={4} align="stretch" className={className}>
      {/* Toolbar */}
      <HStack justify="space-between" wrap="wrap" gap={4}>
        {/* Left side - Global filter and actions */}
        <HStack gap={4} flex={1}>
          {/* Global search */}
          {filtering?.onGlobalFilterChange && (
            <Input
              placeholder="Search all columns..."
              value={filtering.globalFilter || ''}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
              maxW="300px"
              size="sm"
            />
          )}

          {/* Bulk Actions */}
          {actions.length > 0 && selection && selection.selectedItems.length > 0 && (
            <HStack gap={2} bg="blue.50" p={2} borderRadius="md">
              <Text fontSize="sm" color="blue.700" fontWeight="medium">
                {selection.selectedItems.length} selected
              </Text>
              {actions
                .filter(action => !action.requiresSelection || selection.selectedItems.length > 0)
                .map((action) => {
                  const isDisabled = typeof action.disabled === 'function' 
                    ? action.disabled(selection.selectedItems)
                    : action.disabled
                  
                  return (
                    <Button
                      key={action.id}
                      size="sm"
                      variant={action.variant || 'outline'}
                      colorScheme={action.colorScheme}
                      disabled={isDisabled || actionLoading === action.id}
                      onClick={() => handleAction(action, selection.selectedItems)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  )
                })}
            </HStack>
          )}
        </HStack>

        {/* Right side - Utility actions */}
        <HStack gap={2}>
          {exportable && onExport && (
            <MenuRoot>
              <MenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <FiDownload />
                  Export
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="csv" onClick={() => onExport('csv')}>
                  Export as CSV
                </MenuItem>
                <MenuItem value="excel" onClick={() => onExport('excel')}>
                  Export as Excel
                </MenuItem>
                <MenuItem value="pdf" onClick={() => onExport('pdf')}>
                  Export as PDF
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          )}

          {onRefresh && (
            <IconButton
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
              title="Refresh data"
            >
              <FiRefreshCw />
            </IconButton>
          )}
        </HStack>
      </HStack>

      {/* Column Filters */}
      {columns.some(col => col.filterable) && (
        <HStack gap={2} wrap="wrap" bg="gray.50" p={3} borderRadius="md">
          {columns
            .filter(col => col.filterable)
            .map(column => (
              <Box key={column.id} minW="200px">
                {renderFilterInput(column)}
              </Box>
            ))}
        </HStack>
      )}

      {/* Table */}
      <Box 
        overflowX="auto" 
        border="1px" 
        borderColor="gray.200" 
        borderRadius="md"
        position="relative"
      >
        <Table.Root size={size} variant={striped ? 'outline' : 'simple'}>
          <Table.Header position={stickyHeader ? 'sticky' : 'static'} top={0} bg="white" zIndex={1}>
            <Table.Row>
              {selection && (
                <Table.ColumnHeader w="50px">
                  <Checkbox.Root
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onCheckedChange={(e) => handleSelectAll(!!e.checked)}
                    disabled={selection.maxSelection === 1}
                  >
                    <Checkbox.Indicator />
                  </Checkbox.Root>
                </Table.ColumnHeader>
              )}
              
              {columns.map((column) => (
                <Table.ColumnHeader
                  key={column.id}
                  w={column.width}
                  minW={column.minWidth}
                  maxW={column.maxWidth}
                  textAlign={column.align || 'left'}
                  cursor={column.sortable ? 'pointer' : 'default'}
                  onClick={column.sortable ? () => handleSort(column.id) : undefined}
                  _hover={column.sortable ? { bg: 'gray.50' } : {}}
                  userSelect="none"
                >
                  <HStack 
                    gap={2} 
                    justify={
                      column.align === 'center' ? 'center' : 
                      column.align === 'right' ? 'flex-end' : 'flex-start'
                    }
                  >
                    <Text fontWeight="semibold">{column.header}</Text>
                    {column.sortable && sorting && (
                      <Text fontSize="xs" color="gray.400">
                        {sorting.sortBy === column.id 
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
            {data.map((item, index) => {
              const isSelected = isItemSelected(item)
              const itemId = selection?.getItemId(item)
              
              return (
                <Table.Row 
                  key={itemId || index} 
                  _hover={{ bg: 'gray.50' }}
                  bg={isSelected ? 'blue.50' : undefined}
                >
                  {selection && (
                    <Table.Cell>
                      <Checkbox.Root
                        checked={isSelected}
                        onCheckedChange={(e) => handleSelectItem(item, !!e.checked)}
                        disabled={
                          !isSelected && 
                          selection.maxSelection && 
                          selection.selectedItems.length >= selection.maxSelection
                        }
                      >
                        <Checkbox.Indicator />
                      </Checkbox.Root>
                    </Table.Cell>
                  )}
                  
                  {columns.map((column) => (
                    <Table.Cell
                      key={column.id}
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
              )
            })}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination */}
      {pagination && (
        <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack gap={4}>
            <Text fontSize="sm" color="gray.600">
              Showing {paginationInfo?.start} to {paginationInfo?.end} of {paginationInfo?.total} results
            </Text>
            
            <SelectRoot
              value={[String(pagination.pageSize)]}
              onValueChange={(e) => pagination.onPageSizeChange(Number(e.value[0]))}
              size="sm"
              width="auto"
            >
              <SelectTrigger>
                <SelectValueText />
              </SelectTrigger>
              <SelectContent>
                {(pagination.pageSizeOptions || [10, 25, 50, 100]).map(size => (
                  <SelectItem key={size} item={String(size)} value={String(size)}>
                    {size} per page
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </HStack>

          <HStack gap={1}>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(1)}
            >
              First
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            
            <Text fontSize="sm" px={3} whiteSpace="nowrap">
              Page {pagination.page} of {paginationInfo?.totalPages}
            </Text>
            
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= (paginationInfo?.totalPages || 1)}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagination.page >= (paginationInfo?.totalPages || 1)}
              onClick={() => pagination.onPageChange(paginationInfo?.totalPages || 1)}
            >
              Last
            </Button>
          </HStack>
        </HStack>
      )}

      {/* Selection info */}
      {selection && selection.maxSelection && (
        <Text fontSize="xs" color="gray.500" textAlign="center">
          {selection.selectedItems.length} of {selection.maxSelection} items selected
        </Text>
      )}
    </VStack>
  )
}