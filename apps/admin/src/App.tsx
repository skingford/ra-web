import { Box, Button, Text, VStack, HStack } from '@chakra-ui/react'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  console.log('App 组件渲染中...')

  return (
    <Box p={8} minH="100vh" bg="gray.50">
      <VStack gap={6} maxW="600px" mx="auto">
        <Box bg="white" p={6} borderRadius="lg" shadow="md" w="100%">
          <Text fontSize="3xl" fontWeight="bold" color="blue.600" mb={4}>
            RA Web 管理后台
          </Text>
          <Text color="gray.600" mb={6}>
            这是一个使用 Chakra UI v3 的现代化管理界面
          </Text>
          
          <Box bg="blue.50" p={4} borderRadius="md" borderLeft="4px" borderColor="blue.500">
            <Text fontSize="lg" fontWeight="semibold" color="blue.700" mb={3}>
              计数器演示: {count}
            </Text>
            <HStack gap={3}>
              <Button 
                colorScheme="blue"
                onClick={() => setCount(count + 1)}
              >
                增加 (+1)
              </Button>
              <Button 
                variant="outline"
                colorScheme="blue"
                onClick={() => setCount(count - 1)}
              >
                减少 (-1)
              </Button>
              <Button 
                variant="ghost"
                colorScheme="blue"
                onClick={() => setCount(0)}
              >
                重置 (0)
              </Button>
            </HStack>
          </Box>
        </Box>
        
        <Box bg="white" p={6} borderRadius="lg" shadow="md" w="100%">
          <Text fontSize="xl" fontWeight="semibold" mb={4}>
            系统状态
          </Text>
          <VStack gap={3} align="stretch">
            <Box p={3} bg="green.50" borderRadius="md" borderLeft="3px" borderColor="green.500">
              <Text color="green.700">✅ Chakra UI v3 已加载</Text>
            </Box>
            <Box p={3} bg="green.50" borderRadius="md" borderLeft="3px" borderColor="green.500">
              <Text color="green.700">✅ React 组件正常渲染</Text>
            </Box>
            <Box p={3} bg="green.50" borderRadius="md" borderLeft="3px" borderColor="green.500">
              <Text color="green.700">✅ 状态管理正常工作</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  )
}

export default App
