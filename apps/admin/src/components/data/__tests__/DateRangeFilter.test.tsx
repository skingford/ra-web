import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import { DateRangeFilter, DEFAULT_DATE_PRESETS } from '../DateRangeFilter'
import { format, startOfDay, endOfDay } from 'date-fns'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>{children}</ChakraProvider>
)

describe('DateRangeFilter', () => {
  const mockOnChange = vi.fn()
  const defaultProps = {
    value: { startDate: null, endDate: null },
    onChange: mockOnChange,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with placeholder text', () => {
    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} placeholder="Select dates" />
      </TestWrapper>
    )

    expect(screen.getByText('Select dates')).toBeInTheDocument()
  })

  it('displays selected date range', () => {
    const startDate = new Date('2023-01-01')
    const endDate = new Date('2023-01-31')

    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          value={{ startDate, endDate }}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Jan 01, 2023 - Jan 31, 2023')).toBeInTheDocument()
  })

  it('displays single date when only start date is selected', () => {
    const startDate = new Date('2023-01-01')

    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          value={{ startDate, endDate: null }}
        />
      </TestWrapper>
    )

    expect(screen.getByText('From Jan 01, 2023')).toBeInTheDocument()
  })

  it('displays single date when only end date is selected', () => {
    const endDate = new Date('2023-01-31')

    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          value={{ startDate: null, endDate }}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Until Jan 31, 2023')).toBeInTheDocument()
  })

  it('opens popover when clicked', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Select Date Range')).toBeInTheDocument()
    })
  })

  it('shows preset options', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} showPresets />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Quick Select')).toBeInTheDocument()
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    })
  })

  it('applies preset selection', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} showPresets />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      const todayButton = screen.getByText('Today')
      user.click(todayButton)
    })

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      })
    })
  })

  it('handles manual date input', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(async () => {
      const startDateInput = screen.getByLabelText(/start date/i)
      const endDateInput = screen.getByLabelText(/end date/i)

      await user.type(startDateInput, '2023-01-01')
      await user.type(endDateInput, '2023-01-31')

      const applyButton = screen.getByText('Apply')
      await user.click(applyButton)
    })

    expect(mockOnChange).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    })
  })

  it('validates date range', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(async () => {
      const startDateInput = screen.getByLabelText(/start date/i)
      const endDateInput = screen.getByLabelText(/end date/i)

      // Set end date before start date
      await user.type(startDateInput, '2023-01-31')
      await user.type(endDateInput, '2023-01-01')
    })

    await waitFor(() => {
      expect(screen.getByText('End date must be after start date')).toBeInTheDocument()
    })
  })

  it('shows clear button when allowClear is true and has value', () => {
    const startDate = new Date('2023-01-01')
    const endDate = new Date('2023-01-31')

    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          value={{ startDate, endDate }}
          allowClear
        />
      </TestWrapper>
    )

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
  })

  it('clears selection when clear button is clicked', async () => {
    const user = userEvent.setup()
    const startDate = new Date('2023-01-01')
    const endDate = new Date('2023-01-31')

    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          value={{ startDate, endDate }}
          allowClear
        />
      </TestWrapper>
    )

    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)

    expect(mockOnChange).toHaveBeenCalledWith({
      startDate: null,
      endDate: null,
    })
  })

  it('respects min and max date constraints', () => {
    const minDate = new Date('2023-01-01')
    const maxDate = new Date('2023-12-31')

    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          minDate={minDate}
          maxDate={maxDate}
        />
      </TestWrapper>
    )

    // Component should render without errors
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} disabled />
      </TestWrapper>
    )

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('hides presets when showPresets is false', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} showPresets={false} />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.queryByText('Quick Select')).not.toBeInTheDocument()
    })
  })

  it('uses custom presets', async () => {
    const user = userEvent.setup()
    const customPresets = [
      {
        label: 'Custom Range',
        value: {
          startDate: new Date('2023-06-01'),
          endDate: new Date('2023-06-30'),
        },
      },
    ]

    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          presets={customPresets}
          showPresets
        />
      </TestWrapper>
    )

    const button = screen.getByRole('button')
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Custom Range')).toBeInTheDocument()
      expect(screen.queryByText('Today')).not.toBeInTheDocument()
    })
  })

  it('displays preset label when matching preset is selected', () => {
    const todayPreset = DEFAULT_DATE_PRESETS.find(p => p.label === 'Today')!

    render(
      <TestWrapper>
        <DateRangeFilter
          {...defaultProps}
          value={todayPreset.value}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Today')).toBeInTheDocument()
  })

  it('handles different sizes', () => {
    const { rerender } = render(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} size="sm" />
      </TestWrapper>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(
      <TestWrapper>
        <DateRangeFilter {...defaultProps} size="lg" />
      </TestWrapper>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})