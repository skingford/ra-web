import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChakraProvider } from '@chakra-ui/react'
import { ToastNotification } from '../ToastNotification'
import { Notification } from '../../../stores/notificationStore'
import { system } from '../../../theme/simple'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>
    {children}
  </ChakraProvider>
)

const renderWithChakra = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper })
}

const mockNotification: Notification = {
  id: 'test-1',
  message: 'Test notification message',
  type: 'info',
  duration: 5000,
  isClosable: true,
  createdAt: new Date()
}

describe('ToastNotification', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notification message', () => {
    renderWithChakra(
      <ToastNotification
        notification={mockNotification}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Test notification message')).toBeInTheDocument()
  })

  it('renders notification title when provided', () => {
    const notificationWithTitle = {
      ...mockNotification,
      title: 'Test Title'
    }

    renderWithChakra(
      <ToastNotification
        notification={notificationWithTitle}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test notification message')).toBeInTheDocument()
  })

  it('renders close button when closable', () => {
    renderWithChakra(
      <ToastNotification
        notification={mockNotification}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByRole('button')
    expect(closeButton).toBeInTheDocument()
  })

  it('does not render close button when not closable', () => {
    const nonClosableNotification = {
      ...mockNotification,
      isClosable: false
    }

    renderWithChakra(
      <ToastNotification
        notification={nonClosableNotification}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    renderWithChakra(
      <ToastNotification
        notification={mockNotification}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('test-1')
    })
  })

  it('renders action button when provided', () => {
    const mockActionClick = vi.fn()
    const notificationWithAction = {
      ...mockNotification,
      action: {
        label: 'Undo',
        onClick: mockActionClick
      }
    }

    renderWithChakra(
      <ToastNotification
        notification={notificationWithAction}
        onClose={mockOnClose}
      />
    )

    const actionButton = screen.getByText('Undo')
    expect(actionButton).toBeInTheDocument()

    fireEvent.click(actionButton)
    expect(mockActionClick).toHaveBeenCalled()
  })

  it('applies correct status styling for different types', () => {
    const successNotification = {
      ...mockNotification,
      type: 'success' as const
    }

    renderWithChakra(
      <ToastNotification
        notification={successNotification}
        onClose={mockOnClose}
      />
    )

    // Check if the alert has the success status
    const alert = screen.getByRole('alert')
    expect(alert).toHaveAttribute('data-status', 'success')
  })

  it('shows progress bar when showProgress is true and duration is set', () => {
    renderWithChakra(
      <ToastNotification
        notification={mockNotification}
        onClose={mockOnClose}
        showProgress={true}
      />
    )

    // Progress bar should be present (though testing the animation is complex)
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toBeInTheDocument()
  })

  it('does not show progress bar when showProgress is false', () => {
    renderWithChakra(
      <ToastNotification
        notification={mockNotification}
        onClose={mockOnClose}
        showProgress={false}
      />
    )

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('does not show progress bar when duration is 0', () => {
    const noDurationNotification = {
      ...mockNotification,
      duration: 0
    }

    renderWithChakra(
      <ToastNotification
        notification={noDurationNotification}
        onClose={mockOnClose}
        showProgress={true}
      />
    )

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})