import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'

export interface ExportColumn {
  key: string
  header: string
  width?: number
  formatter?: (value: any) => string
}

export interface ExportOptions {
  filename?: string
  title?: string
  subtitle?: string
  includeTimestamp?: boolean
  customMetadata?: Record<string, string>
}

export interface DateRangeFilter {
  startDate: Date | null
  endDate: Date | null
  field: string
}

export interface ReportConfig {
  title: string
  description?: string
  dateRange?: DateRangeFilter
  filters?: Record<string, any>
  groupBy?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeCharts?: boolean
  customSections?: ReportSection[]
}

export interface ReportSection {
  title: string
  type: 'table' | 'chart' | 'text' | 'metrics'
  data?: any
  config?: any
}

export class ExportService {
  /**
   * Export data to CSV format
   */
  static exportToCSV<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'export',
      includeTimestamp = true,
    } = options

    // Prepare headers
    const headers = columns.map(col => col.header)
    
    // Prepare data rows
    const rows = data.map(item => 
      columns.map(col => {
        const value = this.getNestedValue(item, col.key)
        return col.formatter ? col.formatter(value) : this.formatValue(value)
      })
    )

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => this.escapeCsvCell(cell)).join(','))
      .join('\n')

    // Add BOM for proper UTF-8 encoding in Excel
    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    const finalFilename = includeTimestamp 
      ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`
      : `${filename}.csv`

    this.downloadBlob(blob, finalFilename)
  }

  /**
   * Export data to Excel format
   */
  static exportToExcel<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'export',
      title,
      includeTimestamp = true,
    } = options

    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Prepare data for worksheet
    const wsData: any[][] = []
    
    // Add title if provided
    if (title) {
      wsData.push([title])
      wsData.push([]) // Empty row
    }

    // Add timestamp
    if (includeTimestamp) {
      wsData.push([`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`])
      wsData.push([]) // Empty row
    }

    // Add headers
    wsData.push(columns.map(col => col.header))

    // Add data rows
    data.forEach(item => {
      const row = columns.map(col => {
        const value = this.getNestedValue(item, col.key)
        return col.formatter ? col.formatter(value) : value
      })
      wsData.push(row)
    })

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Set column widths
    const colWidths = columns.map(col => ({ wch: col.width || 15 }))
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data')

    // Generate filename
    const finalFilename = includeTimestamp 
      ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.xlsx`
      : `${filename}.xlsx`

    // Save file
    XLSX.writeFile(wb, finalFilename)
  }

  /**
   * Export data to PDF format
   */
  static exportToPDF<T>(
    data: T[],
    columns: ExportColumn[],
    options: ExportOptions = {}
  ): void {
    const {
      filename = 'export',
      title,
      subtitle,
      includeTimestamp = true,
      customMetadata = {},
    } = options

    // Create PDF document
    const doc = new jsPDF()
    
    let yPosition = 20

    // Add title
    if (title) {
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text(title, 20, yPosition)
      yPosition += 15
    }

    // Add subtitle
    if (subtitle) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(subtitle, 20, yPosition)
      yPosition += 10
    }

    // Add timestamp
    if (includeTimestamp) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, yPosition)
      yPosition += 15
    }

    // Add custom metadata
    Object.entries(customMetadata).forEach(([key, value]) => {
      doc.setFontSize(10)
      doc.text(`${key}: ${value}`, 20, yPosition)
      yPosition += 8
    })

    if (Object.keys(customMetadata).length > 0) {
      yPosition += 10
    }

    // Prepare table data
    const tableHeaders = columns.map(col => col.header)
    const tableData = data.map(item =>
      columns.map(col => {
        const value = this.getNestedValue(item, col.key)
        return col.formatter ? col.formatter(value) : this.formatValue(value)
      })
    )

    // Add table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: columns.reduce((acc, col, index) => {
        if (col.width) {
          acc[index] = { cellWidth: col.width }
        }
        return acc
      }, {} as Record<number, any>),
    })

    // Generate filename
    const finalFilename = includeTimestamp 
      ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`
      : `${filename}.pdf`

    // Save PDF
    doc.save(finalFilename)
  }

  /**
   * Export HTML element to PDF
   */
  static async exportElementToPDF(
    element: HTMLElement,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      filename = 'export',
      includeTimestamp = true,
    } = options

    try {
      // Convert element to canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 295 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate filename
      const finalFilename = includeTimestamp 
        ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`
        : `${filename}.pdf`

      pdf.save(finalFilename)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      throw new Error('Failed to export to PDF')
    }
  }

  /**
   * Generate comprehensive report
   */
  static async generateReport(
    config: ReportConfig,
    data: any,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      filename = 'report',
      includeTimestamp = true,
    } = options

    const doc = new jsPDF()
    let yPosition = 20

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(config.title, 20, yPosition)
    yPosition += 20

    // Description
    if (config.description) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(config.description, 170)
      doc.text(lines, 20, yPosition)
      yPosition += lines.length * 6 + 10
    }

    // Date range
    if (config.dateRange && config.dateRange.startDate && config.dateRange.endDate) {
      doc.setFontSize(10)
      doc.text(
        `Date Range: ${format(config.dateRange.startDate, 'yyyy-MM-dd')} to ${format(config.dateRange.endDate, 'yyyy-MM-dd')}`,
        20,
        yPosition
      )
      yPosition += 15
    }

    // Filters
    if (config.filters && Object.keys(config.filters).length > 0) {
      doc.setFontSize(10)
      doc.text('Applied Filters:', 20, yPosition)
      yPosition += 8
      
      Object.entries(config.filters).forEach(([key, value]) => {
        if (value) {
          doc.text(`• ${key}: ${value}`, 25, yPosition)
          yPosition += 6
        }
      })
      yPosition += 10
    }

    // Custom sections
    if (config.customSections) {
      for (const section of config.customSections) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        // Section title
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(section.title, 20, yPosition)
        yPosition += 15

        // Section content based on type
        switch (section.type) {
          case 'table':
            if (section.data && Array.isArray(section.data)) {
              const tableConfig = section.config || {}
              autoTable(doc, {
                head: tableConfig.headers ? [tableConfig.headers] : undefined,
                body: section.data,
                startY: yPosition,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [66, 139, 202] },
              })
              yPosition = (doc as any).lastAutoTable.finalY + 15
            }
            break

          case 'text':
            if (section.data) {
              doc.setFontSize(10)
              doc.setFont('helvetica', 'normal')
              const lines = doc.splitTextToSize(section.data, 170)
              doc.text(lines, 20, yPosition)
              yPosition += lines.length * 6 + 10
            }
            break

          case 'metrics':
            if (section.data && typeof section.data === 'object') {
              doc.setFontSize(10)
              Object.entries(section.data).forEach(([key, value]) => {
                doc.text(`${key}: ${value}`, 20, yPosition)
                yPosition += 8
              })
              yPosition += 10
            }
            break
        }
      }
    }

    // Timestamp
    if (includeTimestamp) {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.text(
        `Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`,
        20,
        doc.internal.pageSize.height - 10
      )
    }

    // Generate filename
    const finalFilename = includeTimestamp 
      ? `${filename}_${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.pdf`
      : `${filename}.pdf`

    doc.save(finalFilename)
  }

  /**
   * Helper method to get nested object values
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Helper method to format values for display
   */
  private static formatValue(value: any): string {
    if (value === null || value === undefined) return ''
    if (value instanceof Date) return format(value, 'yyyy-MM-dd HH:mm:ss')
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'number') return value.toLocaleString()
    return String(value)
  }

  /**
   * Helper method to escape CSV cells
   */
  private static escapeCsvCell(cell: string): string {
    const cellStr = String(cell)
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`
    }
    return cellStr
  }

  /**
   * Helper method to download blob as file
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}