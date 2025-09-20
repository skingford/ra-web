import { Box, Button, Card, Heading, Text, VStack, HStack, Tabs } from '@chakra-ui/react'
import { useState } from 'react'
import { ThemeDemo } from './components/ThemeDemo'
import { Dashboard } from './pages/Dashboard'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Box minH="100vh" bg="neutral.50">
      <Tabs.Root defaultValue="dashboard" variant="enclosed">
        <Box bg="white" borderBottom="1px" borderColor="neutral.200" px={6} py={4}>
          <Heading size="lg" color="brand.600" mb={4}>
            RA Web 管理后台
          </Heading>
          <Tabs.List>
            <Tabs.Trigger value="dashboard">仪表板</Tabs.Trigger>
            <Tabs.Trigger value="widgets">数据可视化</Tabs.Trigger>
            <Tabs.Trigger value="theme">主题演示</Tabs.Trigger>
          </Tabs.List>
        </Box>

        <Tabs.Content value="dashboard" p={6}>
          <VStack gap={6} align="stretch" maxW="800px" mx="auto">
            <Card.Root>
              <Card.Header>
                <Heading size="md">欢迎使用管理后台</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={4} align="stretch">
                  <Text color="neutral.600">
                    这是一个使用 Chakra UI 主题系统的现代化管理界面示例
                  </Text>
                  
                  <Box p={4} bg="brand.50" borderRadius="md" borderLeft="4px" borderColor="brand.500">
                    <Text fontWeight="semibold" color="brand.700" mb={2}>
                      计数器演示: {count}
                    </Text>
                    <HStack gap={3}>
                      <Button 
                        variant="solid" 
                        size="sm"
                        onClick={() => setCount(count + 1)}
                      >
                        增加
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setCount(count - 1)}
                      >
                        减少
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCount(0)}
                      >
                        重置
                      </Button>
                    </HStack>
                  </Box>
                </VStack>
              </Card.Body>
            </Card.Root>
            
            <Card.Root>
              <Card.Header>
                <Heading size="md">功能列表</Heading>
              </Card.Header>
              <Card.Body>
                <VStack gap={3} align="stretch">
                  <HStack p={3} bg="success.50" borderRadius="md" borderLeft="3px" borderColor="success.500">
                    <Text fontWeight="medium" color="success.700">✓ 用户管理</Text>
                  </HStack>
                  <HStack p={3} bg="warning.50" borderRadius="md" borderLeft="3px" borderColor="warning.500">
                    <Text fontWeight="medium" color="warning.700">⚠ 系统设置</Text>
                  </HStack>
                  <HStack p={3} bg="brand.50" borderRadius="md" borderLeft="3px" borderColor="brand.500">
                    <Text fontWeight="medium" color="brand.700">📊 数据分析</Text>
                  </HStack>
                  <HStack p={3} bg="neutral.100" borderRadius="md" borderLeft="3px" borderColor="neutral.400">
                    <Text fontWeight="medium" color="neutral.700">📝 内容管理</Text>
                  </HStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="widgets">
          <Dashboard />
        </Tabs.Content>

        <Tabs.Content value="theme">
          <ThemeDemo />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}

export default App
