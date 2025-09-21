import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Text,
  VStack,
  HStack,
  Box
} from '@chakra-ui/react'

export interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColorScheme?: string
  isDestructive?: boolean
  isLoading?: boolean
  children?: React.ReactNode
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColorScheme,
  isDestructive = false,
  isLoading = false,
  children
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  const [isConfirming, setIsConfirming] = React.useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error('Confirmation action failed:', error)
    } finally {
      setIsConfirming(false)
    }
  }

  const getConfirmColorScheme = () => {
    if (confirmColorScheme) return confirmColorScheme
    return isDestructive ? 'red' : 'blue'
  }

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>

          <AlertDialogBody>
            <VStack spacing={4} align="stretch">
              <Text>{message}</Text>
              {children}
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter>
            <HStack spacing={3}>
              <Button
                ref={cancelRef}
                onClick={onClose}
                disabled={isConfirming || isLoading}
              >
                {cancelText}
              </Button>
              <Button
                colorScheme={getConfirmColorScheme()}
                onClick={handleConfirm}
                isLoading={isConfirming || isLoading}
                loadingText="Processing..."
              >
                {confirmText}
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

// Hook for easy confirmation dialogs
export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const [dialogProps, setDialogProps] = React.useState<Partial<ConfirmationDialogProps>>({})

  const confirm = React.useCallback((props: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    return new Promise<boolean>((resolve) => {
      setDialogProps({
        ...props,
        onConfirm: async () => {
          try {
            await props.onConfirm()
            resolve(true)
          } catch (error) {
            resolve(false)
            throw error
          }
        }
      })
      onOpen()
    })
  }, [onOpen])

  const ConfirmationComponent = React.useMemo(() => {
    if (!isOpen) return null
    
    return (
      <ConfirmationDialog
        isOpen={isOpen}
        onClose={onClose}
        {...dialogProps}
      />
    )
  }, [isOpen, onClose, dialogProps])

  return {
    confirm,
    ConfirmationComponent
  }
}

// Predefined confirmation dialogs for common actions
export const useDeleteConfirmation = () => {
  const { confirm, ConfirmationComponent } = useConfirmation()

  const confirmDelete = React.useCallback((
    itemName: string,
    onDelete: () => void | Promise<void>
  ) => {
    return confirm({
      title: 'Delete Item',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: onDelete
    })
  }, [confirm])

  return {
    confirmDelete,
    ConfirmationComponent
  }
}

export const useLogoutConfirmation = () => {
  const { confirm, ConfirmationComponent } = useConfirmation()

  const confirmLogout = React.useCallback((onLogout: () => void | Promise<void>) => {
    return confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out? Any unsaved changes will be lost.',
      confirmText: 'Sign Out',
      cancelText: 'Stay Signed In',
      confirmColorScheme: 'orange',
      onConfirm: onLogout
    })
  }, [confirm])

  return {
    confirmLogout,
    ConfirmationComponent
  }
}

export const useDiscardChangesConfirmation = () => {
  const { confirm, ConfirmationComponent } = useConfirmation()

  const confirmDiscardChanges = React.useCallback((onDiscard: () => void | Promise<void>) => {
    return confirm({
      title: 'Discard Changes',
      message: 'You have unsaved changes. Are you sure you want to discard them?',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      isDestructive: true,
      onConfirm: onDiscard
    })
  }, [confirm])

  return {
    confirmDiscardChanges,
    ConfirmationComponent
  }
}