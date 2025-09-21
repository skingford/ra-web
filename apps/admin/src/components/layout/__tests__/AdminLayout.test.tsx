import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { AdminLayout } from '../AdminLayout'
import { system } from '../../../theme'
import { useUIStore } from '../../../stores/uiStore'
import { useAuthStore } from '../../../stores/authStore'

// Mock the stores
vi.mock('../../../stores/uiStore')
vi.mock('../../../stores/authStore')

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiMenu: () => <div data-testid="menu-icon" />,
  FiBell: () => <div data-testid="bell-icon" />,
  FiSun: () => <div data-testid="sun-icon" />,
  FiMoon: () => <div data-testid="moon-icon" />,
  FiUser: () => <div data-testid="user-icon" />,
  FiSettings: () => <div data-testid="settings-icon" />,
  FiLogOut: () => <div data-testid="logout-icon" />,
  FiChevronDown: () => <div data-testid="chevron-down-icon" />,
  FiChevronRight: () => <div data-testid="chevron-right-icon" />,
  FiHome: () => <div data-testid="home-icon" />,
  FiUsers: () => <div data-testid="users-icon" />,
  FiBarChart: () => <div data-testid="chart-icon" />,
  FiFileText: () => <div data-testid="file-icon" />,
  FiX: () => <div data-testid="close-icon" />,
}))

// Mock Chakra UI hooks
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    useBreakpointValue: vi.fn(() => false), // Default to desktop
    useColorMode: () => ({
      colorMode: 'light',
      toggleColorMode: vi.fn(),
    }),
    useDisclosure: () => ({
      isOpen: false,
      onOpen: vi.fn(),
      onClose: vi.fn(),
    }),
    Collapse: ({ children, in: isOpen }: any) => isOpen ? <div>{children}</div> : null,
    MenuRoot: ({ children }: any) => <div>{children}</div>,
    MenuTrigger: ({ children }: any) => <div>{children}</div>,
    MenuContent: ({ children }: any) => <div>{children}</div>,
    MenuItem: ({ children }: any) => <div>{children}</div>,
    MenuSeparator: () => <hr />,
  }
})

const mockUIStore = {
  sidebarCollapsed: false,
  setSidebarCollapsed: vi.fn(),
  setBreadcrumbs: vi.fn(),
  notifications: [],
  theme: 'light',
  toggleTheme: vi.fn(),
}

const mockAuthStore = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: '',
    roles: [],
    permissions: [],
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  permissions: new Set(['users.read']),
  logout: vi.fn(),
}

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {ui}
    </ChakraProvider>
  )
}

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.mocked(useUIStore).mockReturnValue(mockUIStore)
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    vi.clearAllMocks()
  })

  it('renders layout with title and content', () => {
    renderWithProviders(
      <AdminLayout title="Test Page">
        <div data-testid="page-content">Page Content</div>
      </AdminLayout>
    )

    expect(screen.getByText('Test Page')).toBeInTheDocument()
    expect(screen.getByTestId('page-content')).toBeInTheDocument()
  })

  it('handles sidebar toggle', () => {
    renderWithProviders(
      <AdminLayout title="Test Page">
        <div>Content</div>
      </AdminLayout>
    )

    const menuButton = screen.getByLabelText('切换菜单')
    fireEvent.click(menuButton)

    expect(mockUIStore.setSidebarCollapsed).toHaveBeenCalledWith(true)
  })

  it('sets breadcrumbs when provided', () => {
    const breadcrumbs = [
      { label: '用户管理', href: '/users' },
      { label: '用户列表', isCurrentPage: true },
    ]

    renderWithProviders(
      <AdminLayout title="Test Page" breadcrumbs={breadcrumbs}>
        <div>Content</div>
      </AdminLayout>
    )

    expect(mockUIStore.setBreadcrumbs).toHaveBeenCalledWith(breadcrumbs)
  })

  it('renders custom actions', () => {
    const actions = <button data-testid="custom-action">Custom Action</button>

    renderWithProviders(
      <AdminLayout title="Test Page" actions={actions}>
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getByTestId('custom-action')).toBeInTheDocument()
  })

  it('has proper accessibility labels', () => {
    renderWithProviders(
      <AdminLayout title="Test Page">
        <div>Content</div>
      </AdminLayout>
    )

    expect(screen.getByLabelText('切换菜单')).toBeInTheDocument()
    expect(screen.getByLabelText('通知')).toBeInTheDocument()
    expect(screen.getByLabelText('切换到深色模式')).toBeInTheDocument()
  })
})