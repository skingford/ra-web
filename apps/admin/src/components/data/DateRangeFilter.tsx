import React, { useState, useCallback } from 'react'
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Input,
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverArrow,
  Badge,
  IconButton,
} from '@chakra-ui/react'
import { FiCalendar, FiX } from 'react-icons/fi'
import { format, isValid, parseISO, startOfDay, endOfDay } from 'date-fns'

export interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

export interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
  disabled?: boolean
  maxDate?: Date
  minDate?: Date
  presets?: DateRangePreset[]
  showPresets?: boolean
  allowClear?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export interface DateRangePreset {
  label: string
  value: DateRange
  description?: string
}

// Common date range presets
export const DEFAULT_DATE_PRESETS: DateRangePreset[] = [
  {
    label: 'Today',
    value: {
      startDate: startOfDay(new Date()),
      endDate: endOfDay(new Date()),
    },
  },
  {
    label: 'Yesterday',
    value: {
      startDate: startOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      endDate: endOfDay(new Date(Date.now() - 24 * 60 * 60 * 1000)),
    },
  },
  {
    label: 'Last 7 days',
    value: {
      startDate: startOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      endDate: endOfDay(new Date()),
    },
  },
  {
    label: 'Last 30 days',
    value: {
      startDate: startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      endDate: endOfDay(new Date()),
    },
  },
  {
    label: 'This month',
    value: {
      startDate: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      endDate: endOfDay(new Date()),
    },
  },
  {
    label: 'Last month',
    value: {
      startDate: startOfDay(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)),
      endDate: endOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 0)),
    },
  },
  {
    label: 'This year',
    value: {
      startDate: startOfDay(new Date(new Date().getFullYear(), 0, 1)),
      endDate: endOfDay(new Date()),
    },
  },
]

export function DateRangeFilter({
  value,
  onChange,
  placeholder = 'Select date range',
  disabled = false,
  maxDate,
  minDate,
  presets = DEFAULT_DATE_PRESETS,
  showPresets = true,
  allowClear = true,
  size = 'md',
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')

  // Format date for input
  const formatDateForInput = useCallback((date: Date | null): string => {
    if (!date || !isValid(date)) return ''
    return format(date, 'yyyy-MM-dd')
  }, [])

  // Parse date from input
  const parseDateFromInput = useCallback((dateString: string): Date | null => {
    if (!dateString) return null
    try {
      const parsed = parseISO(dateString)
      return isValid(parsed) ? parsed : null
    } catch {
      return null
    }
  }, [])

  // Handle preset selection
  const handlePresetSelect = useCallback((preset: DateRangePreset) => {
    onChange(preset.value)
    setIsOpen(false)
  }, [onChange])

  // Handle manual date input
  const handleApplyDates = useCallback(() => {
    const startDate = parseDateFromInput(tempStartDate)
    const endDate = parseDateFromInput(tempEndDate)

    // Validate date range
    if (startDate && endDate && startDate > endDate) {
      return // Invalid range
    }

    onChange({
      startDate: startDate ? startOfDay(startDate) : null,
      endDate: endDate ? endOfDay(endDate) : null,
    })
    setIsOpen(false)
  }, [tempStartDate, tempEndDate, parseDateFromInput, onChange])

  // Handle clear
  const handleClear = useCallback(() => {
    onChange({ startDate: null, endDate: null })
    setTempStartDate('')
    setTempEndDate('')
  }, [onChange])

  // Open popover and initialize temp dates
  const handleOpen = useCallback(() => {
    setTempStartDate(formatDateForInput(value.startDate))
    setTempEndDate(formatDateForInput(value.endDate))
    setIsOpen(true)
  }, [value, formatDateForInput])

  // Format display text
  const getDisplayText = useCallback((): string => {
    if (!value.startDate && !value.endDate) {
      return placeholder
    }

    if (value.startDate && value.endDate) {
      // Check if it matches a preset
      const matchingPreset = presets.find(preset => 
        preset.value.startDate?.getTime() === value.startDate?.getTime() &&
        preset.value.endDate?.getTime() === value.endDate?.getTime()
      )

      if (matchingPreset) {
        return matchingPreset.label
      }

      return `${format(value.startDate, 'MMM dd, yyyy')} - ${format(value.endDate, 'MMM dd, yyyy')}`
    }

    if (value.startDate) {
      return `From ${format(value.startDate, 'MMM dd, yyyy')}`
    }

    if (value.endDate) {
      return `Until ${format(value.endDate, 'MMM dd, yyyy')}`
    }

    return placeholder
  }, [value, placeholder, presets])

  const hasValue = value.startDate || value.endDate
  const isValidRange = !tempStartDate || !tempEndDate || 
    !parseDateFromInput(tempStartDate) || !parseDateFromInput(tempEndDate) ||
    parseDateFromInput(tempStartDate)! <= parseDateFromInput(tempEndDate)!

  return (
    <PopoverRoot open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled}
          onClick={handleOpen}
          justifyContent="space-between"
          minW="200px"
          maxW="300px"
          fontWeight="normal"
          color={hasValue ? 'inherit' : 'gray.500'}
        >
          <HStack gap={2} flex={1} overflow="hidden">
            <FiCalendar />
            <Text truncate flex={1} textAlign="left">
              {getDisplayText()}
            </Text>
          </HStack>
          
          {hasValue && allowClear && (
            <IconButton
              size="xs"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              ml={2}
            >
              <FiX />
            </IconButton>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent width="400px">
        <PopoverArrow />
        <PopoverHeader>
          <Text fontWeight="semibold">Select Date Range</Text>
        </PopoverHeader>
        <PopoverBody>
          <VStack gap={4} align="stretch">
            {/* Manual Date Selection */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Custom Range
              </Text>
              <VStack gap={3}>
                <HStack gap={3} width="full">
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      Start Date
                    </Text>
                    <Input
                      type="date"
                      size="sm"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      max={maxDate ? formatDateForInput(maxDate) : undefined}
                      min={minDate ? formatDateForInput(minDate) : undefined}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.600" mb={1}>
                      End Date
                    </Text>
                    <Input
                      type="date"
                      size="sm"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      max={maxDate ? formatDateForInput(maxDate) : undefined}
                      min={minDate ? formatDateForInput(minDate) : undefined}
                    />
                  </Box>
                </HStack>

                {!isValidRange && (
                  <Text fontSize="xs" color="red.500">
                    End date must be after start date
                  </Text>
                )}

                <HStack gap={2} width="full">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    flex={1}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleApplyDates}
                    disabled={!isValidRange}
                    flex={1}
                  >
                    Apply
                  </Button>
                </HStack>
              </VStack>
            </Box>

            {/* Presets */}
            {showPresets && presets.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Quick Select
                </Text>
                <VStack gap={1} align="stretch">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="ghost"
                      justifyContent="flex-start"
                      onClick={() => handlePresetSelect(preset)}
                      _hover={{ bg: 'gray.50' }}
                    >
                      <HStack justify="space-between" width="full">
                        <Text>{preset.label}</Text>
                        {preset.description && (
                          <Badge size="sm" colorScheme="gray">
                            {preset.description}
                          </Badge>
                        )}
                      </HStack>
                    </Button>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Clear Option */}
            {allowClear && hasValue && (
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                onClick={handleClear}
              >
                Clear Selection
              </Button>
            )}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  )
}