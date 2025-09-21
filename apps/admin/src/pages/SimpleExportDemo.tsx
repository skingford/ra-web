import { useState, useMemo } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Alert,
  Spinner,
} from '@chakra-ui/react'
import { FiDownload } from 'react-icons/fi'
import { DataTable, ColumnDef } from '../components/data/DataTable'
import { format as formatDate, subDays } from 'date-fns'

// 简化的示例数据类型
interface SimpleRecord {
  id: string
  name: string
  email: string
  status: 'active' | 'inactive'
  createdAt: Date
  count: number
}

// 生成示例数据
const generateSimpleData = (count: number): SimpleRecord[] => {
  const statuses: SimpleRecord['status'][] = ['active', 'inactive']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `record-${i + 1}`,
    name: `用户 ${i + 1}`,
    email: `user${i + 1}@example.com`,
    status: statuses[Math.floor(Math.random() * statuses.length)]!,
    createdAt: subDays(new Date(), Math.floor(Math.random() * 30)),
    count: Math.floor(Math.random() * 100) + 1,
  }))
}

export function SimpleExportDemo() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  // 示例数据
  const data = useMemo(() => generateSimpleData(50), [])

  // 列定义
  const columns: ColumnDef<SimpleRecord>[] = [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
    },
    {
      id: 'name',
      header: '姓名',
      accessorKey: 'name',
      sortable: true,
      filterable: true,
    },
    {
      id: 'email',
      header: '邮箱',
      accessorKey: 'email',
      sortable: true,
      filterable: true,
    },
    {
      id: 'status',
      header: '状态',
      accessorKey: 'status',
      cell: ({ getValue }) => {
        const status = getValue() as string
        return (
          <Badge colorScheme={status === 'active' ? 'green' : 'gray'}>
            {status === 'active' ? '活跃' : '非活跃'}
          </Badge>
        )
      },
      sortable: true,
      filterable: true,
    },
    {
      id: 'createdAt',
      header: '创建时间',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => formatDate(getValue() as Date, 'yyyy-MM-dd'),
      sortable: true,
    },
    {
      id: 'count',
      header: '数量',
      accessorKey: 'count',
      sortable: true,
      align: 'right',
    },
  ]

  // 简化的导出函数
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true)
    setExportError(null)

    try {
      // 模拟导出过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 这里应该调用实际的导出服务
      console.log(`导出 ${format} 格式，数据条数: ${data.length}`)
      
      // 创建简单的CSV导出作为演示
      if (format === 'csv') {
        const csvContent = [
          // 表头
          ['ID', '姓名', '邮箱', '状态', '创建时间', '数量'].join(','),
          // 数据行
          ...data.map(row => [
            row.id,
            row.name,
            row.email,
            row.status === 'active' ? '活跃' : '非活跃',
            formatDate(row.createdAt, 'yyyy-MM-dd'),
            row.count
          ].join(','))
        ].join('\n')

        // 创建下载链接
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `export_${formatDate(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
      
    } catch (error) {
      setExportError(error instanceof Error ? error.message : '导出失败')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <VStack gap={6} align="stretch" p={6}>
      {/* 标题 */}
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          导出功能演示
        </Text>
        <Text color="gray.600">
          简化版本的数据导出功能演示
        </Text>
      </Box>

      {/* 快速导出操作 */}
      <Card.Root>
        <Card.Body>
          <HStack justify="space-between" wrap="wrap" gap={4}>
            <HStack gap={4}>
              <Text fontWeight="medium">快速导出:</Text>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isExporting}
              >
                <FiDownload />
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={isExporting}
              >
                <FiDownload />
                Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
              >
                <FiDownload />
                PDF
              </Button>
            </HStack>

            <HStack gap={4}>
              <Text fontSize="sm" color="gray.600">
                记录数: {data.length}
              </Text>
              {isExporting && (
                <HStack gap={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm">导出中...</Text>
                </HStack>
              )}
            </HStack>
          </HStack>

          {exportError && (
            <Alert.Root status="error" mt={4}>
              <Alert.Title>导出错误</Alert.Title>
              <Alert.Description>{exportError}</Alert.Description>
            </Alert.Root>
          )}
        </Card.Body>
      </Card.Root>

      {/* 数据表格 */}
      <DataTable
        data={data}
        columns={columns}
        exportable
        onExport={(format) => handleExport(format)}
        pagination={{
          page: 1,
          pageSize: 25,
          total: data.length,
          onPageChange: () => {},
          onPageSizeChange: () => {},
        }}
        stickyHeader
        striped
      />
    </VStack>
  )
}