import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useExport } from '../useExport'
import { ExportService } from '../../export'

// Mock ExportService
vi.mock('../../export', () => ({
  ExportService: {
    exportToCSV: vi.fn(),
    exportToExcel: vi.fn(),
    exportToPDF: vi.fn(),
  },
}))

describe('useExport', () => {
  const mockData = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  ]

  const mockColumns = [
    { id: 'id', header: 'ID', accessorKey: 'id' as keyof typeof mockData[0] },
    { id: 'name', header: 'Name', accessorKey: 'name' as keyof typeof mockData[0] },
    { id: 'email', header: 'Email', accessorKey: 'email' as keyof typeof mockData[0] },
  ]

  const mockOptions = {
    filename: 'test-export',
    includeTimestamp: false,
    onExportStart: vi.fn(),
    onExportComplete: vi.fn(),
    onExportError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useExport(mockData, mockColumns))

    expect(result.current.exportState).toEqual({
      isExporting: false,
      exportFormat: null,
      error: null,
    })
    expect(result.current.isExporting).toBe(false)
    expect(result.current.exportFormat).toBe(null)
    expect(result.current.error).toBe(null)
  })

  describe('exportToCSV', () => {
    it('exports data to CSV successfully', async () => {
      const { result } = renderHook(() => useExport(mockData, mockColumns, mockOptions))

      await act(async () => {
        await result.current.exportToCSV()
      })

      expect(ExportService.exportToCSV).toHaveBeenCalledWith(
        mockData,
        expect.arrayContaining([
          expect.objectContaining({ key: 'id', header: 'ID' }),
          expect.objectContaining({ key: 'name', header: 'Name' }),
          expect.objectContaining({ key: 'email', header: 'Email' }),
        ]),
        expect.objectContaining({
          filename: 'test-export',
          includeTimestamp: false,
        })
      )

      expect(mockOptions.onExportStart).toHaveBeenCalled()
      expect(mockOptions.onExportComplete).toHaveBeenCalled()
      expect(result.current.isExporting).toBe(false)
    })

    it('handles export errors', async () => {
      const error = new Error('Export failed')
      vi.mocked(ExportService.exportToCSV).mockImplementationOnce(() => {
        throw error
      })

      const { result } = renderHook(() => useExport(mockData, mockColumns, mockOptions))

      await act(async () => {
        await result.current.exportToCSV()
      })

      expect(mockOptions.onExportError).toHaveBeenCalledWith(error)
      expect(result.current.error).toBe('Export failed')
      expect(result.current.isExporting).toBe(false)
    })

    it('sets loading state during export', async () => {
      let resolveExport: () => void
      const exportPromise = new Promise<void>((resolve) => {
        resolveExport = resolve
      })

      vi.mocked(ExportService.exportToCSV).mockImplementationOnce(() => exportPromise)

      const { result } = renderHook(() => useExport(mockData, mockColumns, mockOptions))

      act(() => {
        result.current.exportToCSV()
      })

      expect(result.current.isExporting).toBe(true)
      expect(result.current.exportFormat).toBe('csv')

      await act(async () => {
        resolveExport!()
        await exportPromise
      })

      expect(result.current.isExporting).toBe(false)
      expect(result.current.exportFormat).toBe(null)
    })
  })

  describe('exportToExcel', () => {
    it('exports data to Excel successfully', async () => {
      const { result } = renderHook(() => useExport(mockData, mockColumns, mockOptions))

      await act(async () => {
        await result.current.exportToExcel()
      })

      expect(ExportService.exportToExcel).toHaveBeenCalledWith(
        mockData,
        expect.any(Array),
        expect.objectContaining({
          filename: 'test-export',
          includeTimestamp: false,
        })
      )

      expect(mockOptions.onExportComplete).toHaveBeenCalled()
    })

    it('accepts custom options', async () => {
      const { result } = renderHook(() => useExport(mockData, mockColumns))

      const customOptions = {
        title: 'Custom Report',
        filename: 'custom-export',
      }

      await act(async () => {
        await result.current.exportToExcel(customOptions)
      })

      expect(ExportService.exportToExcel).toHaveBeenCalledWith(
        mockData,
        expect.any(Array),
        expect.objectContaining(customOptions)
      )
    })
  })

  describe('exportToPDF', () => {
    it('exports data to PDF successfully', async () => {
      const { result } = renderHook(() => useExport(mockData, mockColumns, mockOptions))

      await act(async () => {
        await result.current.exportToPDF()
      })

      expect(ExportService.exportToPDF).toHaveBeenCalledWith(
        mockData,
        expect.any(Array),
        expect.objectContaining({
          filename: 'test-export',
          includeTimestamp: false,
        })
      )

      expect(mockOptions.onExportComplete).toHaveBeenCalled()
    })
  })

  describe('exportData', () => {
    it('exports with specified format', async () => {
      const { result } = renderHook(() => useExport(mockData, mockColumns))

      await act(async () => {
        await result.current.exportData('csv')
      })

      expect(ExportService.exportToCSV).toHaveBeenCalled()

      await act(async () => {
        await result.current.exportData('excel')
      })

      expect(ExportService.exportToExcel).toHaveBeenCalled()

      await act(async () => {
        await result.current.exportData('pdf')
      })

      expect(ExportService.exportToPDF).toHaveBeenCalled()
    })

    it('throws error for unsupported format', async () => {
      const { result } = renderHook(() => useExport(mockData, mockColumns))

      await expect(
        act(async () => {
          await result.current.exportData('xml' as any)
        })
      ).rejects.toThrow('Unsupported export format: xml')
    })
  })

  describe('column conversion', () => {
    it('filters columns without data access', () => {
      const columnsWithoutAccess = [
        { id: 'action', header: 'Actions' }, // No accessorKey or accessorFn
        { id: 'name', header: 'Name', accessorKey: 'name' as keyof typeof mockData[0] },
      ]

      const { result } = renderHook(() => useExport(mockData, columnsWithoutAccess))

      act(() => {
        result.current.exportToCSV()
      })

      expect(ExportService.exportToCSV).toHaveBeenCalledWith(
        mockData,
        expect.arrayContaining([
          expect.objectContaining({ key: 'name', header: 'Name' }),
        ]),
        expect.any(Object)
      )

      // Should not include the action column
      const exportColumns = vi.mocked(ExportService.exportToCSV).mock.calls[0][1]
      expect(exportColumns).toHaveLength(1)
      expect(exportColumns[0].key).toBe('name')
    })

    it('handles columns with accessorFn', () => {
      const columnsWithFn = [
        {
          id: 'fullName',
          header: 'Full Name',
          accessorFn: (row: typeof mockData[0]) => `${row.name} (${row.email})`,
        },
      ]

      const { result } = renderHook(() => useExport(mockData, columnsWithFn))

      act(() => {
        result.current.exportToCSV()
      })

      expect(ExportService.exportToCSV).toHaveBeenCalledWith(
        mockData,
        expect.arrayContaining([
          expect.objectContaining({ key: 'fullName', header: 'Full Name' }),
        ]),
        expect.any(Object)
      )
    })

    it('applies default formatters for different data types', () => {
      const { result } = renderHook(() => useExport(mockData, mockColumns))

      act(() => {
        result.current.exportToCSV()
      })

      const exportColumns = vi.mocked(ExportService.exportToCSV).mock.calls[0][1]
      
      // Test formatter for different value types
      const formatter = exportColumns[0].formatter
      if (formatter) {
        expect(formatter(null)).toBe('')
        expect(formatter(undefined)).toBe('')
        expect(formatter(true)).toBe('Yes')
        expect(formatter(false)).toBe('No')
        expect(formatter(new Date('2023-01-01'))).toMatch(/2023/)
        expect(formatter(12345)).toBe('12,345')
        expect(formatter('test')).toBe('test')
      }
    })
  })

  describe('clearError', () => {
    it('clears error state', async () => {
      const error = new Error('Test error')
      vi.mocked(ExportService.exportToCSV).mockImplementationOnce(() => {
        throw error
      })

      const { result } = renderHook(() => useExport(mockData, mockColumns))

      await act(async () => {
        await result.current.exportToCSV()
      })

      expect(result.current.error).toBe('Test error')

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('with empty data', () => {
    it('handles empty data array', async () => {
      const { result } = renderHook(() => useExport([], mockColumns))

      await act(async () => {
        await result.current.exportToCSV()
      })

      expect(ExportService.exportToCSV).toHaveBeenCalledWith(
        [],
        expect.any(Array),
        expect.any(Object)
      )
    })
  })

  describe('with custom cell renderers', () => {
    it('ignores custom cell renderers for export', () => {
      const columnsWithCells = [
        {
          id: 'name',
          header: 'Name',
          accessorKey: 'name' as keyof typeof mockData[0],
          cell: ({ getValue }: any) => `Custom: ${getValue()}`,
        },
      ]

      const { result } = renderHook(() => useExport(mockData, columnsWithCells))

      act(() => {
        result.current.exportToCSV()
      })

      const exportColumns = vi.mocked(ExportService.exportToCSV).mock.calls[0][1]
      expect(exportColumns[0].formatter).toBeUndefined()
    })
  })
})