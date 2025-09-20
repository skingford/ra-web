import React, { useState, useCallback, useMemo } from 'react'

// Validation rule types
export type ValidationRule<T = any, F = any> = {
  required?: boolean | string
  min?: number | string
  max?: number | string
  minLength?: number | string
  maxLength?: number | string
  pattern?: RegExp | string
  email?: boolean | string
  url?: boolean | string
  number?: boolean | string
  integer?: boolean | string
  positive?: boolean | string
  custom?: (value: T, formValues?: F) => string | null | undefined
  asyncCustom?: (value: T, formValues?: F) => Promise<string | null | undefined>
  crossField?: (formValues: F) => string | null | undefined
}

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K], T>
}

export type ValidationErrors<T> = {
  [K in keyof T]?: string
}

export interface FormValidationOptions<T> {
  rules: ValidationRules<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
}

export interface FormValidationState<T> {
  values: T
  errors: ValidationErrors<T>
  touched: { [K in keyof T]?: boolean }
  isValid: boolean
  isValidating: boolean
  isDirty: boolean
}

export interface FormValidationActions<T> {
  setValue: (field: keyof T, value: T[keyof T]) => void
  setValues: (values: Partial<T>) => void
  setError: (field: keyof T, error: string) => void
  setErrors: (errors: ValidationErrors<T>) => void
  clearError: (field: keyof T) => void
  clearErrors: () => void
  setTouched: (field: keyof T, touched?: boolean) => void
  setAllTouched: () => void
  validateField: (field: keyof T) => Promise<boolean>
  validateForm: () => Promise<boolean>
  reset: (values?: T) => void
  handleChange: (field: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
  handleBlur: (field: keyof T) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

// Built-in validation functions
const validators = {
  required: (value: any, message?: string): string | null => {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return message || 'This field is required'
    }
    return null
  },

  min: (value: number, min: number, message?: string): string | null => {
    if (typeof value === 'number' && value < min) {
      return message || `Value must be at least ${min}`
    }
    return null
  },

  max: (value: number, max: number, message?: string): string | null => {
    if (typeof value === 'number' && value > max) {
      return message || `Value must be at most ${max}`
    }
    return null
  },

  minLength: (value: string, minLength: number, message?: string): string | null => {
    if (typeof value === 'string' && value.length < minLength) {
      return message || `Must be at least ${minLength} characters`
    }
    return null
  },

  maxLength: (value: string, maxLength: number, message?: string): string | null => {
    if (typeof value === 'string' && value.length > maxLength) {
      return message || `Must be at most ${maxLength} characters`
    }
    return null
  },

  pattern: (value: string, pattern: RegExp, message?: string): string | null => {
    if (typeof value === 'string' && !pattern.test(value)) {
      return message || 'Invalid format'
    }
    return null
  },

  email: (value: string, message?: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof value === 'string' && value && !emailRegex.test(value)) {
      return message || 'Please enter a valid email address'
    }
    return null
  },

  url: (value: string, message?: string): string | null => {
    try {
      if (typeof value === 'string' && value) {
        new URL(value)
      }
      return null
    } catch {
      return message || 'Please enter a valid URL'
    }
  },

  number: (value: any, message?: string): string | null => {
    if (value !== '' && value !== null && value !== undefined && isNaN(Number(value))) {
      return message || 'Must be a valid number'
    }
    return null
  },

  integer: (value: any, message?: string): string | null => {
    if (value !== '' && value !== null && value !== undefined && (!Number.isInteger(Number(value)))) {
      return message || 'Must be a whole number'
    }
    return null
  },

