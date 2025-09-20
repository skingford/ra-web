import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { 
  useFormValidation, 
  createValidationRules, 
  commonRules, 
  combineRules, 
  createConditionalRule 
} from '../useFormValidation'

// Test form data type
interface TestForm {
  name: string
  email: string
  age: number
  website?: string
  password: string
  confirmPassword: string
  terms: boolean
}

const initialValues: TestForm = {
  name: '',
  email: '',
  age: 0,
  website: '',
  password: '',
  confirmPassword: '',
  terms: false,
}

describe('useFormValidation', () => {
  describe('Basic Functionality', () => {
    it('initializes with correct default values', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
        email: { required: true, email: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules })
      )

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isValid).toBe(true)
      expect(result.current.isDirty).toBe(false)
      expect(result.current.isValidating).toBe(false)
    })

    it('updates values correctly', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValue('name', 'John Doe')
      })

      expect(result.current.values.name).toBe('John Doe')
      expect(result.current.isDirty).toBe(true)
    })

    it('updates multiple values at once', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
        email: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules })
      )

      act(() => {
        result.current.setValues({
          name: 'John Doe',
          email: 'john@example.com',
        })
      })

      expect(result.current.values.name).toBe('John Doe')
      expect(result.current.values.email).toBe('john@example.com')
    })
  })

  describe('Validation Rules', () => {
    it('validates required fields', async () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
        email: { required: 'Email is required' },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBe('This field is required')

      await act(async () => {
        await result.current.validateField('email')
      })

      expect(result.current.errors.email).toBe('Email is required')
    })

    it('validates email format', async () => {
      const rules = createValidationRules<TestForm>({
        email: { email: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValue('email', 'invalid-email')
      })

      await act(async () => {
        await result.current.validateField('email')
      })

      expect(result.current.errors.email).toBe('Please enter a valid email address')

      act(() => {
        result.current.setValue('email', 'valid@example.com')
      })

      await act(async () => {
        await result.current.validateField('email')
      })

      expect(result.current.errors.email).toBeUndefined()
    })

    it('validates string length', async () => {
      const rules = createValidationRules<TestForm>({
        name: { minLength: 3, maxLength: 10 },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      // Test minLength
      act(() => {
        result.current.setValue('name', 'Jo')
      })

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBe('Must be at least 3 characters')

      // Test maxLength
      act(() => {
        result.current.setValue('name', 'Very Long Name')
      })

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBe('Must be at most 10 characters')

      // Test valid length
      act(() => {
        result.current.setValue('name', 'John')
      })

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBeUndefined()
    })

    it('validates number ranges', async () => {
      const rules = createValidationRules<TestForm>({
        age: { min: 18, max: 100, positive: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      // Test min value
      act(() => {
        result.current.setValue('age', 16)
      })

      await act(async () => {
        await result.current.validateField('age')
      })

      expect(result.current.errors.age).toBe('Value must be at least 18')

      // Test max value
      act(() => {
        result.current.setValue('age', 150)
      })

      await act(async () => {
        await result.current.validateField('age')
      })

      expect(result.current.errors.age).toBe('Value must be at most 100')

      // Test valid value
      act(() => {
        result.current.setValue('age', 25)
      })

      await act(async () => {
        await result.current.validateField('age')
      })

      expect(result.current.errors.age).toBeUndefined()
    })

    it('validates URL format', async () => {
      const rules = createValidationRules<TestForm>({
        website: { url: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValue('website', 'invalid-url')
      })

      await act(async () => {
        await result.current.validateField('website')
      })

      expect(result.current.errors.website).toBe('Please enter a valid URL')

      act(() => {
        result.current.setValue('website', 'https://example.com')
      })

      await act(async () => {
        await result.current.validateField('website')
      })

      expect(result.current.errors.website).toBeUndefined()
    })

    it('validates with custom rules', async () => {
      const rules = createValidationRules<TestForm>({
        name: {
          custom: (value: string) => {
            if (value.toLowerCase().includes('admin')) {
              return 'Name cannot contain "admin"'
            }
            return null
          }
        },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValue('name', 'admin-user')
      })

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBe('Name cannot contain "admin"')

      act(() => {
        result.current.setValue('name', 'regular-user')
      })

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBeUndefined()
    })

    it('validates with async custom rules', async () => {
      const asyncValidator = vi.fn().mockImplementation(async (value: string) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 50))
        
        if (value === 'taken@example.com') {
          return 'Email is already taken'
        }
        return null
      })

      const rules = createValidationRules<TestForm>({
        email: { asyncCustom: asyncValidator },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValue('email', 'taken@example.com')
      })

      await act(async () => {
        await result.current.validateField('email')
      })

      expect(asyncValidator).toHaveBeenCalledWith('taken@example.com', expect.any(Object))
      expect(result.current.errors.email).toBe('Email is already taken')

      act(() => {
        result.current.setValue('email', 'available@example.com')
      })

      await act(async () => {
        await result.current.validateField('email')
      })

      expect(result.current.errors.email).toBeUndefined()
    })
  })

  describe('Form Validation', () => {
    it('validates entire form', async () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
        email: { required: true, email: true },
        age: { min: 18 },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      const isValid = await act(async () => {
        return await result.current.validateForm()
      })

      expect(isValid).toBe(false)
      expect(result.current.errors.name).toBeDefined()
      expect(result.current.errors.email).toBeDefined()
      expect(result.current.errors.age).toBeDefined()
    })

    it('returns true for valid form', async () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
        email: { required: true, email: true },
      })

      const validValues: TestForm = {
        ...initialValues,
        name: 'John Doe',
        email: 'john@example.com',
      }

      const { result } = renderHook(() =>
        useFormValidation(validValues, { rules, validateOnChange: false })
      )

      const isValid = await act(async () => {
        return await result.current.validateForm()
      })

      expect(isValid).toBe(true)
      // Check that there are no actual error messages (undefined values don't count)
      const actualErrors = Object.values(result.current.errors).filter(error => error !== undefined)
      expect(actualErrors).toHaveLength(0)
    })
  })

  describe('Event Handlers', () => {
    it('handles input change events', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      const mockEvent = {
        target: { value: 'John Doe', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleChange('name')(mockEvent)
      })

      expect(result.current.values.name).toBe('John Doe')
    })

    it('handles checkbox change events', () => {
      const rules = createValidationRules<TestForm>({
        terms: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      const mockEvent = {
        target: { checked: true, type: 'checkbox' }
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleChange('terms')(mockEvent)
      })

      expect(result.current.values.terms).toBe(true)
    })

    it('handles number input change events', () => {
      const rules = createValidationRules<TestForm>({
        age: { min: 0 },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      const mockEvent = {
        target: { value: '25', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleChange('age')(mockEvent)
      })

      expect(result.current.values.age).toBe(25)
    })

    it('handles blur events', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnBlur: true })
      )

      const mockEvent = {
        target: { value: '' }
      } as React.FocusEvent<HTMLInputElement>

      act(() => {
        result.current.handleBlur('name')(mockEvent)
      })

      expect(result.current.touched.name).toBe(true)
    })
  })

  describe('Error Management', () => {
    it('sets and clears individual errors', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules })
      )

      act(() => {
        result.current.setError('name', 'Custom error message')
      })

      expect(result.current.errors.name).toBe('Custom error message')

      act(() => {
        result.current.clearError('name')
      })

      expect(result.current.errors.name).toBeUndefined()
    })

    it('sets and clears all errors', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
        email: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules })
      )

      act(() => {
        result.current.setErrors({
          name: 'Name error',
          email: 'Email error',
        })
      })

      expect(result.current.errors.name).toBe('Name error')
      expect(result.current.errors.email).toBe('Email error')

      act(() => {
        result.current.clearErrors()
      })

      expect(result.current.errors).toEqual({})
    })
  })

  describe('Touch State Management', () => {
    it('manages touched state for individual fields', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules })
      )

      act(() => {
        result.current.setTouched('name', true)
      })

      expect(result.current.touched.name).toBe(true)

      act(() => {
        result.current.setTouched('name', false)
      })

      expect(result.current.touched.name).toBe(false)
    })

    it('sets all fields as touched', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
        email: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules })
      )

      act(() => {
        result.current.setAllTouched()
      })

      expect(result.current.touched.name).toBe(true)
      expect(result.current.touched.email).toBe(true)
    })
  })

  describe('Form Reset', () => {
    it('resets form to initial values', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules })
      )

      // Make changes
      act(() => {
        result.current.setValue('name', 'John Doe')
        result.current.setError('email', 'Some error')
        result.current.setTouched('name', true)
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
      expect(result.current.isDirty).toBe(false)
    })

    it('resets form to new values', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules })
      )

      const newValues: TestForm = {
        ...initialValues,
        name: 'Jane Doe',
        email: 'jane@example.com',
      }

      act(() => {
        result.current.reset(newValues)
      })

      expect(result.current.values).toEqual(newValues)
      expect(result.current.isDirty).toBe(false)
    })
  })

  describe('Validation Options', () => {
    it('validates on change when enabled', async () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: true })
      )

      act(() => {
        result.current.setValue('name', '')
      })

      // Wait for validation to trigger
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      expect(result.current.errors.name).toBeDefined()
    })

    it('does not validate on change when disabled', () => {
      const rules = createValidationRules<TestForm>({
        name: { required: true },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValue('name', '')
      })

      expect(result.current.errors.name).toBeUndefined()
    })
  })

  describe('Cross-Field Validation', () => {
    it('validates password confirmation', async () => {
      const rules = createValidationRules<TestForm>({
        password: { required: true, minLength: 8 },
        confirmPassword: commonRules.confirmPassword('password'),
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValues({
          password: 'password123',
          confirmPassword: 'different123',
        })
      })

      await act(async () => {
        await result.current.validateField('confirmPassword')
      })

      expect(result.current.errors.confirmPassword).toBe('Passwords do not match')

      act(() => {
        result.current.setValue('confirmPassword', 'password123')
      })

      await act(async () => {
        await result.current.validateField('confirmPassword')
      })

      expect(result.current.errors.confirmPassword).toBeUndefined()
    })

    it('validates date ranges', async () => {
      interface DateForm {
        startDate: string
        endDate: string
      }

      const rules = createValidationRules<DateForm>({
        endDate: commonRules.dateRange('startDate', 'endDate'),
      })

      const { result } = renderHook(() =>
        useFormValidation<DateForm>(
          { startDate: '', endDate: '' },
          { rules, validateOnChange: false }
        )
      )

      act(() => {
        result.current.setValues({
          startDate: '2023-12-01',
          endDate: '2023-11-01',
        })
      })

      await act(async () => {
        await result.current.validateField('endDate')
      })

      expect(result.current.errors.endDate).toBe('End date must be after start date')
    })
  })

  describe('Enhanced Validation Rules', () => {
    it('validates strong passwords', async () => {
      const rules = createValidationRules<TestForm>({
        password: commonRules.strongPassword,
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      // Test weak password (no uppercase)
      act(() => {
        result.current.setValue('password', 'weakpassword123!')
      })

      await act(async () => {
        await result.current.validateField('password')
      })

      expect(result.current.errors.password).toBe('Password must contain at least one uppercase letter')

      // Test strong password
      act(() => {
        result.current.setValue('password', 'StrongPass123!')
      })

      await act(async () => {
        await result.current.validateField('password')
      })

      expect(result.current.errors.password).toBeUndefined()
    })

    it('validates unique email with async validation', async () => {
      const checkUnique = vi.fn().mockImplementation(async (email: string) => {
        await new Promise(resolve => setTimeout(resolve, 50))
        
        if (email === 'taken@example.com') {
          return 'Email is already taken'
        }
        return null
      })

      const rules = createValidationRules<TestForm>({
        email: {
          required: true,
          email: true,
          asyncCustom: checkUnique,
        },
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValue('email', 'taken@example.com')
      })

      await act(async () => {
        await result.current.validateField('email')
      })

      expect(checkUnique).toHaveBeenCalledWith('taken@example.com', expect.any(Object))
      expect(result.current.errors.email).toBe('Email is already taken')

      act(() => {
        result.current.setValue('email', 'available@example.com')
      })

      await act(async () => {
        await result.current.validateField('email')
      })

      expect(result.current.errors.email).toBeUndefined()
    })
  })

  describe('Utility Functions', () => {
    it('combines multiple validation rules', async () => {
      const rule1 = { minLength: 5 }
      const rule2 = { custom: (value: string) => value.includes('test') ? null : 'Must contain "test"' }
      
      const combinedRule = combineRules(rule1, rule2)
      
      const rules = createValidationRules<TestForm>({
        name: combinedRule,
      })

      const { result } = renderHook(() =>
        useFormValidation(initialValues, { rules, validateOnChange: false })
      )

      act(() => {
        result.current.setValue('name', 'hi')
      })

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBe('Must be at least 5 characters')

      act(() => {
        result.current.setValue('name', 'hello')
      })

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBe('Must contain "test"')

      act(() => {
        result.current.setValue('name', 'hello test')
      })

      await act(async () => {
        await result.current.validateField('name')
      })

      expect(result.current.errors.name).toBeUndefined()
    })

    it('creates conditional validation rules', async () => {
      interface ConditionalForm {
        type: 'email' | 'phone'
        contact: string
      }

      const emailRule = createConditionalRule<ConditionalForm>(
        (formValues) => formValues.type === 'email',
        { 
          custom: (value: string) => {
            if (!value) return null
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailRegex.test(value) ? null : 'Please enter a valid email address'
          }
        }
      )

      const rules = createValidationRules<ConditionalForm>({
        contact: emailRule,
      })

      const { result } = renderHook(() =>
        useFormValidation<ConditionalForm>(
          { type: 'email', contact: '' },
          { rules, validateOnChange: false }
        )
      )

      act(() => {
        result.current.setValues({
          type: 'email',
          contact: 'invalid-email',
        })
      })

      await act(async () => {
        await result.current.validateField('contact')
      })

      expect(result.current.errors.contact).toBe('Please enter a valid email address')

      // Change type to phone - should not validate as email
      act(() => {
        result.current.setValue('type', 'phone')
      })

      await act(async () => {
        await result.current.validateField('contact')
      })

      expect(result.current.errors.contact).toBeUndefined()
    })
  })

  describe('Common Rules', () => {
    it('provides common validation rules', () => {
      expect(commonRules.email).toEqual({ required: true, email: true })
      expect(commonRules.password).toEqual({ required: true, minLength: 8 })
      expect(commonRules.positiveNumber).toEqual({ number: true, positive: true })
      expect(commonRules.requiredString).toEqual({ required: true, minLength: 1 })
    })
  })
})