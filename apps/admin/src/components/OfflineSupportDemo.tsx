import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Alert,
  Code,
  Separator,
  Grid,
  GridItem,
  Progress,
  List,
  ListItem,
  ListIcon,
  Textarea,
  Input,
  FormControl,
  FormLabel,
  Select
} from '@chakra-ui/react'
import { useNetworkStatus, useOnlineStatus } from '../hooks/useNetworkStatus'
import { useOfflineStorage } from '../utils/offlineStorage'
import { RetryMechanism, useRetry, CircuitBreaker } from '../utils/retryMechanism'
import { OfflineApiClient } from '../utils/offlineStorage'
import { OfflineIndicator, CompactOfflineIndicator } from './offline/OfflineIndicator'
import { useNotifications } from '../stores/notificationStore'

export const OfflineSupportDemo: React.FC = () => {
  const isOnline = useOnlineStatus()
  const networkStatus = useNetworkStatus()
  const notifications = useNotifications()
  const { retry } = useRetry()
  const {
    addOperation,
    getOperations,
    removeOperation,
    clearOperations,
    getOperationsCount
  } = useOfflineStorage()

  // Demo state
  const [apiClient] = useState(() => new OfflineApiClient())
  const [circuitBreaker] = useState(() => new CircuitBreaker(3, 5000))
  const [retryResults, setRetryResults] = useState<any[]>([])
  const [operationData, setOperationData] = useState('')
  const [operationType, setOperationType] = useState('create')
  const [operationPriority, setOperationPriority] = useState<'low' | 'medium' | 'high'>('medium')

  // Refresh operations list
  const [operations, setOperations] = useState(getOperations())
  
  useEffect(() => {
    const interval = setInterval(() => {
      setOperations(getOperations())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [getOperations])

  const simulateNetworkRequest = async (shouldFail = false) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error('Network request failed'))
        } else {
          resolve({ data: 'Success!', timestamp: Date.now() })
        }
      }, Math.random() * 2000 + 500)
    })
  }

  const testRetryMechanism = async (shouldFail = false) => {
    try {
      const result = await retry(
        () => simulateNetworkRequest(shouldFail),
        {
          maxAttempts: 3,
          baseDelay: 1000,
          onRetry: (attempt, error) => {
            notifications.warning(`Retry attempt ${attempt}: ${error.message}`)
          }
        }
      )

      setRetryResults(prev => [...prev, result])
      
      if (result.success) {
        notifications.success(`Request succeeded after ${result.attempts} attempts`)
      } else {
        notifications.error(`Request failed after ${result.attempts} attempts`)
      }
    } catch (error) {
      notifications.error('Retry mechanism failed')
    }
  }

  const testCircuitBreaker = async () => {
    try {
      const result = await circuitBreaker.execute(() => simulateNetworkRequest(Math.random() > 0.5))
      notifications.success('Circuit breaker request succeeded')
    } catch (error) {
      notifications.error(`Circuit breaker: ${error.message}`)
    }
  }

  const testOfflineApiClient = async () => {
    try {
      await apiClient.request('/api/test', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'Content-Type': 'application/json' },
        priority: 'high'
      })
      notifications.success('API request succeeded')
    } catch (error) {
      notifications.info('API request queued for offline processing')
    }
  }

  const addOfflineOperation = () => {
    if (!operationData.trim()) {
      notifications.warning('Please enter operation data')
      return
    }

    const id = addOperation({
      type: operationType,
      data: { content: operationData },
      priority: operationPriority,
      maxRetries: 3
    })

    notifications.success(`Operation ${id} added to offline queue`)
    setOperationData('')
  }

  const retryOfflineOperations = async () => {
    const ops = getOperations()
    let successCount = 0
    
    for (const op of ops) {
      try {
        // Simulate processing the operation
        await simulateNetworkRequest(false)
        removeOperation(op.id)
        successCount++
      } catch (error) {
        // Operation failed, it will be retried later
      }
    }
    
    if (successCount > 0) {
      notifications.success(`${successCount} operations processed successfully`)
    } else {
      notifications.warning('No operations could be processed')
    }
  }

  const getNetworkStatusColor = () => {
    if (!isOnline) return 'red'
    if (networkStatus.isSlowConnection) return 'orange'
    return 'green'
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Offline Support & Retry Mechanisms Demo</Heading>
          <Text color="gray.600">
            Test network detection, retry mechanisms, offline storage, and circuit breakers
          </Text>
        </Box>

        {/* Offline Indicator */}
        <Card>
          <CardHeader>
            <Heading size="md">Offline Indicators</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Full Offline Indicator</Text>
                <OfflineIndicator 
                  position="top" 
                  showDetails={true}
                  onRetryOfflineOperations={retryOfflineOperations}
                />
              </Box>
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Compact Indicator</Text>
                <HStack>
                  <Text fontSize="sm">Status:</Text>
                  <CompactOfflineIndicator />
                </HStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {/* Network Status */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Network Status</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Connection:</Text>
                    <Badge colorScheme={getNetworkStatusColor()}>
                      {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </HStack>
                  
                  {isOnline && (
                    <>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Type:</Text>
                        <Text fontSize="sm">{networkStatus.connectionType || 'Unknown'}</Text>
                      </HStack>
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">Effective Type:</Text>
                        <Text fontSize="sm">{networkStatus.effectiveType || 'Unknown'}</Text>
                      </HStack>
                      
                      {networkStatus.downlink > 0 && (
                        <HStack justify="space-between">
                          <Text fontSize="sm">Speed:</Text>
                          <Text fontSize="sm">{networkStatus.downlink} Mbps</Text>
                        </HStack>
                      )}
                      
                      {networkStatus.rtt > 0 && (
                        <HStack justify="space-between">
                          <Text fontSize="sm">Latency:</Text>
                          <Text fontSize="sm">{networkStatus.rtt}ms</Text>
                        </HStack>
                      )}
                      
                      <HStack justify="space-between">
                        <Text fontSize="sm">Slow Connection:</Text>
                        <Badge colorScheme={networkStatus.isSlowConnection ? 'orange' : 'green'}>
                          {networkStatus.isSlowConnection ? 'Yes' : 'No'}
                        </Badge>
                      </HStack>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Retry Mechanism */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Retry Mechanism</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack wrap="wrap" spacing={2}>
                    <Button 
                      size="sm" 
                      colorScheme="green"
                      onClick={() => testRetryMechanism(false)}
                    >
                      Test Success
                    </Button>
                    <Button 
                      size="sm" 
                      colorScheme="red"
                      onClick={() => testRetryMechanism(true)}
                    >
                      Test Failure
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setRetryResults([])}
                    >
                      Clear Results
                    </Button>
                  </HStack>

                  {retryResults.length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Recent Results:</Text>
                      <List spacing={1} fontSize="xs">
                        {retryResults.slice(-3).map((result, index) => (
                          <ListItem key={index}>
                            <ListIcon color={result.success ? 'green.500' : 'red.500'}>
                              {result.success ? '✓' : '✗'}
                            </ListIcon>
                            {result.success ? 'Success' : 'Failed'} - {result.attempts} attempts ({result.totalTime}ms)
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Circuit Breaker */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Circuit Breaker</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">State:</Text>
                    <Badge colorScheme={
                      circuitBreaker.getState().state === 'CLOSED' ? 'green' :
                      circuitBreaker.getState().state === 'HALF_OPEN' ? 'yellow' : 'red'
                    }>
                      {circuitBreaker.getState().state}
                    </Badge>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm">Failures:</Text>
                    <Text fontSize="sm">{circuitBreaker.getState().failures}</Text>
                  </HStack>

                  <HStack wrap="wrap" spacing={2}>
                    <Button size="sm" onClick={testCircuitBreaker}>
                      Test Request
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => circuitBreaker.reset()}
                    >
                      Reset
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Offline Operations */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Offline Operations</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Pending Operations:</Text>
                    <Badge colorScheme={getOperationsCount() > 0 ? 'orange' : 'green'}>
                      {getOperationsCount()}
                    </Badge>
                  </HStack>

                  <VStack spacing={2} align="stretch">
                    <FormControl size="sm">
                      <FormLabel fontSize="xs">Operation Type</FormLabel>
                      <Select 
                        size="sm"
                        value={operationType}
                        onChange={(e) => setOperationType(e.target.value)}
                      >
                        <option value="create">Create</option>
                        <option value="update">Update</option>
                        <option value="delete">Delete</option>
                      </Select>
                    </FormControl>

                    <FormControl size="sm">
                      <FormLabel fontSize="xs">Priority</FormLabel>
                      <Select 
                        size="sm"
                        value={operationPriority}
                        onChange={(e) => setOperationPriority(e.target.value as any)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Select>
                    </FormControl>

                    <FormControl size="sm">
                      <FormLabel fontSize="xs">Data</FormLabel>
                      <Textarea
                        size="sm"
                        placeholder="Enter operation data"
                        value={operationData}
                        onChange={(e) => setOperationData(e.target.value)}
                        rows={2}
                      />
                    </FormControl>
                  </VStack>

                  <HStack wrap="wrap" spacing={2}>
                    <Button size="sm" onClick={addOfflineOperation}>
                      Add Operation
                    </Button>
                    <Button 
                      size="sm" 
                      colorScheme="blue"
                      onClick={retryOfflineOperations}
                      isDisabled={!isOnline || getOperationsCount() === 0}
                    >
                      Retry All
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={clearOperations}
                    >
                      Clear All
                    </Button>
                  </HStack>

                  {operations.length > 0 && (
                    <Box>
                      <Text fontSize="xs" fontWeight="medium" mb={2}>Queued Operations:</Text>
                      <List spacing={1} fontSize="xs" maxH="100px" overflowY="auto">
                        {operations.slice(0, 5).map((op) => (
                          <ListItem key={op.id}>
                            <HStack justify="space-between">
                              <Text>{op.type}</Text>
                              <Badge size="xs" colorScheme={
                                op.priority === 'high' ? 'red' :
                                op.priority === 'medium' ? 'orange' : 'gray'
                              }>
                                {op.priority}
                              </Badge>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* API Client Test */}
        <Card>
          <CardHeader>
            <Heading size="md">Offline-Aware API Client</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Alert.Root status="info" size="sm">
                <Alert.Icon />
                <Alert.Description fontSize="sm">
                  The API client automatically queues requests when offline and retries them when connection is restored.
                </Alert.Description>
              </Alert.Root>

              <HStack wrap="wrap" spacing={2}>
                <Button onClick={testOfflineApiClient}>
                  Test API Request
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => apiClient.clearPendingOperations()}
                >
                  Clear API Queue
                </Button>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm">Pending API Operations:</Text>
                <Badge>{apiClient.getPendingOperationsCount()}</Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Instructions */}
        <Alert.Root status="info">
          <Alert.Icon />
          <Box>
            <Alert.Title>Testing Instructions</Alert.Title>
            <Alert.Description>
              <List spacing={1} fontSize="sm" mt={2}>
                <ListItem>• Use browser dev tools to simulate offline mode (Network tab → Offline)</ListItem>
                <ListItem>• Add operations while offline to see them queued</ListItem>
                <ListItem>• Go back online to see automatic retry mechanisms</ListItem>
                <ListItem>• Test circuit breaker by triggering multiple failures</ListItem>
              </List>
            </Alert.Description>
          </Box>
        </Alert.Root>
      </VStack>
    </Box>
  )
}