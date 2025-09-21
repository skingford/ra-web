import React from 'react'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
  Button,
  HStack,
  VStack,
  Text,
  Progress
} from '@chakra-ui/react'
import { Notification } from '../../stores/notificationStore'

interface ToastNotificationProps {
  notification: Notification
  onClose: (id: string) => void
  showProgress?: boolean
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  showProgress = true
}) => {
  const [progress, setProgress] = React.useState(100)
  const [isVisible, setIsVisible] = React.useState(true)

  const bgColor = 'white'
  const borderColor = 'gray.200'

  React.useEffect(() => {
    if (notification.duration && notification.duration > 0 && showProgress) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - (100 / (notification.duration! / 100))
          if (newProgress <= 0) {
            clearInterval(interval)
            return 0
          }
          return newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [notification.duration, showProgress])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(notification.id), 200) // Allow animation to complete
  }

  const getStatusColor = () => {
    switch (notification.type) {
      case 'success': return 'green'
      case 'error': return 'red'
      case 'warning': return 'orange'
      case 'info': return 'blue'
      default: return 'gray'
    }
  }

  return (
    <Box
      transform={isVisible ? 'translateX(0)' : 'translateX(100%)'}
      opacity={isVisible ? 1 : 0}
      transition="all 0.2s ease-in-out"
      mb={3}
      maxW="400px"
      w="full"
    >
      <Alert
        status={notification.type}
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        boxShadow="lg"
        position="relative"
        overflow="hidden"
      >
        <AlertIcon />
        <Box flex="1" mr={notification.isClosable ? 8 : 0}>
          {notification.title && (
            <AlertTitle fontSize="sm" fontWeight="semibold">
              {notification.title}
            </AlertTitle>
          )}
          <AlertDescription fontSize="sm">
            {notification.message}
          </AlertDescription>
          
          {notification.action && (
            <Button
              size="xs"
              variant="outline"
              colorScheme={getStatusColor()}
              mt={2}
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </Button>
          )}
        </Box>

        {notification.isClosable && (
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            size="sm"
            onClick={handleClose}
          />
        )}

        {showProgress && notification.duration && notification.duration > 0 && (
          <Progress
            value={progress}
            size="xs"
            colorScheme={getStatusColor()}
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="transparent"
          />
        )}
      </Alert>
    </Box>
  )
}