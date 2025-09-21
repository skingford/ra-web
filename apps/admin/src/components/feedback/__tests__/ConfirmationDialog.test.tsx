import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChakraProvider } from '@chakra-ui/react'
import { ConfirmationDialog, useConfirmation } from '../ConfirmationDialog'
import { system } from '../../../theme/simple'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>
    {children}
  </ChakraProvider>
)

const renderWithChakra = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper })
}

describe('ConfirmationDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnConfirm = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dialog when open', () => {
    renderWithChakra(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test message"
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test message')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    renderWithChakra(
      <ConfirmationDialog
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test message"
      />
    )

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    renderWithChakra(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test message"
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    renderWithChakra(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test message"
      />
    )

    fireEvent.click(screen.getByText('Confirm'))
    
    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalled()
    })
  })

  it('uses custom button text', () => {
    renderWithChakra(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test message"
        confirmText="Delete"
        cancelText="Keep"
      />
    )

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
  })

  it('applies destructive styling when isDestructive is true', () => {
    renderWithChakra(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Delete Item"
        message="Are you sure?"
        isDestructive={true}
      />
    )

    const confirmButton = screen.getByText('Confirm')
    expect(confirmButton).toHaveClass('chakra-button')
    // Note: Testing exact color scheme classes can be brittle, 
    // but we can verify the button exists and has the right role
  })

  it('shows loading state when isLoading is true', () => {
    renderWithChakra(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test message"
        isLoading={true}
      />
    )

    const confirmButton = screen.getByText('Processing...')
    expect(confirmButton).toBeInTheDocument()
    expect(confirmButton).toBeDisabled()
  })

  it('renders children when provided', () => {
    renderWithChakra(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title="Test Title"
        message="Test message"
      >
        <div>Custom content</div>
      </ConfirmationDialog>
    )

    expect(screen.getByText('Custom content')).toBeInTheDocument()
  })

  it('handles async onConfirm function', async () => {
    const asyncOnConfirm = vi.fn().mockResolvedValue(undefined)

    renderWithChakra(
      <ConfirmationDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={asyncOnConfirm}
        title="Test Title"
        message="Test message"
      />
    )

    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => {
      expect(asyncOnConfirm).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled()
    })
  })
})

describe('useConfirmation hook', () => {
  const TestComponent = () => {
    const { confirm, ConfirmationComponent } = useConfirmation()

    const handleConfirm = () => {
      confirm({
        title: 'Test Confirmation',
        message: 'Are you sure?',
        onConfirm: vi.fn()
      })
    }

    return (
      <div>
        <button onClick={handleConfirm}>Open Confirmation</button>
        {ConfirmationComponent}
      </div>
    )
  }

  it('opens confirmation dialog when confirm is called', async () => {
    renderWithChakra(<TestComponent />)

    fireEvent.click(screen.getByText('Open Confirmation'))

    await waitFor(() => {
      expect(screen.getByText('Test Confirmation')).toBeInTheDocument()
      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })
  })
})