  positive: (value: number, message?: string): string | null => {
    if (typeof value === 'number' && value <= 0) {
      return message || 'Must be a positive number'
    }
    return null
  },
}

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  options: FormValidationOptions<T>
): FormValidationState<T> & FormValidationActions<T> {
  const { rules, validateOnChange = true, validateOnBlur = true, debounceMs = 300 } = options

  const [values, setValuesState] = useState<T>(initialValues)
  const [errors, setErrorsState] = useState<ValidationErrors<T>>({})
  const [touched, setTouchedState] = useState<{ [K in keyof T]?: boolean }>({})
  const [isValidating, setIsValidating] = useState(false)
  const initialValuesRef = React.useRef<T>(initialValues)

  // Debounced values for async validation
  const debouncedValues = useDebounce(values, debounceMs)

  // Validate a single field
  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    const rule = rules[field]
    if (!rule) return true

    const value = values[field]
    let error: string | null = null

    // Run synchronous validations
    if (rule.required) {
      const message = typeof rule.required === 'string' ? rule.required : undefined
      error = validators.required(value, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.min !== undefined && typeof rule.min === 'number') {
      const message = typeof rule.min === 'string' ? rule.min : undefined
      error = validators.min(value, rule.min, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.max !== undefined && typeof rule.max === 'number') {
      const message = typeof rule.max === 'string' ? rule.max : undefined
      error = validators.max(value, rule.max, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.minLength !== undefined && typeof rule.minLength === 'number') {
      const message = typeof rule.minLength === 'string' ? rule.minLength : undefined
      error = validators.minLength(value, rule.minLength, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.maxLength !== undefined && typeof rule.maxLength === 'number') {
      const message = typeof rule.maxLength === 'string' ? rule.maxLength : undefined
      error = validators.maxLength(value, rule.maxLength, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.pattern) {
      const pattern = rule.pattern instanceof RegExp ? rule.pattern : new RegExp(rule.pattern)
      const message = typeof rule.pattern === 'string' ? undefined : undefined
      error = validators.pattern(value, pattern, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.email) {
      const message = typeof rule.email === 'string' ? rule.email : undefined
      error = validators.email(value, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.url) {
      const message = typeof rule.url === 'string' ? rule.url : undefined
      error = validators.url(value, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.number) {
      const message = typeof rule.number === 'string' ? rule.number : undefined
      error = validators.number(value, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.integer) {
      const message = typeof rule.integer === 'string' ? rule.integer : undefined
      error = validators.integer(value, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    if (rule.positive) {
      const message = typeof rule.positive === 'string' ? rule.positive : undefined
      error = validators.positive(value, message)
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    // Run custom validation
    if (rule.custom) {
      error = rule.custom(value, values) || null
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    // Run cross-field validation
    if (rule.crossField) {
      error = rule.crossField(values) || null
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }))
        return false
      }
    }

    // Run async custom validation
    if (rule.asyncCustom) {
      setIsValidating(true)
      try {
        error = await rule.asyncCustom(value, values) || null
        if (error) {
          setErrorsState(prev => ({ ...prev, [field]: error }))
          return false
        }
      } finally {
        setIsValidating(false)
      }
    }

    // Clear error if validation passed
    setErrorsState(prev => ({ ...prev, [field]: undefined }))
    return true
  }, [values, rules])

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const fieldKeys = Object.keys(rules) as (keyof T)[]
    const validationResults = await Promise.all(
      fieldKeys.map(field => validateField(field))
    )
    return validationResults.every(Boolean)
  }, [rules, validateField])

  // Actions
  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState(prev => ({ ...prev, [field]: value }))
    
    if (validateOnChange) {
      // Validate after a short delay to avoid excessive validation
      setTimeout(() => {
        validateField(field)
        // Also validate fields that might depend on this field
        validateDependentFields(field)
      }, 100)
    }
  }, [validateOnChange, validateField])

  // Validate fields that might have cross-field dependencies
  const validateDependentFields = useCallback(async (changedField: keyof T) => {
    const fieldsToValidate = Object.keys(rules).filter(fieldName => {
      const rule = rules[fieldName as keyof T]
      return rule?.crossField || rule?.custom
    }) as (keyof T)[]

    // Validate dependent fields
    for (const fieldName of fieldsToValidate) {
      if (fieldName !== changedField) {
        await validateField(fieldName)
      }
    }
  }, [rules, validateField])

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }))
  }, [])

  const setError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [field]: error }))
  }, [])

  const setErrors = useCallback((newErrors: ValidationErrors<T>) => {
    setErrorsState(newErrors)
  }, [])

  const clearError = useCallback((field: keyof T) => {
    setErrorsState(prev => ({ ...prev, [field]: undefined }))
  }, [])

  const clearErrors = useCallback(() => {
    setErrorsState({})
  }, [])

  const setTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouchedState(prev => ({ ...prev, [field]: isTouched }))
  }, [])

  const setAllTouched = useCallback(() => {
    const touchedFields = Object.keys(rules).reduce((acc, field) => {
      acc[field as keyof T] = true
      return acc
    }, {} as { [K in keyof T]?: boolean })
    setTouchedState(touchedFields)
  }, [rules])

  const reset = useCallback((newValues?: T) => {
    const resetValues = newValues || initialValues
    setValuesState(resetValues)
    setErrorsState({})
    setTouchedState({})
    // Update initial values ref if new values provided
    if (newValues) {
      initialValuesRef.current = newValues
    }
  }, [initialValues])

  const handleChange = useCallback((field: keyof T) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = event.target
      const value = target.type === 'checkbox' 
        ? (target as HTMLInputElement).checked
        : target.type === 'number'
        ? target.value === '' ? '' : Number(target.value)
        : target.value

      setValue(field, value as T[keyof T])
    }
  }, [setValue])

  const handleBlur = useCallback((field: keyof T) => {
    return (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setTouched(field, true)
      
      if (validateOnBlur) {
        validateField(field)
      }
    }
  }, [validateOnBlur, validateField, setTouched])

  // Computed values
  const isValid = useMemo(() => {
    const errorValues = Object.values(errors).filter(error => error !== undefined)
    return errorValues.length === 0
  }, [errors])

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValuesRef.current)
  }, [values])

  return {
    // State
    values,
    errors,
    touched,
    isValid,
    isValidating,
    isDirty,
    
    // Actions
    setValue,
    setValues,
    setError,
    setErrors,
    clearError,
    clearErrors,
    setTouched,
    setAllTouched,
    validateField,
    validateForm,
    reset,
    handleChange,
    handleBlur,
  }
}

