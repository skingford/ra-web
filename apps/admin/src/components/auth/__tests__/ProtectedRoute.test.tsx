import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { ProtectedRoute, RequirePermission, RequireRole } from '../ProtectedRoute'
import { useAuthStore } from '../../../stores/authStore'
import { authTokenManager } from '../../../lib/auth'
import { system } from '../../../theme'
import { vi } from 'vitest'

// Mock the auth store
vi.mock('../../../stores/authStore')
const mockUseAuthStore = useAuthStore as any

// Mock the auth token manager
vi.mock('../../../lib/auth')
const mockAuthTokenManager = authTokenManager as any

// Mock user data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  roles: [
    {
      id: '1',
      name: 'admin',
      description: 'Administrator',
      permissions: [],
    },
  ],
  permissions: [
    {
      id: '1',
      resource: 'users',
      action: 'read' as const,
    },
    {
      id: '2',
      resource: 'users',
      action: 'create' as const,
    },
  ],
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Test wrapper with providers
const TestWrapper = ({
  children,
  initialEntries = ['/dashboard']
}: {
  children: React.ReactNode
  initialEntries?: string[]
}) => (
  <ChakraProvider value={system}>
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  </ChakraProvider>
)

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner while checking authentication', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      permissions: new Set(),
      isAuthenticated: false,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      setLoading: vi.fn(),
      hasPermission: vi.fn(),
    })

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    )

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      token: 'valid-token',
      permissions: new Set(['users:read', 'users:create']),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      setLoading: vi.fn(),
      hasPermission: vi.fn().mockReturnValue(true),
    })

    mockAuthTokenManager.isTokenExpired.mockReturnValue(false)

    render(
      <TestWrapper>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })
})

describe('RequirePermission', () => {
  it('renders children when user has permission', () => {
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      token: 'valid-token',
      permissions: new Set(['users:read']),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      setLoading: vi.fn(),
      hasPermission: vi.fn().mockReturnValue(true),
    })

    render(
      <TestWrapper>
        <RequirePermission permission="users:read">
          <div>Content with Permission</div>
        </RequirePermission>
      </TestWrapper>
    )

    expect(screen.getByText('Content with Permission')).toBeInTheDocument()
  })
})

describe('RequireRole', () => {
  it('renders children when user has role', () => {
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      token: 'valid-token',
      permissions: new Set(),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      setLoading: vi.fn(),
      hasPermission: vi.fn(),
    })

    render(
      <TestWrapper>
        <RequireRole role="admin">
          <div>Admin Content</div>
        </RequireRole>
      </TestWrapper>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })
})