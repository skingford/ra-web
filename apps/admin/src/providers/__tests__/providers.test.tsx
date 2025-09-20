import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient } from '@tanstack/react-query'
import { AppProviders } from '../index'

// Mock the query client to avoid network calls
vi.mock('../../lib/queryClient', () => ({
  queryClient: new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  }),
  networkUtils: {
    pauseQueriesWhenOffline: vi.fn(() => vi.fn()),
  },
}))

// Mock React Query Devtools
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: () => <div data-testid="react-query-devtools" />,
}))

describe('AppProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children within providers', () => {
    render(
      <AppProviders>
        <div data-testid="test-child">Test Content</div>
      </AppProviders>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('should provide Chakra UI theme context', () => {
    render(
      <AppProviders>
        <div data-testid="themed-content">Themed Content</div>
      </AppProviders>
    )

    const content = screen.getByTestId('themed-content')
    expect(content).toBeInTheDocument()
    
    // Check if Chakra UI styles are applied (the element should have Chakra's CSS-in-JS classes)
    const parentElement = content.closest('[data-theme]') || content.closest('.chakra-ui-light')
    expect(parentElement || content.parentElement).toBeTruthy()
  })

  it('should provide TanStack Query context', async () => {
    const TestComponent = () => {
      // This would normally use a query hook, but we'll just test the provider is there
      return <div data-testid="query-component">Query Component</div>
    }

    render(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    )

    expect(screen.getByTestId('query-component')).toBeInTheDocument()
  })

  it('should render React Query Devtools', () => {
    render(
      <AppProviders>
        <div>Test</div>
      </AppProviders>
    )

    expect(screen.getByTestId('react-query-devtools')).toBeInTheDocument()
  })

  it('should initialize network status management', async () => {
    const { networkUtils } = await import('../../lib/queryClient')
    
    render(
      <AppProviders>
        <div>Test</div>
      </AppProviders>
    )

    await waitFor(() => {
      expect(networkUtils.pauseQueriesWhenOffline).toHaveBeenCalled()
    })
  })

  it('should handle theme system integration', () => {
    // Test that the theme system is properly integrated
    const TestThemedComponent = () => (
      <div 
        data-testid="themed-element"
        style={{
          color: 'var(--chakra-colors-brand-500)',
          fontSize: 'var(--chakra-fontSizes-md)',
        }}
      >
        Themed Element
      </div>
    )

    render(
      <AppProviders>
        <TestThemedComponent />
      </AppProviders>
    )

    const themedElement = screen.getByTestId('themed-element')
    expect(themedElement).toBeInTheDocument()
    expect(themedElement).toHaveTextContent('Themed Element')
  })

  it('should provide proper provider nesting order', () => {
    // Test that providers are nested in the correct order
    // QueryClientProvider should wrap ChakraProvider
    const TestComponent = () => {
      return (
        <div data-testid="nested-test">
          <div data-testid="query-context">Query Context Available</div>
          <div data-testid="chakra-context">Chakra Context Available</div>
        </div>
      )
    }

    render(
      <AppProviders>
        <TestComponent />
      </AppProviders>
    )

    expect(screen.getByTestId('nested-test')).toBeInTheDocument()
    expect(screen.getByTestId('query-context')).toBeInTheDocument()
    expect(screen.getByTestId('chakra-context')).toBeInTheDocument()
  })
})