// Utility function to create validation rules
export const createValidationRules = <T extends Record<string, any>>(
  rules: ValidationRules<T>
): ValidationRules<T> => rules

// Common validation rule presets
export const commonRules = {
  email: { required: true, email: true },
  password: { required: true, minLength: 8 },
  confirmPassword: (passwordField: string) => ({
    required: true,
    crossField: (formValues: any) => {
      const password = formValues[passwordField]
      const confirmPassword = formValues.confirmPassword || formValues.passwordConfirm
      if (password && confirmPassword && password !== confirmPassword) {
        return 'Passwords do not match'
      }
      return null
    }
  }),
  phone: { 
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    patternMessage: 'Please enter a valid phone number'
  },
  url: { url: true },
  positiveNumber: { number: true, positive: true },
  requiredString: { required: true, minLength: 1 },
  strongPassword: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!value) return null
      const hasUpperCase = /[A-Z]/.test(value)
      const hasLowerCase = /[a-z]/.test(value)
      const hasNumbers = /\d/.test(value)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)
      
      if (!hasUpperCase) return 'Password must contain at least one uppercase letter'
      if (!hasLowerCase) return 'Password must contain at least one lowercase letter'
      if (!hasNumbers) return 'Password must contain at least one number'
      if (!hasSpecialChar) return 'Password must contain at least one special character'
      
      return null
    }
  },
  uniqueEmail: (checkUnique: (email: string) => Promise<boolean>) => ({
    required: true,
    email: true,
    asyncCustom: async (value: string) => {
      if (!value || !validators.email(value)) return null
      const isUnique = await checkUnique(value)
      return isUnique ? null : 'Email is already taken'
    }
  }),
  dateRange: (startDateField: string, endDateField: string) => ({
    crossField: (formValues: any) => {
      const startDate = formValues[startDateField]
      const endDate = formValues[endDateField]
      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        return 'End date must be after start date'
      }
      return null
    }
  }),
}

// Utility function to create conditional validation rules
export const createConditionalRule = <T>(
  condition: (formValues: T) => boolean,
  rule: ValidationRule<any, T>
): ValidationRule<any, T> => ({
  custom: (value, formValues) => {
    if (!condition(formValues as T)) return null
    return rule.custom?.(value, formValues) || null
  },
  required: rule.required,
  // Add other rule properties as needed
})

// Utility function to combine multiple validation rules
export const combineRules = <T>(...rules: ValidationRule<T>[]): ValidationRule<T> => ({
  custom: (value, formValues) => {
    for (const rule of rules) {
      if (rule.custom) {
        const error = rule.custom(value, formValues)
        if (error) return error
      }
    }
    return null
  },
  asyncCustom: async (value, formValues) => {
    for (const rule of rules) {
      if (rule.asyncCustom) {
        const error = await rule.asyncCustom(value, formValues)
        if (error) return error
      }
    }
    return null
  },
  // Combine other properties (take the most restrictive)
  required: rules.some(rule => rule.required),
  minLength: Math.max(...rules.map(rule => typeof rule.minLength === 'number' ? rule.minLength : 0)),
  maxLength: Math.min(...rules.map(rule => typeof rule.maxLength === 'number' ? rule.maxLength : Infinity).filter(n => n !== Infinity)),
})

// Hook for form auto-save functionality
export function useFormAutoSave<T extends Record<string, any>>(
  values: T,
  onSave: (values: T) => Promise<void>,
  options: {
    delay?: number
    enabled?: boolean
    skipFields?: (keyof T)[]
  } = {}
) {
  const { delay = 2000, enabled = true, skipFields = [] } = options
  const [isSaving, setIsSaving] = React.useState(false)
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null)
  const saveTimeoutRef = React.useRef<NodeJS.Timeout>()
  const lastSavedValuesRef = React.useRef<T>(values)

  const debouncedSave = React.useCallback(async (valuesToSave: T) => {
    if (!enabled) return

    try {
      setIsSaving(true)
      await onSave(valuesToSave)
      setLastSaved(new Date())
      lastSavedValuesRef.current = valuesToSave
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }, [onSave, enabled])

  React.useEffect(() => {
    if (!enabled) return

    // Filter out skip fields and check if values have actually changed
    const filteredValues = Object.keys(values).reduce((acc, key) => {
      if (!skipFields.includes(key as keyof T)) {
        acc[key as keyof T] = values[key as keyof T]
      }
      return acc
    }, {} as T)

    const filteredLastSaved = Object.keys(lastSavedValuesRef.current).reduce((acc, key) => {
      if (!skipFields.includes(key as keyof T)) {
        acc[key as keyof T] = lastSavedValuesRef.current[key as keyof T]
      }
      return acc
    }, {} as T)

    if (JSON.stringify(filteredValues) === JSON.stringify(filteredLastSaved)) {
      return
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(values)
    }, delay)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [values, delay, enabled, skipFields, debouncedSave])

  return {
    isSaving,
    lastSaved,
    forceSave: () => debouncedSave(values),
  }
}