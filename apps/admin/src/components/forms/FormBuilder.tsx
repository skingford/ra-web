import React, { useState, useCallback } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  Field,
  Progress,
  Alert,
  useBreakpointValue,
  Stack,
} from '@chakra-ui/react'
import { useFormValidation, ValidationRules, createValidationRules } from '../../lib/hooks/useFormValidation'

// Field types supported by FormBuilder
export type FieldType = 
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'checkbox' 
  | 'switch'
  | 'date' 
  | 'datetime-local'
  | 'file'
  | 'hidden'

// Field configuration
export interface FormField {
  id: string
  type: FieldType
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  defaultValue?: any
  
  // Conditional visibility
  showWhen?: {
    field: string
    value: any
    operator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  }
  
  // Field-specific options
  options?: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  
  // Validation rules
  validation?: {
    required?: boolean | string
    min?: number | string
    max?: number | string
    minLength?: number | string
    maxLength?: number | string
    pattern?: RegExp | string
    email?: boolean | string
    url?: boolean | string
    custom?: (value: any, formValues: Record<string, any>) => string | null
  }
  
  // File upload specific
  accept?: string
  multiple?: boolean
  maxSize?: number // in bytes
  
  // Layout options
  width?: 'full' | 'half' | 'third' | 'quarter'
  colSpan?: number
}

// Form schema
export interface FormSchema {
  title?: string
  description?: string
  fields: FormField[]
  layout?: 'vertical' | 'horizontal' | 'grid'
  columns?: number
  submitLabel?: string
  resetLabel?: string
  showReset?: boolean
}

// Form builder props
export interface FormBuilderProps {
  schema: FormSchema
  initialValues?: Record<string, any>
  onSubmit: (values: Record<string, any>) => Promise<void> | void
  onReset?: () => void
  loading?: boolean
  disabled?: boolean
  className?: string
}

// File upload state
interface FileUploadState {
  files: File[]
  uploading: boolean
  progress: number
  error?: string
}

