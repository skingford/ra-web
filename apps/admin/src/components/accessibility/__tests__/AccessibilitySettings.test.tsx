import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from '../../../providers'
import { AccessibilityProvider } from '../../../contexts/AccessibilityContext'
import { AccessibilitySettings } from '../AccessibilitySettings'

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

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider>
      <AccessibilityProvider>
        {component}
      </AccessibilityProvider>
    </Provider>
  )
}

describe('AccessibilitySettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('renders accessibility settings form', () => {
    renderWithProvider(<AccessibilitySettings />)
    
    expect(screen.getByText('Accessibility Settings')).toBeInTheDocument()
    expect(screen.getByText('Visual Settings')).toBeInTheDocument()
    expect(screen.getByText('Navigation Settings')).toBeInTheDocument()
    expect(screen.getByText('Audio Settings')).toBeInTheDocument()
  })

  it('displays all accessibility options', () => {
    renderWithProvider(<AccessibilitySettings />)
    
    expect(screen.getByText('High Contrast Mode')).toBeInTheDocument()
    expect(screen.getByText('Reduced Motion')).toBeInTheDocument()
    expect(screen.getByText('Font Size')).toBeInTheDocument()
    expect(screen.getByText('Enhanced Focus Indicators')).toBeInTheDocument()
    expect(screen.getByText('Screen Reader Announcements')).toBeInTheDocument()
  })

  it('toggles high contrast mode', async () => {
    renderWithProvider(<AccessibilitySettings />)
    
    const highContrastSwitch = screen.getByLabelText('Toggle high contrast mode')
    expect(highContrastSwitch).not.toBeChecked()
    
    fireEvent.click(highContrastSwitch)
    
    await waitFor(() => {
      expect(highContrastSwitch).toBeChecked()
    })
  })

  it('changes font size', async () => {
    renderWithProvider(<AccessibilitySettings />)
    
    const fontSizeSelect = screen.getByRole('combobox')
    fireEvent.click(fontSizeSelect)
    
    const largeOption = screen.getByText('Large')
    fireEvent.click(largeOption)
    
    await waitFor(() => {
      expect(fontSizeSelect).toHaveValue('large')
    })
  })

  it('resets settings to defaults', async () => {
    renderWithProvider(<AccessibilitySettings />)
    
    // First change some settings
    const highContrastSwitch = screen.getByLabelText('Toggle high contrast mode')
    fireEvent.click(highContrastSwitch)
    
    await waitFor(() => {
      expect(highContrastSwitch).toBeChecked()
    })
    
    // Then reset
    const resetButton = screen.getByText('Reset to Defaults')
    fireEvent.click(resetButton)
    
    await waitFor(() => {
      expect(highContrastSwitch).not.toBeChecked()
    })
  })

  it('saves settings to localStorage', async () => {
    renderWithProvider(<AccessibilitySettings />)
    
    const highContrastSwitch = screen.getByLabelText('Toggle high contrast mode')
    fireEvent.click(highContrastSwitch)
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'accessibility-settings',
        expect.stringContaining('"highContrast":true')
      )
    })
  })

  it('applies system preferences detection', () => {
    // Mock system preferences
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    
    renderWithProvider(<AccessibilitySettings />)
    
    expect(screen.getByText('Reduced Motion Detected')).toBeInTheDocument()
  })

  it('has proper ARIA labels and roles', () => {
    renderWithProvider(<AccessibilitySettings />)
    
    expect(screen.getByLabelText('Toggle high contrast mode')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle reduced motion')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle enhanced focus indicators')).toBeInTheDocument()
    expect(screen.getByLabelText('Toggle screen reader announcements')).toBeInTheDocument()
  })
})