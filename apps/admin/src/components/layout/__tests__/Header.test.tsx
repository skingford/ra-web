import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { Header } from '../Header'
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
}))

// Mock useColorMode and Menu components
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    useColorMode: () => ({
      colorMode: 'light',
      toggleColorMode: vi.fn(),
    }),
    MenuRoot: ({ children }: any) => <div>{children}</div>,
    MenuTrigger: ({ children }: any) => <div>{children}</div>,
    MenuContent: ({ children }: any) => <div>{children}</div>,
    MenuItem: ({ children }: any) => <div>{children}</div>,
    MenuSeparator: () => <hr />,
  }
})

const mockUIStore = {
  notifications: [
    {
      id: '1',
      title: '新消息',
      message: '您有一条新的系统通知',
      type: 'info' as const,
      timestamp: new Date('2024-01-01T10:00:00Z'),
      read: false,
    },
    {
      id: '2',
      title: '系统更新',
      message: '系统将在今晚进行维护',
      type: 'warning' as const,
      timestamp: new Date('2024-01-01T09:00:00Z'),
      read: true,
    },
  ],
  theme: 'light' as const,
  toggleTheme: vi.fn(),
}

const mockAuthStore = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    roles: [],
    permissions: [],
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  logout: vi.fn(),
}

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {ui}
    </ChakraProvider>
  )
}

describe('Header', () => {
  const mockOnMenuClick = vi.fn()

  beforeEach(() => {
    vi.mocked(useUIStore).mockReturnValue(mockUIStore)
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    vi.clearAllMocks()
  })

  it('renders header with title', () => {
    renderWithProviders(
      <Header title="Test Page" onMenuClick={mockOnMenuClick} />
    )

    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('calls onMenuClick when menu button is clicked', () => {
    renderWithProviders(
      <Header title="Test Page" onMenuClick={mockOnMenuClick} />
    )

    const menuButton = screen.getByLabelText('切换菜单')
    fireEvent.click(menuButton)

    expect(mockOnMenuClick).toHaveBeenCalled()
  })

  it('renders theme toggle button', () => {
    renderWithProviders(
      <Header title="Test Page" onMenuClick={mockOnMenuClick} />
    )

    expect(screen.getByLabelText('切换到深色模式')).toBeInTheDocument()
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
  })

  it('displays notification count badge', () => {
    renderWithProviders(
      <Header title="Test Page" onMenuClick={mockOnMenuClick} />
    )

    expect(screen.getByText('1')).toBeInTheDocument() // 1 unread notification
  })

  it('displays user information', () => {
    renderWithProviders(
      <Header title="Test Page" onMenuClick={mockOnMenuClick} />
    )

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('handles missing user gracefully', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      ...mockAuthStore,
      user: null,
    })

    renderWithProviders(
      <Header title="Test Page" onMenuClick={mockOnMenuClick} />
    )

    expect(screen.getByText('未登录')).toBeInTheDocument()
  })

  it('has proper ARIA labels', () => {
    renderWithProviders(
      <Header title="Test Page" onMenuClick={mockOnMenuClick} />
    )

    expect(screen.getByLabelText('切换菜单')).toBeInTheDocument()
    expect(screen.getByLabelText('通知')).toBeInTheDocument()
    expect(screen.getByLabelText('切换到深色模式')).toBeInTheDocument()
  })
})