export function FormBuilder({
  schema,
  initialValues = {},
  onSubmit,
  onReset,
  loading = false,
  disabled = false,
  className,
}: FormBuilderProps) {
  // Build initial form values from schema and provided values
  const buildInitialValues = useCallback(() => {
    const values: Record<string, any> = {}
    
    schema.fields.forEach(field => {
      if (initialValues[field.id] !== undefined) {
        values[field.id] = initialValues[field.id]
      } else if (field.defaultValue !== undefined) {
        values[field.id] = field.defaultValue
      } else {
        // Set appropriate default based on field type
        switch (field.type) {
          case 'checkbox':
          case 'switch':
            values[field.id] = false
            break
          case 'multiselect':
            values[field.id] = []
            break
          case 'number':
            values[field.id] = 0
            break
          default:
            values[field.id] = ''
        }
      }
    })
    
    return values
  }, [schema.fields, initialValues])

  // Build validation rules from schema
  const buildValidationRules = useCallback(() => {
    const rules: ValidationRules<Record<string, any>> = {}
    
    schema.fields.forEach(field => {
      if (field.validation || field.required) {
        rules[field.id] = {
          required: field.required || field.validation?.required,
          min: field.validation?.min,
          max: field.validation?.max,
          minLength: field.validation?.minLength,
          maxLength: field.validation?.maxLength,
          pattern: field.validation?.pattern,
          email: field.validation?.email !== undefined ? field.validation.email : (field.type === 'email' ? true : undefined),
          url: field.validation?.url,
          custom: field.validation?.custom ? (value, formValues) => 
            field.validation!.custom!(value, formValues) : undefined,
        }
      }
    })
    
    return createValidationRules(rules)
  }, [schema.fields])

  // Form state management
  const form = useFormValidation(buildInitialValues(), {
    rules: buildValidationRules(),
    validateOnChange: true,
    validateOnBlur: true,
  })

  // File upload states
  const [fileStates, setFileStates] = useState<Record<string, FileUploadState>>({})

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })

  // Check if field should be visible based on conditional logic
  const isFieldVisible = useCallback((field: FormField): boolean => {
    if (field.hidden) return false
    
    if (!field.showWhen) return true
    
    const { field: dependentField, value: expectedValue, operator = 'equals' } = field.showWhen
    const actualValue = form.values[dependentField]
    
    switch (operator) {
      case 'equals':
        return actualValue === expectedValue
      case 'not_equals':
        return actualValue !== expectedValue
      case 'contains':
        return Array.isArray(actualValue) 
          ? actualValue.includes(expectedValue)
          : String(actualValue).includes(String(expectedValue))
      case 'greater_than':
        return Number(actualValue) > Number(expectedValue)
      case 'less_than':
        return Number(actualValue) < Number(expectedValue)
      default:
        return true
    }
  }, [form.values])

  // Handle file upload
  const handleFileUpload = useCallback(async (fieldId: string, files: FileList) => {
    const field = schema.fields.find(f => f.id === fieldId)
    if (!field) return

    const fileArray = Array.from(files)
    
    // Validate file size
    if (field.maxSize) {
      const oversizedFiles = fileArray.filter(file => file.size > field.maxSize!)
      if (oversizedFiles.length > 0) {
        form.setError(fieldId, `File size must be less than ${field.maxSize / 1024 / 1024}MB`)
        return
      }
    }

    // Validate file type
    if (field.accept) {
      const acceptedTypes = field.accept.split(',').map(type => type.trim())
      const invalidFiles = fileArray.filter(file => 
        !acceptedTypes.some(type => 
          type === file.type || 
          (type.startsWith('.') && file.name.endsWith(type))
        )
      )
      if (invalidFiles.length > 0) {
        form.setError(fieldId, 'Invalid file type')
        return
      }
    }

    // Update file state
    setFileStates(prev => ({
      ...prev,
      [fieldId]: {
        files: fileArray,
        uploading: true,
        progress: 0,
      }
    }))

    try {
      // Simulate file upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setFileStates(prev => ({
          ...prev,
          [fieldId]: {
            ...prev[fieldId],
            progress,
          }
        }))
      }

      // Set form value to files or file URLs
      const value = field.multiple ? fileArray : fileArray[0]
      form.setValue(fieldId, value)
      
      setFileStates(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          uploading: false,
        }
      }))
    } catch (error) {
      setFileStates(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        }
      }))
    }
  }, [schema.fields, form])

  // Render individual field
  const renderField = useCallback((field: FormField) => {
    if (!isFieldVisible(field)) return null

    const fieldError = form.errors[field.id]
    const fieldTouched = form.touched[field.id]
    const fieldValue = form.values[field.id]
    const isFieldDisabled = disabled || loading || field.disabled
    const fileState = fileStates[field.id]

    const fieldProps = {
      id: field.id,
      name: field.id,
      disabled: isFieldDisabled,
      onChange: form.handleChange(field.id),
      onBlur: form.handleBlur(field.id),
    }

    let fieldElement: React.ReactNode

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'date':
      case 'datetime-local':
        fieldElement = (
          <Input
            {...fieldProps}
            type={field.type}
            value={fieldValue || ''}
            placeholder={field.placeholder}
            size={isMobile ? 'lg' : 'md'}
            // Better touch targets on mobile
            minH={isMobile ? '48px' : 'auto'}
          />
        )
        break

      case 'number':
        fieldElement = (
          <Input
            {...fieldProps}
            type="number"
            value={fieldValue || ''}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            size={isMobile ? 'lg' : 'md'}
            minH={isMobile ? '48px' : 'auto'}
          />
        )
        break

      case 'textarea':
        fieldElement = (
          <Textarea
            {...fieldProps}
            value={fieldValue || ''}
            placeholder={field.placeholder}
            rows={isMobile ? 3 : 4}
            size={isMobile ? 'lg' : 'md'}
            minH={isMobile ? '120px' : 'auto'}
          />
        )
        break

      case 'select':
        const selectItems = field.options?.map(option => ({
          label: option.label,
          value: String(option.value),
          disabled: option.disabled,
        })) || []

        fieldElement = (
          <SelectRoot
            value={fieldValue ? [String(fieldValue)] : []}
            onValueChange={(e) => form.setValue(field.id, e.value[0] || '')}
            disabled={isFieldDisabled}
          >
            <SelectTrigger>
              <SelectValueText placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {selectItems.map(option => (
                <SelectItem 
                  key={option.value} 
                  item={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        )
        break

      case 'multiselect':
        const multiselectItems = field.options?.map(option => ({
          label: option.label,
          value: String(option.value),
          disabled: option.disabled,
        })) || []

        fieldElement = (
          <SelectRoot
            value={Array.isArray(fieldValue) ? fieldValue.map(String) : []}
            onValueChange={(e) => form.setValue(field.id, e.value)}
            disabled={isFieldDisabled}
            multiple
          >
            <SelectTrigger>
              <SelectValueText placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {multiselectItems.map(option => (
                <SelectItem 
                  key={option.value} 
                  item={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        )
        break

      case 'checkbox':
        fieldElement = (
          <HStack>
            <input
              type="checkbox"
              id={field.id}
              checked={!!fieldValue}
              disabled={isFieldDisabled}
              onChange={(e) => form.setValue(field.id, e.target.checked)}
            />
            <Text as="label" htmlFor={field.id} cursor="pointer">
              {field.label}
            </Text>
          </HStack>
        )
        break

      case 'switch':
        fieldElement = (
          <HStack justify="space-between">
            <Text>{field.label}</Text>
            <input
              type="checkbox"
              checked={!!fieldValue}
              disabled={isFieldDisabled}
              onChange={(e) => form.setValue(field.id, e.target.checked)}
              style={{ transform: 'scale(1.5)' }}
            />
          </HStack>
        )
        break

      case 'file':
        fieldElement = (
          <VStack align="stretch" gap={2}>
            <Input
              {...fieldProps}
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              disabled={isFieldDisabled || fileState?.uploading}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(field.id, e.target.files)
                }
              }}
            />
            
            {fileState?.uploading && (
              <Box>
                <Text fontSize="sm" mb={1}>Uploading...</Text>
                <Progress value={fileState.progress} />
              </Box>
            )}
            
            {fileState?.error && (
              <Alert status="error">
                <Text fontSize="sm">{fileState.error}</Text>
              </Alert>
            )}
            
            {fileState?.files && fileState.files.length > 0 && !fileState.uploading && (
              <VStack align="start" gap={1}>
                <Text fontSize="sm" fontWeight="medium">Uploaded files:</Text>
                {fileState.files.map((file, index) => (
                  <Text key={index} fontSize="sm" color="gray.600">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </Text>
                ))}
              </VStack>
            )}
          </VStack>
        )
        break

      case 'hidden':
        fieldElement = (
          <Input
            type="hidden"
            value={fieldValue || ''}
            onChange={() => {}} // Hidden fields don't change via user input
          />
        )
        break

      default:
        fieldElement = (
          <Text color="red.500">
            Unsupported field type: {field.type}
          </Text>
        )
    }

    // Don't wrap hidden fields in Field component
    if (field.type === 'hidden') {
      return fieldElement
    }

    // For checkbox and switch, we handle the label differently
    if (field.type === 'checkbox' || field.type === 'switch') {
      return (
        <Field.Root key={field.id} invalid={!!(fieldError && fieldTouched)}>
          {fieldElement}
          {field.description && (
            <Field.HelperText>{field.description}</Field.HelperText>
          )}
          {fieldError && fieldTouched && (
            <Field.ErrorText>{fieldError}</Field.ErrorText>
          )}
        </Field.Root>
      )
    }

    return (
      <Field.Root key={field.id} invalid={!!(fieldError && fieldTouched)}>
        {field.label && (
          <Field.Label htmlFor={field.id}>
            {field.label}
            {field.required && <Text as="span" color="red.500" ml={1}>*</Text>}
          </Field.Label>
        )}
        {fieldElement}
        {field.description && (
          <Field.HelperText>{field.description}</Field.HelperText>
        )}
        {fieldError && fieldTouched && (
          <Field.ErrorText>{fieldError}</Field.ErrorText>
        )}
      </Field.Root>
    )
  }, [form, isFieldVisible, disabled, fileStates, handleFileUpload])

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched first to show validation errors
    form.setAllTouched()
    
    const isValid = await form.validateForm()
    if (!isValid) {
      return
    }

    try {
      await onSubmit(form.values)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }, [form, onSubmit])

  // Handle form reset
  const handleReset = useCallback(() => {
    form.reset()
    setFileStates({})
    onReset?.()
  }, [form, onReset])

  // Get visible fields
  const visibleFields = schema.fields.filter(isFieldVisible)

  // Calculate grid layout
  const getGridColumns = () => {
    if (schema.layout === 'grid' && schema.columns) {
      return schema.columns
    }
    return 1
  }

  return (
    <Box className={className}>
      {schema.title && (
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {schema.title}
        </Text>
      )}
      
      {schema.description && (
        <Text color="gray.600" mb={6}>
          {schema.description}
        </Text>
      )}

      <form onSubmit={handleSubmit}>
        <VStack gap={6} align="stretch">
          {/* Form Fields */}
          {schema.layout === 'grid' ? (
            <Box
              display="grid"
              gridTemplateColumns={`repeat(${getGridColumns()}, 1fr)`}
              gap={4}
              style={{ gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)` }}
            >
              {visibleFields.map(renderField)}
            </Box>
          ) : (
            <VStack gap={4} align="stretch">
              {visibleFields.map(renderField)}
            </VStack>
          )}

          {/* Form Actions */}
          <HStack justify="flex-end" gap={3}>
            {schema.showReset !== false && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading || disabled}
              >
                {schema.resetLabel || 'Reset'}
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={loading || disabled}
            >
              {loading ? 'Submitting...' : (schema.submitLabel || 'Submit')}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  )
}

// Utility function to create form schemas
export const createFormSchema = (schema: FormSchema): FormSchema => schema

// Common field presets
export const fieldPresets = {
  email: (id: string, label = 'Email', required = true): FormField => ({
    id,
    type: 'email',
    label,
    required,
    validation: {
      required,
      email: true,
    },
  }),

  password: (id: string, label = 'Password', required = true): FormField => ({
    id,
    type: 'password',
    label,
    required,
    validation: {
      required,
      minLength: 8,
    },
  }),

  name: (id: string, label = 'Name', required = true): FormField => ({
    id,
    type: 'text',
    label,
    required,
    validation: {
      required,
      minLength: 2,
      maxLength: 50,
    },
  }),

  phone: (id: string, label = 'Phone', required = false): FormField => ({
    id,
    type: 'text',
    label,
    required,
    validation: {
      required,
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
    },
  }),

  url: (id: string, label = 'Website', required = false): FormField => ({
    id,
    type: 'text',
    label,
    required,
    validation: {
      required,
      url: true,
    },
  }),

  age: (id: string, label = 'Age', required = false): FormField => ({
    id,
    type: 'number',
    label,
    required,
    validation: {
      required,
      min: 0,
      max: 150,
    },
  }),

  terms: (id: string, label = 'I agree to the terms and conditions'): FormField => ({
    id,
    type: 'checkbox',
    label,
    required: true,
    validation: {
      required: 'You must agree to the terms',
    },
  }),
}