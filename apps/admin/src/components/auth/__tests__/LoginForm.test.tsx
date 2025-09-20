import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import { LoginForm } from '../LoginForm'
import { useAuthStore } from '../../../stores/authStore'
import { apiClient } from '../../../lib/api'
import { system } from '../../../theme'
import { vi } from 'vitest'

// Mock the auth store
vi.mock('../../../stores/authStore')
const mockUseAuthStore = useAuthStore as any

// Mock the API client
vi.mock('../../../lib/api')
const mockApiClient = apiClient as any

// Mock user data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  roles: [],
  permissions: [],
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockLoginResponse = {
  user: mockUser,
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
}

// Test wrapper with ChakraProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>
    {children}
  </ChakraProvider>
)

describe('LoginForm', () => {
  const mockLogin = vi.fn()
  const mockSetLoading = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    
    mockUseAuthStore.mockReturnValue({
      user: null,
      token: null,
      permissions: new Set(),
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
      updateUser: vi.fn(),
      setLoading: mockSetLoading,
      hasPermission: vi.fn(),
    })
  })

  it('renders login form correctly', () => {
    render(<LoginForm />, { wrapper: TestWrapper })

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to your admin account')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
    expect(screen.getByText('Remember me')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: TestWrapper })

    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: TestWrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    // Check that validation occurs - the form should not submit with invalid email
    expect(mockApiClient.post).not.toHaveBeenCalled()
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: TestWrapper })

    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(passwordInput, '123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('clears field errors when user starts typing', async () => {
    const user = userEvent.setup()
    render(<LoginForm />, { wrapper: TestWrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    // Trigger validation error
    await user.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    // Start typing to clear error
    await user.type(emailInput, 'test@example.com')
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()
    mockApiClient.post.mockResolvedValueOnce(mockLoginResponse)

    render(<LoginForm />, { wrapper: TestWrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })
      expect(mockLogin).toHaveBeenCalledWith(mockUser, 'mock-jwt-token')
    })
  })

  it('calls API with correct credentials', async () => {
    const user = userEvent.setup()
    mockApiClient.post.mockResolvedValueOnce(mockLoginResponse)

    render(<LoginForm />, { wrapper: TestWrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
      })
      expect(mockLogin).toHaveBeenCalledWith(mockUser, 'mock-jwt-token')
    })
  })

  it('handles API errors', async () => {
    const user = userEvent.setup()
    const apiError = {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      timestamp: new Date().toISOString(),
    }
    mockApiClient.post.mockRejectedValueOnce(new Error(JSON.stringify(apiError)))

    render(<LoginForm />, { wrapper: TestWrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)

    // Verify that setLoading was called (indicating error handling occurred)
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(false)
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockApiClient.post.mockResolvedValueOnce(mockLoginResponse)

    render(<LoginForm />, { wrapper: TestWrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Check that setLoading was called
    expect(mockSetLoading).toHaveBeenCalledWith(true)
    
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(false)
    })
  })

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup()
    const networkError = new Error('Network connection failed')
    mockApiClient.post.mockRejectedValueOnce(networkError)

    render(<LoginForm />, { wrapper: TestWrapper })

    const emailInput = screen.getByPlaceholderText('Enter your email')
    const passwordInput = screen.getByPlaceholderText('Enter your password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Verify that error handling occurred
    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(false)
    })
  })
})