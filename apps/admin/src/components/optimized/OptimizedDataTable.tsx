// Optimized DataTable component with React performance optimizations
import React, { memo, useMemo, useCallback, useState } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Select,
  HStack,
  VStack,
  Text,
  Checkbox,
  IconButton,
  Spinner,
  Badge,
} from '@chakra-ui/react'
import { ChevronUpIcon, ChevronDownIcon, SearchIcon } from '@chakra-ui/icons'

// Interfaces for type safety
interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  pageSize?: number
  onRowSelect?: (selectedRows: T[]) => void
  onSort?: (column: keyof T, direction: 'asc' | 'desc') => void
  onFilter?: (column: keyof T, value: string) => void
}

interface SortState<T> {
  column: keyof T | null
  direction: 'asc' | 'desc'
}

interface FilterState<T> {
  [key: string]: string
}

// Memoized table header component
const TableHeader = memo(<T,>({ 
  columns, 
  sortState, 
  onSort, 
  onSelectAll, 
  allSelected 
}: {
  columns: Column<T>[]
  sortState: SortState<T>
  onSort: (column: keyof T) => void
  onSelectAll: () => void
  allSelected: boolean
}) => {
  return (
    <Thead>
      <Tr>
        <Th width="40px">
          <Checkbox isChecked={allSelected} onChange={onSelectAll} />
        </Th>
        {columns.map((column) => (
          <Th key={String(column.key)} cursor={column.sortable ? 'pointer' : 'default'}>
            <HStack spacing={2}>
              <Text>{column.label}</Text>
              {column.sortable && (
                <Box onClick={() => onSort(column.key)}>
                  {sortState.column === column.key ? (
                    sortState.direction === 'asc' ? (
                      <ChevronUpIcon />
                    ) : (
                      <ChevronDownIcon />
                    )
                  ) : (
                    <Box opacity={0.3}>
                      <ChevronUpIcon />
                    </Box>
                  )}
                </Box>
              )}
            </HStack>
          </Th>
        ))}
      </Tr>
    </Thead>
  )
})

// Memoized table row component
const TableRow = memo(<T extends { id: string | number }>({
  row,
  columns,
  isSelected,
  onSelect,
}: {
  row: T
  columns: Column<T>[]
  isSelected: boolean
  onSelect: (row: T) => void
}) => {
  const handleSelect = useCallback(() => {
    onSelect(row)
  }, [row, onSelect])

  return (
    <Tr bg={isSelected ? 'blue.50' : 'white'} _hover={{ bg: 'gray.50' }}>
      <Td>
        <Checkbox isChecked={isSelected} onChange={handleSelect} />
      </Td>
      {columns.map((column) => (
        <Td key={String(column.key)}>
          {column.render 
            ? column.render(row[column.key], row)
            : String(row[column.key] || '')
          }
        </Td>
      ))}
    </Tr>
  )
})

// Memoized filter controls
const FilterControls = memo(<T,>({
  columns,
  filters,
  onFilterChange,
}: {
  columns: Column<T>[]
  filters: FilterState<T>
  onFilterChange: (column: keyof T, value: string) => void
}) => {
  const filterableColumns = useMemo(
    () => columns.filter(col => col.filterable),
    [columns]
  )

  return (
    <HStack spacing={4} mb={4} wrap="wrap">
      {filterableColumns.map((column) => (
        <Box key={String(column.key)} minW="200px">
          <Text fontSize="sm" mb={1}>{column.label}</Text>
          <Input
            placeholder={`Filter by ${column.label}`}
            value={filters[String(column.key)] || ''}
            onChange={(e) => onFilterChange(column.key, e.target.value)}
            size="sm"
          />
        </Box>
      ))}
    </HStack>
  )
})

// Memoized pagination component
const Pagination = memo(({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}) => {
  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value))
  }, [onPageSizeChange])

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1)
  }, [currentPage, onPageChange])

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) onPageChange(currentPage + 1)
  }, [currentPage, totalPages, onPageChange])

  return (
    <HStack justify="space-between" mt={4}>
      <HStack spacing={2}>
        <Text fontSize="sm">
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
        </Text>
      </HStack>
      
      <HStack spacing={2}>
        <Text fontSize="sm">Rows per page:</Text>
        <Select size="sm" value={pageSize} onChange={handlePageSizeChange} w="80px">
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </Select>
      </HStack>

      <HStack spacing={2}>
        <Button size="sm" onClick={handlePrevPage} isDisabled={currentPage === 1}>
          Previous
        </Button>
        <Text fontSize="sm">
          Page {currentPage} of {totalPages}
        </Text>
        <Button size="sm" onClick={handleNextPage} isDisabled={currentPage === totalPages}>
          Next
        </Button>
      </HStack>
    </HStack>
  )
})

