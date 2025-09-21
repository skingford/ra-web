import React from 'react'
import {
  Box,
  Button,
  IconButton,
  Text,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
}

const sizeMap = {
  sm: '400px',
  md: '500px',
  lg: '600px',
  xl: '800px',
  full: '90vw',
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}) => {
  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose()
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
      onClick={handleOverlayClick}
    >
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="xl"
        maxW={sizeMap[size]}
        w="full"
        mx={4}
        maxH="90vh"
        overflow="hidden"
        _dark={{ bg: 'gray.800' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <HStack
            justify="space-between"
            align="center"
            px={6}
            py={4}
            borderBottom="1px"
            borderColor="gray.200"
            _dark={{ borderColor: 'gray.600' }}
          >
            <Text fontSize="lg" fontWeight="semibold">
              {title}
            </Text>
            <IconButton
              aria-label="关闭对话框"
              children={<FiX />}
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          </HStack>
        )}

        {/* Body */}
        <Box
          px={6}
          py={4}
          maxH={title || footer ? 'calc(90vh - 120px)' : 'calc(90vh - 60px)'}
          overflowY="auto"
        >
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Box
            px={6}
            py={4}
            borderTop="1px"
            borderColor="gray.200"
            _dark={{ borderColor: 'gray.600' }}
          >
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  )
}

// 便捷的确认对话框组件
interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColorScheme?: string
  isLoading?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '确认操作',
  message,
  confirmText = '确认',
  cancelText = '取消',
  confirmColorScheme = 'red',
  isLoading = false,
}) => {
  const handleConfirm = () => {
    onConfirm()
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <HStack justify="flex-end" gap={3}>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            colorScheme={confirmColorScheme}
            onClick={handleConfirm}
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </HStack>
      }
    >
      <Text>{message}</Text>
    </Dialog>
  )
}

// Hook for managing dialog state
export const useDialog = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen)

  const onOpen = React.useCallback(() => setIsOpen(true), [])
  const onClose = React.useCallback(() => setIsOpen(false), [])
  const onToggle = React.useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
    setIsOpen,
  }
}