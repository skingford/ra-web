import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '../../../theme'
import { FormBuilder, FormSchema, createFormSchema, fieldPresets } from '../FormBuilder'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider value={system}>{children}</ChakraProvider>
)

const renderFormBuilder = (props: Partial<React.ComponentProps<typeof FormBuilder>> = {}) => {
  const defaultSchema: FormSchema = {
    title: 'Test Form',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true,
      },
    ],
  }

  const defaultProps = {
    schema: defaultSchema,
    onSubmit: vi.fn(),
    ...props,
  }

  return render(
    <TestWrapper>
      <FormBuilder {...defaultProps} />
    </TestWrapper>
  )
}

describe('FormBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders form with title and fields', () => {
      renderFormBuilder()
      
      expect(screen.getByText('Test Form')).toBeInTheDocument()
      expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Submit/ })).toBeInTheDocument()
    })

    it('renders form description when provided', () => {
      const schema: FormSchema = {
        title: 'Test Form',
        description: 'This is a test form description',
        fields: [],
      }

      renderFormBuilder({ schema })
      
      expect(screen.getByText('This is a test form description')).toBeInTheDocument()
    })

    it('renders required field indicators', () => {
      renderFormBuilder()
      
      // Required fields should have asterisk
      const nameLabel = screen.getByText('Name')
      expect(nameLabel.parentElement).toHaveTextContent('*')
    })
  })

  describe('Field Types', () => {
    it('renders text input fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'firstName',
            type: 'text',
            label: 'First Name',
            placeholder: 'Enter your first name',
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const input = screen.getByPlaceholderText('Enter your first name')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('renders email input fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const input = screen.getByLabelText('Email Address')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('renders password input fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'password',
            type: 'password',
            label: 'Password',
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('renders number input fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'age',
            type: 'number',
            label: 'Age',
            validation: { min: 0, max: 150 },
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const input = screen.getByLabelText('Age')
      expect(input).toHaveAttribute('type', 'number')
      expect(input).toHaveAttribute('min', '0')
      expect(input).toHaveAttribute('max', '150')
    })

    it('renders textarea fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'description',
            type: 'textarea',
            label: 'Description',
            placeholder: 'Enter description',
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const textarea = screen.getByPlaceholderText('Enter description')
      expect(textarea.tagName).toBe('TEXTAREA')
    })

    it('renders select fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'country',
            type: 'select',
            label: 'Country',
            options: [
              { label: 'United States', value: 'us' },
              { label: 'Canada', value: 'ca' },
              { label: 'United Kingdom', value: 'uk' },
            ],
          },
        ],
      }

      renderFormBuilder({ schema })
      
      expect(screen.getByText('Country')).toBeInTheDocument()
      // Select component should be present
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders checkbox fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'terms',
            type: 'checkbox',
            label: 'I agree to the terms',
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(screen.getByText('I agree to the terms')).toBeInTheDocument()
    })

    it('renders switch fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'notifications',
            type: 'switch',
            label: 'Enable Notifications',
          },
        ],
      }

      renderFormBuilder({ schema })
      
      expect(screen.getByText('Enable Notifications')).toBeInTheDocument()
      // Switch should be rendered as a checkbox input
      const switchElement = document.querySelector('input[type="checkbox"]')
      expect(switchElement).toBeInTheDocument()
    })

    it('renders file input fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'avatar',
            type: 'file',
            label: 'Profile Picture',
            accept: 'image/*',
            maxSize: 5 * 1024 * 1024, // 5MB
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const fileInput = document.getElementById('avatar')
      expect(fileInput).toHaveAttribute('type', 'file')
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    it('renders hidden fields', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'userId',
            type: 'hidden',
            defaultValue: '123',
          },
          {
            id: 'name',
            type: 'text',
            label: 'Name',
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const hiddenInput = document.querySelector('input[type="hidden"]')
      expect(hiddenInput).toBeInTheDocument()
      expect(hiddenInput).toHaveValue('123')
    })
  })

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const onSubmit = vi.fn()
      
      renderFormBuilder({ onSubmit })
      
      const submitButton = screen.getByRole('button', { name: /Submit/ })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByText('This field is required')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
      
      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      
      const schema: FormSchema = {
        fields: [
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            required: true,
            validation: {
              email: 'Please enter a valid email address',
            },
          },
        ],
      }
      
      renderFormBuilder({ schema })
      
      const emailInput = screen.getByLabelText(/Email/)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /Submit/ })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
      })
    })

    it('validates custom validation rules', async () => {
      const user = userEvent.setup()
      
      const schema: FormSchema = {
        fields: [
          {
            id: 'username',
            type: 'text',
            label: 'Username',
            validation: {
              custom: (value) => {
                if (value && value.includes('admin')) {
                  return 'Username cannot contain "admin"'
                }
                return null
              },
            },
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const usernameInput = screen.getByLabelText('Username')
      await user.type(usernameInput, 'admin-user')
      
      const submitButton = screen.getByRole('button', { name: /Submit/ })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Username cannot contain "admin"')).toBeInTheDocument()
      })
    })
  })

  describe('Conditional Fields', () => {
    it('shows/hides fields based on conditions', async () => {
      const user = userEvent.setup()
      
      const schema: FormSchema = {
        fields: [
          {
            id: 'hasAccount',
            type: 'checkbox',
            label: 'I have an existing account',
          },
          {
            id: 'password',
            type: 'password',
            label: 'Password',
            showWhen: {
              field: 'hasAccount',
              value: true,
            },
          },
        ],
      }

      renderFormBuilder({ schema })
      
      // Password field should not be visible initially
      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
      
      // Check the checkbox
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      // Password field should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
      })
    })

    it('supports different conditional operators', async () => {
      const user = userEvent.setup()
      
      const schema: FormSchema = {
        fields: [
          {
            id: 'age',
            type: 'number',
            label: 'Age',
          },
          {
            id: 'parentConsent',
            type: 'checkbox',
            label: 'Parent consent required',
            showWhen: {
              field: 'age',
              value: 18,
              operator: 'less_than',
            },
          },
        ],
      }

      renderFormBuilder({ schema })
      
      const ageInput = screen.getByLabelText('Age')
      
      // Enter age less than 18
      await user.clear(ageInput)
      await user.type(ageInput, '16')
      
      await waitFor(() => {
        expect(screen.getByLabelText('Parent consent required')).toBeInTheDocument()
      })
      
      // Enter age 18 or greater
      await user.clear(ageInput)
      await user.type(ageInput, '20')
      
      await waitFor(() => {
        expect(screen.queryByLabelText('Parent consent required')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      
      renderFormBuilder({ onSubmit })
      
      // Fill in the form
      const nameInput = document.getElementById('name') as HTMLInputElement
      const emailInput = document.getElementById('email') as HTMLInputElement
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      
      // Submit the form
      const submitButton = screen.getByRole('button', { name: /Submit/ })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
        })
      })
    })

    it('handles async submission', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      
      renderFormBuilder({ onSubmit })
      
      const nameInput = document.getElementById('name') as HTMLInputElement
      const emailInput = document.getElementById('email') as HTMLInputElement
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      
      const submitButton = screen.getByRole('button', { name: /Submit/ })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Form Reset', () => {
    it('resets form to initial values', async () => {
      const user = userEvent.setup()
      const onReset = vi.fn()
      
      renderFormBuilder({ onReset })
      
      const nameInput = document.getElementById('name') as HTMLInputElement
      const emailInput = document.getElementById('email') as HTMLInputElement
      
      // Fill in the form
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      
      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
      
      // Reset the form
      const resetButton = screen.getByRole('button', { name: /Reset/ })
      fireEvent.click(resetButton)
      
      expect(nameInput).toHaveValue('')
      expect(emailInput).toHaveValue('')
      expect(onReset).toHaveBeenCalled()
    })

    it('can hide reset button', () => {
      const schema: FormSchema = {
        fields: [],
        showReset: false,
      }

      renderFormBuilder({ schema })
      
      expect(screen.queryByRole('button', { name: /Reset/ })).not.toBeInTheDocument()
    })
  })

  describe('Initial Values', () => {
    it('populates form with initial values', () => {
      const initialValues = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      }

      renderFormBuilder({ initialValues })
      
      expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument()
    })

    it('uses default values from schema', () => {
      const schema: FormSchema = {
        fields: [
          {
            id: 'country',
            type: 'text',
            label: 'Country',
            defaultValue: 'United States',
          },
        ],
      }

      renderFormBuilder({ schema })
      
      expect(screen.getByDisplayValue('United States')).toBeInTheDocument()
    })
  })

  describe('Field Presets', () => {
    it('provides common field presets', () => {
      const emailField = fieldPresets.email('userEmail', 'Email Address')
      const passwordField = fieldPresets.password('userPassword')
      const nameField = fieldPresets.name('fullName')
      
      expect(emailField).toEqual({
        id: 'userEmail',
        type: 'email',
        label: 'Email Address',
        required: true,
        validation: {
          required: true,
          email: true,
        },
      })
      
      expect(passwordField.validation?.minLength).toBe(8)
      expect(nameField.validation?.minLength).toBe(2)
    })
  })

  describe('Layout Options', () => {
    it('renders grid layout', () => {
      const schema: FormSchema = {
        layout: 'grid',
        columns: 2,
        fields: [
          { id: 'firstName', type: 'text', label: 'First Name' },
          { id: 'lastName', type: 'text', label: 'Last Name' },
        ],
      }

      const { container } = renderFormBuilder({ schema })
      
      const gridContainer = container.querySelector('[style*="grid-template-columns: repeat(2, 1fr)"]')
      expect(gridContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('associates labels with form controls', () => {
      renderFormBuilder()
      
      const nameInput = document.getElementById('name')
      const emailInput = document.getElementById('email')
      
      expect(nameInput).toBeInTheDocument()
      expect(emailInput).toBeInTheDocument()
    })

    it('provides error messages for screen readers', async () => {
      const user = userEvent.setup()
      
      renderFormBuilder()
      
      const submitButton = screen.getByRole('button', { name: /Submit/ })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        const errorMessages = screen.getAllByText('This field is required')
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Loading and Disabled States', () => {
    it('disables form when loading', () => {
      renderFormBuilder({ loading: true })
      
      const nameInput = document.getElementById('name')
      const submitButton = document.querySelector('button[type="submit"]')
      
      expect(nameInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })

    it('disables form when disabled prop is true', () => {
      renderFormBuilder({ disabled: true })
      
      const nameInput = document.getElementById('name')
      const submitButton = document.querySelector('button[type="submit"]')
      
      expect(nameInput).toBeDisabled()
      expect(submitButton).toBeDisabled()
    })
  })
})