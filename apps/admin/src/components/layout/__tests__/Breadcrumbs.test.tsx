import { render, screen, fireEvent } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { Breadcrumbs } from '../Breadcrumbs'
import { system } from '../../../theme'
import { useUIStore } from '../../../stores/uiStore'

// Mock the UI store
vi.mock('../../../stores/uiStore')

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiChevronRight: () => <div data-testid="chevron-right-icon" />,
  FiHome: () => <div data-testid="home-icon" />,
}))

// Mock Chakra UI Breadcrumb components for v3
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react')
  return {
    ...actual,
    BreadcrumbRoot: ({ children }: any) => <nav role="navigation">{children}</nav>,
    BreadcrumbList: ({ children }: any) => <ol>{children}</ol>,
    BreadcrumbItem: ({ children }: any) => <li>{children}</li>,
    BreadcrumbLink: ({ children, href, onClick, ...props }: any) => (
      <a href={href} onClick={onClick} role="link" {...props}>{children}</a>
    ),
    BreadcrumbCurrentLink: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    BreadcrumbSeparator: ({ children }: any) => <span>{children}</span>,
  }
})

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {ui}
    </ChakraProvider>
  )
}

describe('Breadcrumbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when no breadcrumbs are provided', () => {
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: [],
    } as any)

    const { container } = renderWithProviders(<Breadcrumbs />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when breadcrumbs is null', () => {
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: null,
    } as any)

    const { container } = renderWithProviders(<Breadcrumbs />)
    expect(container.firstChild).toBeNull()
  })

  it('renders breadcrumbs when provided', () => {
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: [
        { label: '用户管理', href: '/users' },
        { label: '用户列表', isCurrentPage: true },
      ],
    } as any)

    renderWithProviders(<Breadcrumbs />)

    expect(screen.getByText('用户管理')).toBeInTheDocument()
    expect(screen.getByText('用户列表')).toBeInTheDocument()
  })

  it('adds home breadcrumb when first item is not home', () => {
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: [
        { label: '用户管理', href: '/users' },
        { label: '用户列表', isCurrentPage: true },
      ],
    } as any)

    renderWithProviders(<Breadcrumbs />)

    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByTestId('home-icon')).toBeInTheDocument()
  })

  it('renders clickable links for non-current pages', () => {
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: [
        { label: '用户管理', href: '/users' },
        { label: '用户列表', isCurrentPage: true },
      ],
    } as any)

    renderWithProviders(<Breadcrumbs />)

    const userManagementLink = screen.getByRole('link', { name: '用户管理' })
    expect(userManagementLink).toBeInTheDocument()
    expect(userManagementLink).toHaveAttribute('href', '/users')
  })

  it('renders plain text for current page', () => {
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: [
        { label: '用户管理', href: '/users' },
        { label: '用户列表', isCurrentPage: true },
      ],
    } as any)

    renderWithProviders(<Breadcrumbs />)

    const currentPageText = screen.getByText('用户列表')
    expect(currentPageText).toBeInTheDocument()
    expect(currentPageText.tagName).not.toBe('A') // Should not be a link
  })

  it('handles link clicks with preventDefault', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: [
        { label: '用户管理', href: '/users' },
        { label: '用户列表', isCurrentPage: true },
      ],
    } as any)

    renderWithProviders(<Breadcrumbs />)

    const userManagementLink = screen.getByRole('link', { name: '用户管理' })
    fireEvent.click(userManagementLink)

    expect(consoleSpy).toHaveBeenCalledWith('Navigate to: /users')
    
    consoleSpy.mockRestore()
  })

  it('renders separators between breadcrumb items', () => {
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: [
        { label: '用户管理', href: '/users' },
        { label: '用户列表', isCurrentPage: true },
      ],
    } as any)

    renderWithProviders(<Breadcrumbs />)

    const separators = screen.getAllByTestId('chevron-right-icon')
    expect(separators.length).toBeGreaterThan(0)
  })

  it('provides proper navigation structure', () => {
    vi.mocked(useUIStore).mockReturnValue({
      breadcrumbs: [
        { label: '用户管理', href: '/users' },
        { label: '用户列表', isCurrentPage: true },
      ],
    } as any)

    renderWithProviders(<Breadcrumbs />)

    // Breadcrumb navigation should be present
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })
})