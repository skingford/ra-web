import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { Sidebar } from '../Sidebar'
import { system } from '../../../theme'
import { useAuthStore } from '../../../stores/authStore'

// Mock the auth store
vi.mock('../../../stores/authStore')

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiHome: () => <div data-testid="home-icon" />,
  FiUsers: () => <div data-testid="users-icon" />,
  FiSettings: () => <div data-testid="settings-icon" />,
  FiBarChart: () => <div data-testid="chart-icon" />,
  FiFileText: () => <div data-testid="file-icon" />,
  FiChevronDown: () => <div data-testid="chevron-down-icon" />,
  FiChevronRight: () => <div data-testid="chevron-right-icon" />,
  FiX: () => <div data-testid="close-icon" />,
}))

// Mock Chakra UI hooks
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    useDisclosure: () => ({
      isOpen: false,
      onToggle: vi.fn(),
    }),
    Collapse: ({ children, in: isOpen }: any) => isOpen ? <div>{children}</div> : null,
    Tooltip: ({ children }: any) => <div>{children}</div>,
  }
})

const mockAuthStore = {
  permissions: new Set(['users.read', 'system.settings']),
}

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {ui}
    </ChakraProvider>
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    vi.clearAllMocks()
  })

  it('renders sidebar with navigation items', () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText('RA Web 管理后台')).toBeInTheDocument()
    expect(screen.getByText('仪表板')).toBeInTheDocument()
    expect(screen.getByText('用户管理')).toBeInTheDocument()
    expect(screen.getByText('数据分析')).toBeInTheDocument()
    expect(screen.getByText('内容管理')).toBeInTheDocument()
    expect(screen.getByText('系统设置')).toBeInTheDocument()
  })

  it('renders collapsed sidebar correctly', () => {
    renderWithProviders(<Sidebar collapsed={true} />)

    expect(screen.getByText('RA')).toBeInTheDocument() // Collapsed logo
    expect(screen.queryByText('RA Web 管理后台')).not.toBeInTheDocument()
  })

  it('renders close button when onClose is provided', () => {
    const onClose = vi.fn()
    renderWithProviders(<Sidebar onClose={onClose} />)

    const closeButton = screen.getByLabelText('关闭菜单')
    expect(closeButton).toBeInTheDocument()

    fireEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('handles navigation item clicks', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    renderWithProviders(<Sidebar />)

    const dashboardItem = screen.getByText('仪表板')
    fireEvent.click(dashboardItem)

    expect(consoleSpy).toHaveBeenCalledWith('Navigate to: /dashboard')
    
    consoleSpy.mockRestore()
  })

  it('supports keyboard navigation', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    renderWithProviders(<Sidebar />)

    const dashboardItem = screen.getByText('仪表板')
    fireEvent.keyDown(dashboardItem, { key: 'Enter' })

    expect(consoleSpy).toHaveBeenCalledWith('Navigate to: /dashboard')
    
    consoleSpy.mockRestore()
  })

  it('shows items when user has required permissions', () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText('系统设置')).toBeInTheDocument()
  })

  it('hides items when user lacks required permissions', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      permissions: new Set(['users.read']), // Missing system.settings permission
    })

    renderWithProviders(<Sidebar />)

    expect(screen.queryByText('系统设置')).not.toBeInTheDocument()
  })

  it('has proper ARIA attributes', () => {
    renderWithProviders(<Sidebar />)

    const navigationItems = screen.getAllByRole('button')
    expect(navigationItems.length).toBeGreaterThan(0)

    // Each navigation item should be focusable
    navigationItems.forEach(item => {
      expect(item).toHaveAttribute('tabIndex', '0')
    })
  })
})