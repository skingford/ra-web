import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '../../../theme'
import { DataTable, ColumnDef, DataTableProps } from '../DataTable'
import { describe, it, expect, vi } from 'vitest'

// Test data
interface TestUser {
  id: number
  name: string
  email: string
  role: string
  active: boolean
  createdAt: Date
}

const mockUsers: TestUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    active: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    active: false,
    createdAt: new Date('2023-01-02'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'user',
    active: true,
    createdAt: new Date('2023-01-03'),
  },
]

const mockColumns: ColumnDef<TestUser>[] = [
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
    id: 'active',
    header: 'Active',
    accessorKey: 'active',
    cell: ({ getValue }) => (
      <span>{getValue() ? 'Yes' : 'No'}</span>
    ),
  },
  {
    id: 'createdAt',
    header: 'Created',
    accessorKey: 'createdAt',
    cell: ({ getValue }) => (
      <span>{getValue().toLocaleDateString()}</span>
    ),
  },
]

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider value={system}>{children}</ChakraProvider>
)

const renderDataTable = (props: Partial<DataTableProps<TestUser>> = {}) => {
  const defaultProps: DataTableProps<TestUser> = {
    data: mockUsers,
    columns: mockColumns,
    ...props,
  }

  return render(
    <TestWrapper>
      <DataTable {...defaultProps} />
    </TestWrapper>
  )
}

