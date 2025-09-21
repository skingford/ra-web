import { useCallback, useState } from 'react'
import { ExportService, ExportColumn, ExportOptions } from '../export'
import { ColumnDef } from '../../components/data/DataTable'

export interface UseExportOptions {
  filename?: string
  includeTimestamp?: boolean
  onExportStart?: () => void
  onExportComplete?: () => void
  onExportError?: (error: Error) => void
}

export interface ExportState {
  isExporting: boolean
  exportFormat: string | null
  error: string | null
}

export function useExport<T>(
  data: T[],
  columns: ColumnDef<T>[],
  options: UseExportOptions = {}
) {
  const [exportState, setExportState] = useState<ExportState>({
    isExporting: false,
    exportFormat: null,
    error: null,
  })

  const {
    filename = 'export',
    includeTimestamp = true,
    onExportStart,
    onExportComplete,
    onExportError,
  } = options

  // Convert DataTable columns to export columns
  const getExportColumns = useCallback((): ExportColumn[] => {
    return columns
      .filter(col => col.accessorKey || col.accessorFn) // Only include columns with data access
      .map(col => {
        const exportCol: ExportColumn = {
          key: col.accessorKey as string || col.id,
          header: col.header,
        }
        
        // Only add formatter if no custom cell renderer
        if (!col.cell) {
          exportCol.formatter = (value: any) => {
            if (value === null || value === undefined) return ''
            if (value instanceof Date) return value.toLocaleDateString()
            if (typeof value === 'boolean') return value ? 'Yes' : 'No'
            if (typeof value === 'number') return value.toLocaleString()
            return String(value)
          }
        }
        
        return exportCol
      })
  }, [columns])

  // Export to CSV
  const exportToCSV = useCallback(async (customOptions?: Partial<ExportOptions>) => {
    try {
      setExportState({ isExporting: true, exportFormat: 'csv', error: null })
      onExportStart?.()

      const exportColumns = getExportColumns()
      const exportOptions: ExportOptions = {
        filename,
        includeTimestamp,
        ...customOptions,
      }

      ExportService.exportToCSV(data, exportColumns, exportOptions)
      
      onExportComplete?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed'
      setExportState(prev => ({ ...prev, error: errorMessage }))
      onExportError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setExportState(prev => ({ ...prev, isExporting: false, exportFormat: null }))
    }
  }, [data, getExportColumns, filename, includeTimestamp, onExportStart, onExportComplete, onExportError])

  // Export to Excel
  const exportToExcel = useCallback(async (customOptions?: Partial<ExportOptions>) => {
    try {
      setExportState({ isExporting: true, exportFormat: 'excel', error: null })
      onExportStart?.()

      const exportColumns = getExportColumns()
      const exportOptions: ExportOptions = {
        filename,
        includeTimestamp,
        ...customOptions,
      }

      ExportService.exportToExcel(data, exportColumns, exportOptions)
      
      onExportComplete?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed'
      setExportState(prev => ({ ...prev, error: errorMessage }))
      onExportError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setExportState(prev => ({ ...prev, isExporting: false, exportFormat: null }))
    }
  }, [data, getExportColumns, filename, includeTimestamp, onExportStart, onExportComplete, onExportError])

  // Export to PDF
  const exportToPDF = useCallback(async (customOptions?: Partial<ExportOptions>) => {
    try {
      setExportState({ isExporting: true, exportFormat: 'pdf', error: null })
      onExportStart?.()

      const exportColumns = getExportColumns()
      const exportOptions: ExportOptions = {
        filename,
        includeTimestamp,
        ...customOptions,
      }

      ExportService.exportToPDF(data, exportColumns, exportOptions)
      
      onExportComplete?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed'
      setExportState(prev => ({ ...prev, error: errorMessage }))
      onExportError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setExportState(prev => ({ ...prev, isExporting: false, exportFormat: null }))
    }
  }, [data, getExportColumns, filename, includeTimestamp, onExportStart, onExportComplete, onExportError])

  // Export with format selection
  const exportData = useCallback(async (
    format: 'csv' | 'excel' | 'pdf',
    customOptions?: Partial<ExportOptions>
  ) => {
    switch (format) {
      case 'csv':
        return exportToCSV(customOptions)
      case 'excel':
        return exportToExcel(customOptions)
      case 'pdf':
        return exportToPDF(customOptions)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }, [exportToCSV, exportToExcel, exportToPDF])

  // Clear error
  const clearError = useCallback(() => {
    setExportState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    exportState,
    exportToCSV,
    exportToExcel,
    exportToPDF,
    exportData,
    clearError,
    // Convenience properties
    isExporting: exportState.isExporting,
    exportFormat: exportState.exportFormat,
    error: exportState.error,
  }
}