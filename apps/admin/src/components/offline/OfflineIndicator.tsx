import React, { useState } from 'react'
import {
  Box,
  Alert,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Progress,
  Collapsible,
  Tooltip
} from '@chakra-ui/react'
import { FiWifi, FiWifiOff, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi'
import { useNetworkStatus, useOnlineStatus } from '../../hooks/useNetworkStatus'
import { useOfflineStorage } from '../../utils/offlineStorage'

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom'
  showDetails?: boolean
  onRetryOfflineOperations?: () => void
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  showDetails = true,
  onRetryOfflineOperations
}) => {
  const isOnline = useOnlineStatus()
  const networkStatus = useNetworkStatus()
  const { getOperationsCount, clearOperations } = useOfflineStorage()
  const [isOpen, setIsOpen] = useState(false)
  const onToggle = () => setIsOpen(!isOpen)
  
  const pendingOperations = getOperationsCount()

  if (isOnline && !networkStatus.isSlowConnection && pendingOperations === 0) {
    return null
  }

  const getStatusColor = () => {
    if (!isOnline) return 'red'
    if (networkStatus.isSlowConnection) return 'orange'
    if (pendingOperations > 0) return 'yellow'
    return 'green'
  }

  const getStatusMessage = () => {
    if (!isOnline) return 'You are currently offline'
    if (networkStatus.isSlowConnection) return 'Slow connection detected'
    if (pendingOperations > 0) return `${pendingOperations} operations pending sync`
    return 'Connected'
  }

  const getConnectionDetails = () => {
    if (!isOnline) return 'No internet connection'
    
    const details = []
    if (networkStatus.effectiveType !== 'unknown') {
      details.push(`Connection: ${networkStatus.effectiveType.toUpperCase()}`)
    }
    if (networkStatus.downlink > 0) {
      details.push(`Speed: ${networkStatus.downlink} Mbps`)
    }
    if (networkStatus.rtt > 0) {
      details.push(`Latency: ${networkStatus.rtt}ms`)
    }
    
    return details.join(' • ') || 'Connection details unavailable'
  }

  return (
    <Box
      position="fixed"
      left={0}
      right={0}
      zIndex={1000}
      {...(position === 'top' ? { top: 0 } : { bottom: 0 })}
    >
      <Alert.Root status={getStatusColor() as any} variant="solid">
        <Alert.Icon as={FiWifiOff} />
        <Box flex="1">
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Alert.Title fontSize="sm">
                {getStatusMessage()}
              </Alert.Title>
              {showDetails && (
                <Alert.Description fontSize="xs">
                  {getConnectionDetails()}
                </Alert.Description>
              )}
            </VStack>
            
            <HStack spacing={2}>
              {pendingOperations > 0 && (
                <Tooltip label={`${pendingOperations} operations waiting to sync`}>
                  <Badge colorScheme="white" variant="outline" size="sm">
                    {pendingOperations}
                  </Badge>
                </Tooltip>
              )}
              
              {showDetails && (
                <Button size="xs" variant="ghost" onClick={onToggle}>
                  {isOpen ? 'Hide' : 'Details'}
                </Button>
              )}
              
              {pendingOperations > 0 && onRetryOfflineOperations && (
                <Button 
                  size="xs" 
                  variant="outline" 
                  onClick={onRetryOfflineOperations}
                  isDisabled={!isOnline}
                >
                  Retry
                </Button>
              )}
              
              {pendingOperations > 0 && (
                <Button 
                  size="xs" 
                  variant="ghost" 
                  onClick={clearOperations}
                >
                  Clear
                </Button>
              )}
            </HStack>
          </HStack>
        </Box>
      </Alert.Root>
      
      {showDetails && (
        <Collapsible.Root open={isOpen}>
          <Collapsible.Content>
          <Box bg="gray.50" p={4} borderBottom="1px" borderColor="gray.200">
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="semibold" mb={2}>
                  Network Status
                </Text>
                <VStack spacing={1} align="stretch" fontSize="xs">
                  <HStack justify="space-between">
                    <Text>Status:</Text>
                    <Badge colorScheme={isOnline ? 'green' : 'red'} size="sm">
                      {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </HStack>
                  {isOnline && (
                    <>
                      <HStack justify="space-between">
                        <Text>Connection Type:</Text>
                        <Text>{networkStatus.connectionType || 'Unknown'}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Effective Type:</Text>
                        <Text>{networkStatus.effectiveType || 'Unknown'}</Text>
                      </HStack>
                      {networkStatus.downlink > 0 && (
                        <HStack justify="space-between">
                          <Text>Download Speed:</Text>
                          <Text>{networkStatus.downlink} Mbps</Text>
                        </HStack>
                      )}
                      {networkStatus.rtt > 0 && (
                        <HStack justify="space-between">
                          <Text>Round Trip Time:</Text>
                          <Text>{networkStatus.rtt}ms</Text>
                        </HStack>
                      )}
                    </>
                  )}
                </VStack>
              </Box>
              
              {pendingOperations > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    Offline Operations
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {pendingOperations} operations are queued and will be processed when connection is restored.
                  </Text>
                  {!isOnline && (
                    <Progress 
                      size="xs" 
                      isIndeterminate 
                      colorScheme="blue" 
                      mt={2}
                    />
                  )}
                </Box>
              )}
            </VStack>
          </Box>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </Box>
  )
}

// Compact version for status bars
export const CompactOfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus()
  const networkStatus = useNetworkStatus()
  const { getOperationsCount } = useOfflineStorage()
  
  const pendingOperations = getOperationsCount()

  if (isOnline && !networkStatus.isSlowConnection && pendingOperations === 0) {
    return (
      <Tooltip label="Online">
        <Badge colorScheme="green" size="sm">
          ●
        </Badge>
      </Tooltip>
    )
  }

  const getStatusInfo = () => {
    if (!isOnline) return { color: 'red', label: 'Offline' }
    if (networkStatus.isSlowConnection) return { color: 'orange', label: 'Slow Connection' }
    if (pendingOperations > 0) return { color: 'yellow', label: `${pendingOperations} Pending` }
    return { color: 'green', label: 'Online' }
  }

  const status = getStatusInfo()

  return (
    <Tooltip label={status.label}>
      <HStack spacing={1}>
        <Badge colorScheme={status.color} size="sm">
          ●
        </Badge>
        {pendingOperations > 0 && (
          <Badge colorScheme="gray" size="sm">
            {pendingOperations}
          </Badge>
        )}
      </HStack>
    </Tooltip>
  )
}