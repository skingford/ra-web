import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { UserList } from '../UserList'
import { usePermissions } from '../../../lib/hooks/usePermissions'
import { system } from '../../../theme'
import { vi } from 'vitest'
import type { User } from '../../../stores/types'

// Mock the permissions hook
vi.mock('../../../lib/hooks/usePermissions')
const mockUsePermissions = usePermissions as any

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    avatar: 'https://example.com/avatar1.jpg',
    roles: [
      {
        id: '1',
        name: 'admin',
        description: 'Administrator',
        permissions: [],
      },
    ],
    permissions: [],
    status: 'active',
    lastLogin: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    roles: [
      {
        id: '2',
        name: 'editor',
        description: 'Editor',
        permissions: [],
      },
    ],
    permissions: [],
    status: 'inactive',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
]

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>
    {children}
  </ChakraProvider>
)

describe('UserList', () => {
  const mockOnCreateUser = vi.fn()
  const mockOnEditUser = vi.fn()
  const mockOnDeleteUser = vi.fn()
  const mockOnDeleteUsers = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUsePermissions.mockReturnValue({
      can: vi.fn().mockReturnValue(true),
      hasPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(true),
    })
  })

  it('renders user list correctly', () => {
    render(
      <TestWrapper>
        <UserList
          users={mockUsers}
          onCreateUser={mockOnCreateUser}
          onEditUser={mockOnEditUser}
          onDeleteUser={mockOnDeleteUser}
          onDeleteUsers={mockOnDeleteUsers}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('editor')).toBeInTheDocument()
  })

  it('shows create user button when user has permission', () => {
    render(
      <TestWrapper>
        <UserList
          users={mockUsers}
          onCreateUser={mockOnCreateUser}
        />
      </TestWrapper>
    )

    const createButtons = screen.getAllByText('Create User')
    expect(createButtons.length).toBeGreaterThan(0)
  })

  it('hides create user button when user lacks permission', () => {
    mockUsePermissions.mockReturnValue({
      can: vi.fn().mockReturnValue(false),
      hasPermission: vi.fn().mockReturnValue(false),
      hasRole: vi.fn().mockReturnValue(false),
    })

    render(
      <TestWrapper>
        <UserList
          users={mockUsers}
          onCreateUser={mockOnCreateUser}
        />
      </TestWrapper>
    )

    expect(screen.queryByText('Create User')).not.toBeInTheDocument()
  })

  it('displays loading state', () => {
    render(
      <TestWrapper>
        <UserList
          users={[]}
          loading={true}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('displays empty state when no users', () => {
    render(
      <TestWrapper>
        <UserList
          users={[]}
          onCreateUser={mockOnCreateUser}
        />
      </TestWrapper>
    )

    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('calls onCreateUser when create button is clicked', () => {
    render(
      <TestWrapper>
        <UserList
          users={mockUsers}
          onCreateUser={mockOnCreateUser}
        />
      </TestWrapper>
    )

    const createButton = screen.getAllByText('Create User')[0]
    fireEvent.click(createButton)

    expect(mockOnCreateUser).toHaveBeenCalledTimes(1)
  })

  it('displays user status badges correctly', () => {
    render(
      <TestWrapper>
        <UserList
          users={mockUsers}
        />
      </TestWrapper>
    )

    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('inactive')).toBeInTheDocument()
  })

  it('shows role badges for each user', () => {
    render(
      <TestWrapper>
        <UserList
          users={mockUsers}
        />
      </TestWrapper>
    )

    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('editor')).toBeInTheDocument()
  })

  it('displays last login information', () => {
    render(
      <TestWrapper>
        <UserList
          users={mockUsers}
        />
      </TestWrapper>
    )

    expect(screen.getByText('1/15/2024')).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
  })

  it('shows limited access warning when user lacks read permission', () => {
    mockUsePermissions.mockReturnValue({
      can: vi.fn().mockImplementation((action, resource) => {
        if (action === 'read' && resource === 'users') return false
        return true
      }),
      hasPermission: vi.fn().mockReturnValue(false),
      hasRole: vi.fn().mockReturnValue(false),
    })

    render(
      <TestWrapper>
        <UserList
          users={mockUsers}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Limited Access')).toBeInTheDocument()
  })
})