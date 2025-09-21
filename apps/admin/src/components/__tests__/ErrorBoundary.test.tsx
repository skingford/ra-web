import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ChakraProvider } from '@chakra-ui/react'
import { ErrorBoundary } from '../ErrorBoundary'
import { WidgetErrorBoundary } from '../WidgetErrorBoundary'
import { withErrorBoundary } from '../withErrorBoundary'
import { system } from '../../theme/simple'

// Test wrapper with ChakraProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>
    {children}
  </ChakraProvider>
)

// Custom render function
const renderWithChakra = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper })
}

// Mock console.error to avoid noise in tests
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalError
})

// Test component that throws an error
const ThrowError = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message)
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    renderWithChakra(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders global error fallback when error occurs', () => {
    renderWithChakra(
      <ErrorBoundary level="global">
        <ThrowError shouldThrow={true} message="Global test error" />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Application Error')).toBeInTheDocument()
    expect(screen.getByText('Global test error')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('renders route error fallback when error occurs', () => {
    renderWithChakra(
      <ErrorBoundary level="route">
        <ThrowError shouldThrow={true} message="Route test error" />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Page Error')).toBeInTheDocument()
    expect(screen.getByText('Route test error')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('renders component error fallback when error occurs', () => {
    renderWithChakra(
      <ErrorBoundary level="component">
        <ThrowError shouldThrow={true} message="Component test error" />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Component Error')).toBeInTheDocument()
    expect(screen.getByText('Component test error')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn()
    
    renderWithChakra(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} message="Callback test error" />
      </ErrorBoundary>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Callback test error' }),
      expect.any(Object)
    )
  })

  it('resets error when resetError is called', () => {
    const { rerender } = renderWithChakra(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Application Error')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)
    
    rerender(
      <TestWrapper>
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestWrapper>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('resets error when resetKeys change', () => {
    const { rerender } = renderWithChakra(
      <ErrorBoundary resetKeys={['key1']}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Application Error')).toBeInTheDocument()
    
    rerender(
      <TestWrapper>
        <ErrorBoundary resetKeys={['key2']}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      </TestWrapper>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('uses custom fallback component when provided', () => {
    const CustomFallback = ({ error, resetError }) => (
      <div>
        <span>Custom Error: {error.message}</span>
        <button onClick={resetError}>Custom Reset</button>
      </div>
    )
    
    renderWithChakra(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} message="Custom fallback test" />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom Error: Custom fallback test')).toBeInTheDocument()
    expect(screen.getByText('Custom Reset')).toBeInTheDocument()
  })
})

describe('WidgetErrorBoundary', () => {
  it('renders children when there is no error', () => {
    renderWithChakra(
      <WidgetErrorBoundary widgetName="Test Widget">
        <div>Widget content</div>
      </WidgetErrorBoundary>
    )
    
    expect(screen.getByText('Widget content')).toBeInTheDocument()
  })

  it('renders component-level error when widget fails', () => {
    renderWithChakra(
      <WidgetErrorBoundary widgetName="Test Widget">
        <ThrowError shouldThrow={true} message="Widget error" />
      </WidgetErrorBoundary>
    )
    
    expect(screen.getByText('Component Error')).toBeInTheDocument()
    expect(screen.getByText('Widget error')).toBeInTheDocument()
  })

  it('calls onError with widget name context', () => {
    const consoleSpy = vi.spyOn(console, 'error')
    
    renderWithChakra(
      <WidgetErrorBoundary widgetName="Analytics Widget">
        <ThrowError shouldThrow={true} message="Analytics error" />
      </WidgetErrorBoundary>
    )
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Widget error in Analytics Widget'),
      expect.any(Error),
      expect.any(Object)
    )
  })
})

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = ({ shouldThrow }) => (
      <ThrowError shouldThrow={shouldThrow} message="HOC test error" />
    )
    
    const WrappedComponent = withErrorBoundary(TestComponent, { level: 'component' })
    
    renderWithChakra(<WrappedComponent shouldThrow={false} />)
    expect(screen.getByText('No error')).toBeInTheDocument()
    
    const { rerender } = renderWithChakra(<WrappedComponent shouldThrow={true} />)
    expect(screen.getByText('Component Error')).toBeInTheDocument()
  })

  it('forwards refs correctly', () => {
    const TestComponent = React.forwardRef<HTMLDivElement, { children: React.ReactNode }>(
      ({ children }, ref) => <div ref={ref}>{children}</div>
    )
    
    const WrappedComponent = withErrorBoundary(TestComponent)
    const ref = React.createRef<HTMLDivElement>()
    
    renderWithChakra(
      <WrappedComponent ref={ref}>
        <span>Ref test</span>
      </WrappedComponent>
    )
    
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByText('Ref test')).toBeInTheDocument()
  })

  it('sets correct display name', () => {
    const TestComponent = () => <div>Test</div>
    TestComponent.displayName = 'TestComponent'
    
    const WrappedComponent = withErrorBoundary(TestComponent)
    
    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)')
  })
})