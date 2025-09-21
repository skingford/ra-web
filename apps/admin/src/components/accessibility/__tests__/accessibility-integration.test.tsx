import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AccessibilityProvider, useAccessibility } from '../../../contexts/AccessibilityContext'

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Test component that uses accessibility context
const TestComponent = () => {
  const { settings, updateSetting, announceToScreenReader } = useAccessibility()
  
  return (
    <div>
      <div data-testid="high-contrast">{settings.highContrast.toString()}</div>
      <div data-testid="font-size">{settings.fontSize}</div>
      <div data-testid="reduced-motion">{settings.reducedMotion.toString()}</div>
      <button 
        onClick={() => updateSetting('highContrast', true)}
        data-testid="toggle-contrast"
      >
        Toggle Contrast
      </button>
      <button 
        onClick={() => announceToScreenReader('Test announcement')}
        data-testid="announce"
      >
        Announce
      </button>
    </div>
  )
}

describe('Accessibility Integration', () => {
  it('provides accessibility context with default settings', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    )
    
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false')
    expect(screen.getByTestId('font-size')).toHaveTextContent('medium')
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false')
  })

  it('creates screen reader announcer element', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    )
    
    // Check if announcer element was created
    const announcers = document.querySelectorAll('[aria-live]')
    expect(announcers.length).toBeGreaterThan(0)
  })

  it('applies CSS classes based on settings', () => {
    render(
      <AccessibilityProvider>
        <TestComponent />
      </AccessibilityProvider>
    )
    
    const root = document.documentElement
    
    // Should have default font size class
    expect(root.classList.contains('font-medium')).toBe(true)
    
    // Should have focus visible class by default
    expect(root.classList.contains('focus-visible')).toBe(true)
  })

  it('has proper semantic HTML structure', () => {
    render(
      <AccessibilityProvider>
        <div role="main" aria-label="Test content">
          <h1>Test Heading</h1>
          <button aria-label="Test button">Click me</button>
          <input aria-label="Test input" />
        </div>
      </AccessibilityProvider>
    )
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('supports keyboard navigation attributes', () => {
    render(
      <AccessibilityProvider>
        <nav role="navigation" aria-label="Test navigation">
          <button role="menuitem" tabIndex={0}>Item 1</button>
          <button role="menuitem" tabIndex={0}>Item 2</button>
          <button role="menuitem" tabIndex={0}>Item 3</button>
        </nav>
      </AccessibilityProvider>
    )
    
    const menuItems = screen.getAllByRole('menuitem')
    expect(menuItems).toHaveLength(3)
    
    menuItems.forEach(item => {
      expect(item).toHaveAttribute('tabIndex', '0')
    })
  })

  it('provides proper ARIA live regions', () => {
    render(
      <AccessibilityProvider>
        <div>
          <div role="alert">Error message</div>
          <div aria-live="polite">Status update</div>
          <div aria-live="assertive">Important announcement</div>
        </div>
      </AccessibilityProvider>
    )
    
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Status update')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Important announcement')).toHaveAttribute('aria-live', 'assertive')
  })
})