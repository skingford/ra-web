import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormHelperText,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  SelectContent,
  SelectItem,
  Checkbox,
  Badge,
  Card,
  Separator,
  Alert,
  Spinner,
  IconButton,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from '@chakra-ui/react'
import { FiDownload, FiPlay, FiSave, FiTrash2, FiPlus, FiSettings } from 'react-icons/fi'
import { DateRangeFilter, DateRange } from './DateRangeFilter'
import { ExportService, ReportConfig, ReportSection } from '../../lib/export'

export interface ReportField {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'boolean'
  filterable?: boolean
  sortable?: boolean
  groupable?: boolean
}

export interface ReportTemplate {
  id: string
  name: string
  description?: string
  config: ReportConfig
  createdAt: Date
  updatedAt: Date
}

export interface ReportBuilderProps {
  fields: ReportField[]
  data?: any[]
  loading?: boolean
  onGenerateReport: (config: ReportConfig) => Promise<any>
  onSaveTemplate?: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  onLoadTemplate?: (templateId: string) => Promise<ReportTemplate>
  templates?: ReportTemplate[]
  defaultConfig?: Partial<ReportConfig>
}

export function ReportBuilder({
  fields,
  data = [],
  loading = false,
  onGenerateReport,
  onSaveTemplate,
  onLoadTemplate,
  templates = [],
  defaultConfig = {},
}: ReportBuilderProps) {
  const [config, setConfig] = useState<ReportConfig>({
    title: '',
    description: '',
    dateRange: { startDate: null, endDate: null, field: '' },
    filters: {},
    groupBy: '',
    sortBy: '',
    sortOrder: 'asc',
    includeCharts: false,
    customSections: [],
    ...defaultConfig,
  })

  const [reportData, setReportData] = useState<any>(null)
  const [generating, setGenerating] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)

  // Available fields for different operations
  const filterableFields = useMemo(() => 
    fields.filter(field => field.filterable), [fields]
  )
  
  const sortableFields = useMemo(() => 
    fields.filter(field => field.sortable), [fields]
  )
  
  const groupableFields = useMemo(() => 
    fields.filter(field => field.groupable), [fields]
  )

  const dateFields = useMemo(() => 
    fields.filter(field => field.type === 'date'), [fields]
  )

  // Update config helpers
  const updateConfig = useCallback((updates: Partial<ReportConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  const updateDateRange = useCallback((dateRange: DateRange) => {
    updateConfig({
      dateRange: {
        ...config.dateRange!,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }
    })
  }, [config.dateRange, updateConfig])

  const updateFilter = useCallback((fieldKey: string, value: any) => {
    updateConfig({
      filters: {
        ...config.filters,
        [fieldKey]: value,
      }
    })
  }, [config.filters, updateConfig])

  const removeFilter = useCallback((fieldKey: string) => {
    const newFilters = { ...config.filters }
    delete newFilters[fieldKey]
    updateConfig({ filters: newFilters })
  }, [config.filters, updateConfig])

  // Section management
  const addSection = useCallback((type: ReportSection['type']) => {
    const newSection: ReportSection = {
      title: `New ${type} section`,
      type,
      data: null,
      config: {},
    }
    
    updateConfig({
      customSections: [...(config.customSections || []), newSection]
    })
  }, [config.customSections, updateConfig])

  const updateSection = useCallback((index: number, updates: Partial<ReportSection>) => {
    const newSections = [...(config.customSections || [])]
    newSections[index] = { ...newSections[index], ...updates }
    updateConfig({ customSections: newSections })
  }, [config.customSections, updateConfig])

  const removeSection = useCallback((index: number) => {
    const newSections = [...(config.customSections || [])]
    newSections.splice(index, 1)
    updateConfig({ customSections: newSections })
  }, [config.customSections, updateConfig])

  // Generate report
  const handleGenerateReport = useCallback(async () => {
    if (!config.title.trim()) {
      return
    }

    try {
      setGenerating(true)
      const result = await onGenerateReport(config)
      setReportData(result)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setGenerating(false)
    }
  }, [config, onGenerateReport])

  // Export report
  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    if (!reportData) return

    try {
      switch (format) {
        case 'pdf':
          await ExportService.generateReport(config, reportData, {
            filename: config.title.toLowerCase().replace(/\s+/g, '-'),
          })
          break
        case 'excel':
          if (Array.isArray(reportData)) {
            const columns = fields.map(field => ({
              key: field.key,
              header: field.label,
            }))
            ExportService.exportToExcel(reportData, columns, {
              filename: config.title.toLowerCase().replace(/\s+/g, '-'),
              title: config.title,
            })
          }
          break
        case 'csv':
          if (Array.isArray(reportData)) {
            const columns = fields.map(field => ({
              key: field.key,
              header: field.label,
            }))
            ExportService.exportToCSV(reportData, columns, {
              filename: config.title.toLowerCase().replace(/\s+/g, '-'),
            })
          }
          break
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [reportData, config, fields])

  // Template management
  const handleSaveTemplate = useCallback(async () => {
    if (!onSaveTemplate || !templateName.trim()) return

    try {
      await onSaveTemplate({
        name: templateName,
        description: templateDescription,
        config,
      })
      setShowSaveTemplate(false)
      setTemplateName('')
      setTemplateDescription('')
    } catch (error) {
      console.error('Failed to save template:', error)
    }
  }, [onSaveTemplate, templateName, templateDescription, config])

  const handleLoadTemplate = useCallback(async (templateId: string) => {
    if (!onLoadTemplate) return

    try {
      const template = await onLoadTemplate(templateId)
      setConfig(template.config)
    } catch (error) {
      console.error('Failed to load template:', error)
    }
  }, [onLoadTemplate])

  // Render filter input based on field type
  const renderFilterInput = useCallback((field: ReportField) => {
    const currentValue = config.filters?.[field.key] || ''

    switch (field.type) {
      case 'boolean':
        return (
          <SelectRoot
            value={[currentValue]}
            onValueChange={(e) => updateFilter(field.key, e.value[0])}
            size="sm"
          >
            <SelectTrigger>
              <SelectValueText placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </SelectRoot>
        )
      case 'number':
        return (
          <Input
            type="number"
            size="sm"
            value={currentValue}
            onChange={(e) => updateFilter(field.key, e.target.value)}
            placeholder={`Filter by ${field.label}`}
          />
        )
      case 'date':
        return (
          <Input
            type="date"
            size="sm"
            value={currentValue}
            onChange={(e) => updateFilter(field.key, e.target.value)}
          />
        )
      default:
        return (
          <Input
            size="sm"
            value={currentValue}
            onChange={(e) => updateFilter(field.key, e.target.value)}
            placeholder={`Filter by ${field.label}`}
          />
        )
    }
  }, [config.filters, updateFilter])

  const isConfigValid = config.title.trim().length > 0

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" wrap="wrap">
        <Box>
          <Text fontSize="xl" fontWeight="bold">
            Report Builder
          </Text>
          <Text color="gray.600" fontSize="sm">
            Create custom reports with filtering and export options
          </Text>
        </Box>

        <HStack gap={2}>
          {/* Template Management */}
          {templates.length > 0 && (
            <MenuRoot>
              <MenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Load Template
                </Button>
              </MenuTrigger>
              <MenuContent>
                {templates.map(template => (
                  <MenuItem
                    key={template.id}
                    value={template.id}
                    onClick={() => handleLoadTemplate(template.id)}
                  >
                    <VStack align="start" gap={1}>
                      <Text fontWeight="medium">{template.name}</Text>
                      {template.description && (
                        <Text fontSize="xs" color="gray.600">
                          {template.description}
                        </Text>
                      )}
                    </VStack>
                  </MenuItem>
                ))}
              </MenuContent>
            </MenuRoot>
          )}

          {onSaveTemplate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSaveTemplate(true)}
              disabled={!isConfigValid}
            >
              <FiSave />
              Save Template
            </Button>
          )}
        </HStack>
      </HStack>

      <HStack gap={6} align="start">
        {/* Configuration Panel */}
        <Card.Root flex={1} maxW="400px">
          <Card.Body>
            <VStack gap={4} align="stretch">
              {/* Basic Info */}
              <Box>
                <Text fontWeight="semibold" mb={3}>
                  Report Details
                </Text>
                <VStack gap={3}>
                  <FormControl>
                    <FormLabel>Title *</FormLabel>
                    <Input
                      value={config.title}
                      onChange={(e) => updateConfig({ title: e.target.value })}
                      placeholder="Enter report title"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={config.description || ''}
                      onChange={(e) => updateConfig({ description: e.target.value })}
                      placeholder="Optional report description"
                      rows={3}
                    />
                  </FormControl>
                </VStack>
              </Box>

              <Separator />

              {/* Date Range */}
              {dateFields.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={3}>
                    Date Range
                  </Text>
                  <VStack gap={3}>
                    <FormControl>
                      <FormLabel>Date Field</FormLabel>
                      <SelectRoot
                        value={[config.dateRange?.field || '']}
                        onValueChange={(e) => updateConfig({
                          dateRange: { ...config.dateRange!, field: e.value[0] }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="Select date field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No date filter</SelectItem>
                          {dateFields.map(field => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </FormControl>

                    {config.dateRange?.field && (
                      <FormControl>
                        <FormLabel>Date Range</FormLabel>
                        <DateRangeFilter
                          value={{
                            startDate: config.dateRange.startDate,
                            endDate: config.dateRange.endDate,
                          }}
                          onChange={updateDateRange}
                        />
                      </FormControl>
                    )}
                  </VStack>
                </Box>
              )}

              {dateFields.length > 0 && <Separator />}

              {/* Filters */}
              {filterableFields.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={3}>
                    Filters
                  </Text>
                  <VStack gap={3}>
                    {filterableFields.map(field => (
                      <FormControl key={field.key}>
                        <HStack justify="space-between">
                          <FormLabel mb={1}>{field.label}</FormLabel>
                          {config.filters?.[field.key] && (
                            <IconButton
                              size="xs"
                              variant="ghost"
                              onClick={() => removeFilter(field.key)}
                            >
                              <FiTrash2 />
                            </IconButton>
                          )}
                        </HStack>
                        {renderFilterInput(field)}
                      </FormControl>
                    ))}
                  </VStack>
                </Box>
              )}

              {filterableFields.length > 0 && <Separator />}

              {/* Sorting and Grouping */}
              <Box>
                <Text fontWeight="semibold" mb={3}>
                  Organization
                </Text>
                <VStack gap={3}>
                  {groupableFields.length > 0 && (
                    <FormControl>
                      <FormLabel>Group By</FormLabel>
                      <SelectRoot
                        value={[config.groupBy || '']}
                        onValueChange={(e) => updateConfig({ groupBy: e.value[0] })}
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="No grouping" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No grouping</SelectItem>
                          {groupableFields.map(field => (
                            <SelectItem key={field.key} value={field.key}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
                    </FormControl>
                  )}

                  {sortableFields.length > 0 && (
                    <HStack gap={2}>
                      <FormControl flex={2}>
                        <FormLabel>Sort By</FormLabel>
                        <SelectRoot
                          value={[config.sortBy || '']}
                          onValueChange={(e) => updateConfig({ sortBy: e.value[0] })}
                        >
                          <SelectTrigger>
                            <SelectValueText placeholder="No sorting" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No sorting</SelectItem>
                            {sortableFields.map(field => (
                              <SelectItem key={field.key} value={field.key}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </SelectRoot>
                      </FormControl>

                      {config.sortBy && (
                        <FormControl flex={1}>
                          <FormLabel>Order</FormLabel>
                          <SelectRoot
                            value={[config.sortOrder || 'asc']}
                            onValueChange={(e) => updateConfig({ sortOrder: e.value[0] as 'asc' | 'desc' })}
                          >
                            <SelectTrigger>
                              <SelectValueText />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asc">Ascending</SelectItem>
                              <SelectItem value="desc">Descending</SelectItem>
                            </SelectContent>
                          </SelectRoot>
                        </FormControl>
                      )}
                    </HStack>
                  )}
                </VStack>
              </Box>

              <Separator />

              {/* Options */}
              <Box>
                <Text fontWeight="semibold" mb={3}>
                  Options
                </Text>
                <VStack gap={2} align="start">
                  <Checkbox.Root
                    checked={config.includeCharts}
                    onCheckedChange={(e) => updateConfig({ includeCharts: !!e.checked })}
                  >
                    <Checkbox.Indicator />
                    <Text ml={2}>Include charts in report</Text>
                  </Checkbox.Root>
                </VStack>
              </Box>

              <Separator />

              {/* Actions */}
              <VStack gap={2}>
                <Button
                  colorScheme="blue"
                  onClick={handleGenerateReport}
                  disabled={!isConfigValid || generating}
                  width="full"
                >
                  {generating ? (
                    <>
                      <Spinner size="sm" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FiPlay />
                      Generate Report
                    </>
                  )}
                </Button>

                {reportData && (
                  <MenuRoot>
                    <MenuTrigger asChild>
                      <Button variant="outline" width="full">
                        <FiDownload />
                        Export Report
                      </Button>
                    </MenuTrigger>
                    <MenuContent>
                      <MenuItem value="pdf" onClick={() => handleExport('pdf')}>
                        Export as PDF
                      </MenuItem>
                      <MenuItem value="excel" onClick={() => handleExport('excel')}>
                        Export as Excel
                      </MenuItem>
                      <MenuItem value="csv" onClick={() => handleExport('csv')}>
                        Export as CSV
                      </MenuItem>
                    </MenuContent>
                  </MenuRoot>
                )}
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Preview Panel */}
        <Card.Root flex={2}>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">Report Preview</Text>
                {reportData && (
                  <Badge colorScheme="green">
                    {Array.isArray(reportData) ? `${reportData.length} records` : 'Generated'}
                  </Badge>
                )}
              </HStack>

              {!reportData ? (
                <Box textAlign="center" py={10} color="gray.500">
                  <Text>Configure your report settings and click "Generate Report" to see a preview</Text>
                </Box>
              ) : loading ? (
                <Box textAlign="center" py={10}>
                  <Spinner size="lg" />
                  <Text mt={2}>Loading report data...</Text>
                </Box>
              ) : (
                <Box>
                  {/* Report Header */}
                  <VStack gap={2} align="start" mb={6}>
                    <Text fontSize="lg" fontWeight="bold">{config.title}</Text>
                    {config.description && (
                      <Text color="gray.600">{config.description}</Text>
                    )}
                    {config.dateRange?.startDate && config.dateRange?.endDate && (
                      <Text fontSize="sm" color="gray.500">
                        Date Range: {config.dateRange.startDate.toLocaleDateString()} - {config.dateRange.endDate.toLocaleDateString()}
                      </Text>
                    )}
                  </VStack>

                  {/* Applied Filters */}
                  {Object.keys(config.filters || {}).length > 0 && (
                    <Box mb={4}>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Applied Filters:</Text>
                      <HStack gap={2} wrap="wrap">
                        {Object.entries(config.filters || {}).map(([key, value]) => {
                          if (!value) return null
                          const field = fields.find(f => f.key === key)
                          return (
                            <Badge key={key} size="sm">
                              {field?.label || key}: {String(value)}
                            </Badge>
                          )
                        })}
                      </HStack>
                    </Box>
                  )}

                  {/* Report Data Preview */}
                  {Array.isArray(reportData) && reportData.length > 0 ? (
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={2}>
                        Showing first 10 records of {reportData.length} total
                      </Text>
                      <Box overflowX="auto" border="1px" borderColor="gray.200" borderRadius="md">
                        <table style={{ width: '100%', fontSize: '14px' }}>
                          <thead style={{ backgroundColor: '#f7fafc' }}>
                            <tr>
                              {fields.slice(0, 6).map(field => (
                                <th key={field.key} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                                  {field.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.slice(0, 10).map((row, index) => (
                              <tr key={index}>
                                {fields.slice(0, 6).map(field => (
                                  <td key={field.key} style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                                    {String(row[field.key] || '-')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>
                    </Box>
                  ) : (
                    <Alert.Root status="info">
                      <Alert.Title>No Data</Alert.Title>
                      <Alert.Description>
                        No data matches the current filter criteria.
                      </Alert.Description>
                    </Alert.Root>
                  )}
                </Box>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      </HStack>

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <Card.Root position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" zIndex={1000} bg="white" shadow="lg" maxW="400px" w="full">
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Text fontWeight="semibold">Save Report Template</Text>
              
              <FormControl>
                <FormLabel>Template Name *</FormLabel>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={3}
                />
              </FormControl>

              <HStack gap={2}>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveTemplate(false)}
                  flex={1}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim()}
                  flex={1}
                >
                  Save Template
                </Button>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  )
}