import React from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { useNotificationStore } from '../../stores/notificationStore'
import { ToastNotification } from './ToastNotification'

interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top' | 'bottom'
  maxNotifications?: number
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxNotifications = 5
}) => {
  const { notifications, removeNotification } = useNotificationStore()

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      pointerEvents: 'none' as const,
    }

    switch (position) {
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' }
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' }
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' }
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' }
      case 'top':
        return { ...baseStyles, top: '20px', left: '50%', transform: 'translateX(-50%)' }
      case 'bottom':
        return { ...baseStyles, bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
      default:
        return { ...baseStyles, top: '20px', right: '20px' }
    }
  }

  // Limit the number of visible notifications
  const visibleNotifications = notifications.slice(-maxNotifications)

  if (visibleNotifications.length === 0) {
    return null
  }

  return (
    <Box sx={getPositionStyles()}>
      <VStack spacing={3} align="stretch" pointerEvents="auto">
        {visibleNotifications.map((notification) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </VStack>
    </Box>
  )
}