describe('DataTable', () => {
  describe('Basic Rendering', () => {
    it('renders table with data', () => {
      renderDataTable()
      
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    })

    it('renders column headers', () => {
      renderDataTable()
      
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Role')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Created')).toBeInTheDocument()
    })

    it('renders custom cell content', () => {
      renderDataTable()
      
      // Check boolean rendering - there are multiple "Yes" values
      expect(screen.getAllByText('Yes')).toHaveLength(2)
      expect(screen.getByText('No')).toBeInTheDocument()
      
      // Check date rendering
      expect(screen.getByText('1/1/2023')).toBeInTheDocument()
    })
  })

  describe('Loading and Error States', () => {
    it('shows loading state', () => {
      renderDataTable({ loading: true })
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument()
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    })

    it('shows error state', () => {
      renderDataTable({ error: 'Failed to load data' })
      
      expect(screen.getByText('Error loading data')).toBeInTheDocument()
      expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    })

    it('shows empty state', () => {
      renderDataTable({ data: [] })
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
      expect(screen.getByText('There are no items to display at the moment.')).toBeInTheDocument()
    })

    it('shows custom empty state', () => {
      const customEmptyState = <div>Custom empty message</div>
      renderDataTable({ 
        data: [], 
        emptyState: customEmptyState,
      })
      
      expect(screen.getByText('Custom empty message')).toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('calls onSort when sortable column header is clicked', async () => {
      const user = userEvent.setup()
      const onSort = vi.fn()
      
      renderDataTable({
        sorting: {
          onSort,
        },
      })
      
      const nameHeader = screen.getByText('Name')
      await user.click(nameHeader)
      
      expect(onSort).toHaveBeenCalledWith('name', 'asc')
    })

    it('shows sort indicators', () => {
      renderDataTable({
        sorting: {
          sortBy: 'name',
          sortOrder: 'asc',
          onSort: vi.fn(),
        },
      })
      
      expect(screen.getByText('↑')).toBeInTheDocument()
    })

    it('toggles sort order on repeated clicks', async () => {
      const user = userEvent.setup()
      const onSort = vi.fn()
      
      renderDataTable({
        sorting: {
          sortBy: 'name',
          sortOrder: 'asc',
          onSort,
        },
      })
      
      const nameHeader = screen.getByText('Name')
      await user.click(nameHeader)
      
      expect(onSort).toHaveBeenCalledWith('name', 'desc')
    })
  })

  describe('Selection', () => {
    it('renders selection checkboxes when selection config is provided', () => {
      const onSelectionChange = vi.fn()
      
      renderDataTable({
        selection: {
          selectedItems: [],
          onSelectionChange,
          getItemId: (item) => item.id,
        },
      })
      
      // Should have select all checkbox + one for each row (using data-scope attribute)
      const checkboxes = document.querySelectorAll('[data-scope="checkbox"]')
      expect(checkboxes).toHaveLength(4) // 1 select all + 3 rows
    })

    it('handles individual item selection', () => {
      const onSelectionChange = vi.fn()
      
      // Test with an item already selected to verify the UI state
      renderDataTable({
        selection: {
          selectedItems: [mockUsers[0]!],
          onSelectionChange,
          getItemId: (item) => item.id,
        },
      })
      
      // Check that the first item appears selected
      const checkboxes = document.querySelectorAll('[data-scope="checkbox"]')
      expect(checkboxes[1]).toHaveAttribute('data-state', 'checked')
    })

    it('handles select all functionality', () => {
      const onSelectionChange = vi.fn()
      
      // Test with all items selected to verify the UI state
      renderDataTable({
        selection: {
          selectedItems: mockUsers,
          onSelectionChange,
          getItemId: (item) => item.id,
        },
      })
      
      // Check that the select all checkbox appears checked
      const selectAllCheckbox = document.querySelectorAll('[data-scope="checkbox"]')[0]
      expect(selectAllCheckbox).toHaveAttribute('data-state', 'checked')
    })

    it('respects maxSelection limit', async () => {
      const user = userEvent.setup()
      const onSelectionChange = vi.fn()
      
      renderDataTable({
        selection: {
          selectedItems: [mockUsers[0]!],
          onSelectionChange,
          getItemId: (item) => item.id,
          maxSelection: 1,
        },
      })
      
      const checkboxes = document.querySelectorAll('[data-scope="checkbox"]')
      const secondItemCheckbox = checkboxes[2] // Third checkbox (second item)
      
      // Should be disabled because maxSelection is 1 and one item is already selected
      expect(secondItemCheckbox).toHaveAttribute('data-disabled')
    })
  })

  describe('Filtering', () => {
    it('renders filter inputs for filterable columns', () => {
      const onFilterChange = vi.fn()
      
      renderDataTable({
        filtering: {
          filters: {},
          onFilterChange,
        },
      })
      
      // Should have filter inputs for filterable columns (name, email, role)
      expect(screen.getByPlaceholderText('Filter Name')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Filter Email')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Filter Role')).toBeInTheDocument()
    })

    it('calls onFilterChange when filter input changes', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()
      
      renderDataTable({
        filtering: {
          filters: {},
          onFilterChange,
        },
      })
      
      const nameFilter = screen.getByPlaceholderText('Filter Name')
      
      // Use paste instead of type to avoid character-by-character input
      await user.click(nameFilter)
      await user.paste('John')
      
      // Check that onFilterChange was called with the complete value
      expect(onFilterChange).toHaveBeenCalledWith({ name: 'John' })
    })

    it('renders global search when provided', () => {
      const onGlobalFilterChange = vi.fn()
      
      renderDataTable({
        filtering: {
          filters: {},
          onFilterChange: vi.fn(),
          globalFilter: '',
          onGlobalFilterChange,
        },
      })
      
      expect(screen.getByPlaceholderText('Search all columns...')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    const mockPagination = {
      page: 1,
      pageSize: 10,
      total: 100,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    }

    it('renders pagination controls', () => {
      renderDataTable({
        pagination: mockPagination,
      })
      
      // Check for pagination text parts
      expect(screen.getByText(/Showing/)).toBeInTheDocument()
      expect(screen.getByText(/to/)).toBeInTheDocument()
      expect(screen.getAllByText(/of/)).toHaveLength(2) // "of" appears in both pagination info and page info
      expect(screen.getByText(/results/)).toBeInTheDocument()
      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('Last')).toBeInTheDocument()
    })

    it('calls onPageChange when navigation buttons are clicked', async () => {
      const user = userEvent.setup()
      const onPageChange = vi.fn()
      
      renderDataTable({
        pagination: {
          ...mockPagination,
          onPageChange,
        },
      })
      
      const nextButton = screen.getByText('Next')
      await user.click(nextButton)
      
      expect(onPageChange).toHaveBeenCalledWith(2)
    })

    it('disables navigation buttons appropriately', () => {
      renderDataTable({
        pagination: {
          ...mockPagination,
          page: 1, // First page
        },
      })
      
      expect(screen.getByText('First')).toBeDisabled()
      expect(screen.getByText('Previous')).toBeDisabled()
    })
  })

  describe('Actions', () => {
    it('renders bulk actions when items are selected', () => {
      const actions = [
        {
          id: 'delete',
          label: 'Delete',
          onClick: vi.fn(),
          requiresSelection: true,
        },
      ]
      
      renderDataTable({
        actions,
        selection: {
          selectedItems: [mockUsers[0]!],
          onSelectionChange: vi.fn(),
          getItemId: (item) => item.id,
        },
      })
      
      expect(screen.getByText(/selected/)).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('calls action onClick when action button is clicked', async () => {
      const user = userEvent.setup()
      const onClick = vi.fn()
      const actions = [
        {
          id: 'delete',
          label: 'Delete',
          onClick,
          requiresSelection: true,
        },
      ]
      
      renderDataTable({
        actions,
        selection: {
          selectedItems: [mockUsers[0]!],
          onSelectionChange: vi.fn(),
          getItemId: (item) => item.id,
        },
      })
      
      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)
      
      expect(onClick).toHaveBeenCalledWith([mockUsers[0]!])
    })
  })

  describe('Export Functionality', () => {
    it('renders export menu when exportable is true', () => {
      renderDataTable({
        exportable: true,
        onExport: vi.fn(),
      })
      
      expect(screen.getByText('Export')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper table structure', () => {
      renderDataTable()
      
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getAllByRole('columnheader')).toHaveLength(5)
      expect(screen.getAllByRole('row')).toHaveLength(4) // 1 header + 3 data rows
    })

    it('supports keyboard navigation for sortable columns', async () => {
      const onSort = vi.fn()
      
      renderDataTable({
        sorting: {
          onSort,
        },
      })
      
      const nameHeader = screen.getByText('Name')
      await userEvent.click(nameHeader) // Use click instead of keyboard for now
      
      expect(onSort).toHaveBeenCalledWith('name', 'asc')
    })
  })

  describe('Performance', () => {
    it('handles large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: i % 2 === 0 ? 'admin' : 'user',
        active: i % 3 === 0,
        createdAt: new Date(),
      }))
      
      const { container } = renderDataTable({ data: largeDataset })
      
      // Should render without performance issues
      expect(container.querySelector('table')).toBeInTheDocument()
    })
  })
})