// Main optimized DataTable component
export const OptimizedDataTable = memo(<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  pageSize: initialPageSize = 10,
  onRowSelect,
  onSort,
  onFilter,
}: DataTableProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set())
  const [sortState, setSortState] = useState<SortState<T>>({ column: null, direction: 'asc' })
  const [filters, setFilters] = useState<FilterState<T>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Memoized filtered data
  const filteredData = useMemo(() => {
    let result = [...data]
    
    // Apply filters
    Object.entries(filters).forEach(([column, value]) => {
      if (value) {
        result = result.filter(row => 
          String(row[column as keyof T] || '').toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    // Apply sorting
    if (sortState.column) {
      result.sort((a, b) => {
        const aVal = a[sortState.column!]
        const bVal = b[sortState.column!]
        
        if (aVal < bVal) return sortState.direction === 'asc' ? -1 : 1
        if (aVal > bVal) return sortState.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [data, filters, sortState])

  // Memoized paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  // Memoized pagination info
  const paginationInfo = useMemo(() => ({
    totalItems: filteredData.length,
    totalPages: Math.ceil(filteredData.length / pageSize),
  }), [filteredData.length, pageSize])

  // Memoized selection state
  const selectionState = useMemo(() => ({
    allSelected: selectedRows.size > 0 && paginatedData.every(row => selectedRows.has(row.id)),
    selectedRowsArray: data.filter(row => selectedRows.has(row.id)),
  }), [selectedRows, paginatedData, data])

  // Optimized event handlers
  const handleSort = useCallback((column: keyof T) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
    onSort?.(column, sortState.direction === 'asc' ? 'desc' : 'asc')
  }, [sortState.direction, onSort])

  const handleFilterChange = useCallback((column: keyof T, value: string) => {
    setFilters(prev => ({ ...prev, [String(column)]: value }))
    setCurrentPage(1) // Reset to first page when filtering
    onFilter?.(column, value)
  }, [onFilter])

  const handleRowSelect = useCallback((row: T) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(row.id)) {
        newSet.delete(row.id)
      } else {
        newSet.add(row.id)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedRows(prev => {
      if (selectionState.allSelected) {
        const newSet = new Set(prev)
        paginatedData.forEach(row => newSet.delete(row.id))
        return newSet
      } else {
        const newSet = new Set(prev)
        paginatedData.forEach(row => newSet.add(row.id))
        return newSet
      }
    })
  }, [selectionState.allSelected, paginatedData])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  // Effect to notify parent of selection changes
  React.useEffect(() => {
    onRowSelect?.(selectionState.selectedRowsArray)
  }, [selectionState.selectedRowsArray, onRowSelect])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <VStack spacing={3}>
          <Spinner size="lg" />
          <Text>Loading data...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Filter Controls */}
      <FilterControls
        columns={columns}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Selection Summary */}
      {selectedRows.size > 0 && (
        <Box p={3} bg="blue.50" borderRadius="md">
          <Text fontSize="sm">
            <Badge colorScheme="blue" mr={2}>{selectedRows.size}</Badge>
            {selectedRows.size === 1 ? 'row' : 'rows'} selected
          </Text>
        </Box>
      )}

      {/* Table */}
      <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
        <Table variant="simple">
          <TableHeader
            columns={columns}
            sortState={sortState}
            onSort={handleSort}
            onSelectAll={handleSelectAll}
            allSelected={selectionState.allSelected}
          />
          <Tbody>
            {paginatedData.map((row) => (
              <TableRow
                key={row.id}
                row={row}
                columns={columns}
                isSelected={selectedRows.has(row.id)}
                onSelect={handleRowSelect}
              />
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={paginationInfo.totalPages}
        pageSize={pageSize}
        totalItems={paginationInfo.totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </VStack>
  )
})

OptimizedDataTable.displayName = 'OptimizedDataTable'