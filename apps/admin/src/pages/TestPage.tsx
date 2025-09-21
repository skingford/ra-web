import React from 'react'
import { Box, Text, VStack } from '@chakra-ui/react'

export default function TestPage() {
  console.log('TestPage 组件渲染中...')
  
  return (
    <Box p={8} bg="white" minH="100vh">
      <VStack gap={4} align="start">
        <Text fontSize="2xl" fontWeight="bold" color="gray.800">
          测试页面
        </Text>
        <Text color="gray.600">
          如果您能看到这个页面，说明基本渲染功能正常。
        </Text>
        <Text fontSize="sm" color="gray.500">
          时间: {new Date().toLocaleString()}
        </Text>
        <Box p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
          <Text color="green.800" fontWeight="medium">
            ✅ Chakra UI v3 基本渲染功能正常！
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
