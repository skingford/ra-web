import React, { useState } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Separator,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Badge,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react'
import { useNotifications } from '../stores/notificationStore'
import { ToastContainer } from './notifications'
import {
  LoadingSpinner,
  ProgressBar,
  CircularProgressIndicator,
  SkeletonLoader,
  LoadingOverlay,
  LoadingButton
} from './feedback/LoadingStates'
import {
  useConfirmation,
  useDeleteConfirmation,
  useLogoutConfirmation,
  useDiscardChangesConfirmation
} from './feedback/ConfirmationDialog'

export const NotificationFeedbackDemo: React.FC = () => {
  const notifications = useNotifications()
  const [customMessage, setCustomMessage] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'warning' | 'info'>('info')
  const [duration, setDuration] = useState(5000)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showSkeleton, setShowSkeleton] = useState(true)
  
  // Confirmation dialogs
  const { confirm, ConfirmationComponent } = useConfirmation()
  const { confirmDelete, ConfirmationComponent: DeleteConfirmation } = useDeleteConfirmation()
  const { confirmLogout, ConfirmationComponent: LogoutConfirmation } = useLogoutConfirmation()
  const { confirmDiscardChanges, ConfirmationComponent: DiscardConfirmation } = useDiscardChangesConfirmation()

  const handleCustomNotification = () => {
    const message = customMessage || 'This is a custom notification'
    const options = {
      title: customTitle || undefined,
      duration: duration === 0 ? undefined : duration,
    }

    switch (notificationType) {
      case 'success':
        notifications.success(message, options)
        break
      case 'error':
        notifications.error(message, options)
        break
      case 'warning':
        notifications.warning(message, options)
        break
      case 'info':
        notifications.info(message, options)
        break
    }
  }

  const simulateProgress = () => {
    setProgress(0)
    setIsLoading(true)
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          notifications.success('Process completed successfully!')
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const handleDeleteAction = async () => {
    try {
      await confirmDelete('Important Document', async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        notifications.success('Document deleted successfully')
      })
    } catch (error) {
      notifications.error('Failed to delete document')
    }
  }

  const handleLogoutAction = async () => {
    try {
      await confirmLogout(async () => {
        // Simulate logout
        await new Promise(resolve => setTimeout(resolve, 1000))
        notifications.info('You have been signed out')
      })
    } catch (error) {
      notifications.error('Logout failed')
    }
  }

  const handleDiscardAction = async () => {
    try {
      await confirmDiscardChanges(async () => {
        // Simulate discarding changes
        await new Promise(resolve => setTimeout(resolve, 500))
        notifications.info('Changes discarded')
      })
    } catch (error) {
      notifications.error('Failed to discard changes')
    }
  }

  const handleCustomConfirmation = async () => {
    try {
      await confirm({
        title: 'Custom Action',
        message: 'This is a custom confirmation dialog. Do you want to proceed?',
        confirmText: 'Yes, Proceed',
        cancelText: 'No, Cancel',
        confirmColorScheme: 'purple',
        onConfirm: async () => {
          await new Promise(resolve => setTimeout(resolve, 1500))
          notifications.success('Custom action completed!')
        }
      })
    } catch (error) {
      notifications.error('Custom action failed')
    }
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Notification & Feedback System Demo</Heading>
          <Text color="gray.600">
            Test all notification types, loading states, and confirmation dialogs
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {/* Notifications Section */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Toast Notifications</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack wrap="wrap" spacing={2}>
                    <Button size="sm" colorScheme="green" onClick={() => notifications.success('Success! Operation completed.')}>
                      Success
                    </Button>
                    <Button size="sm" colorScheme="red" onClick={() => notifications.error('Error! Something went wrong.')}>
                      Error
                    </Button>
                    <Button size="sm" colorScheme="orange" onClick={() => notifications.warning('Warning! Please check your input.')}>
                      Warning
                    </Button>
                    <Button size="sm" colorScheme="blue" onClick={() => notifications.info('Info: Here\'s some information.')}>
                      Info
                    </Button>
                  </HStack>

                  <Separator />

                  <VStack spacing={3} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm">Custom Message</FormLabel>
                      <Input
                        size="sm"
                        placeholder="Enter custom message"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Title (optional)</FormLabel>
                      <Input
                        size="sm"
                        placeholder="Enter title"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                      />
                    </FormControl>

                    <HStack>
                      <FormControl>
                        <FormLabel fontSize="sm">Type</FormLabel>
                        <Select
                          size="sm"
                          value={notificationType}
                          onChange={(e) => setNotificationType(e.target.value as any)}
                        >
                          <option value="info">Info</option>
                          <option value="success">Success</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Duration (ms)</FormLabel>
                        <NumberInput
                          size="sm"
                          value={duration}
                          onChange={(_, value) => setDuration(value || 0)}
                          min={0}
                          max={10000}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                    </HStack>

                    <Button colorScheme="purple" onClick={handleCustomNotification}>
                      Send Custom Notification
                    </Button>

                    <Button variant="outline" onClick={notifications.clearAll}>
                      Clear All Notifications
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Loading States Section */}
          <GridItem>
            <Card>
              <CardHeader>
                <Heading size="md">Loading States</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Basic Spinner</Text>
                    <LoadingSpinner label="Loading data..." />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Progress Bar</Text>
                    <ProgressBar
                      value={progress}
                      label="Processing files"
                      colorScheme="green"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Circular Progress</Text>
                    <CircularProgressIndicator
                      value={progress}
                      label="Upload progress"
                    />
                  </Box>

                  <Button colorScheme="blue" onClick={simulateProgress} isDisabled={isLoading}>
                    Simulate Progress
                  </Button>

                  <Separator />

                  <Box>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">Skeleton Loader</Text>
                      <Switch
                        size="sm"
                        isChecked={!showSkeleton}
                        onChange={(e) => setShowSkeleton(!e.target.checked)}
                      />
                    </HStack>
                    <SkeletonLoader
                      type="card"
                      isLoaded={!showSkeleton}
                    >
                      <Box p={4} bg="blue.50" borderRadius="md">
                        <Text fontWeight="bold">Loaded Content</Text>
                        <Text fontSize="sm" color="gray.600">
                          This content appears when loading is complete.
                        </Text>
                      </Box>
                    </SkeletonLoader>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Confirmation Dialogs Section */}
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Card>
              <CardHeader>
                <Heading size="md">Confirmation Dialogs</Heading>
              </CardHeader>
              <CardBody>
                <HStack wrap="wrap" spacing={3}>
                  <Button colorScheme="red" onClick={handleDeleteAction}>
                    Delete Item
                  </Button>
                  <Button colorScheme="orange" onClick={handleLogoutAction}>
                    Sign Out
                  </Button>
                  <Button colorScheme="yellow" onClick={handleDiscardAction}>
                    Discard Changes
                  </Button>
                  <Button colorScheme="purple" onClick={handleCustomConfirmation}>
                    Custom Confirmation
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Loading Overlay Demo */}
        <Card>
          <CardHeader>
            <Heading size="md">Loading Overlay</Heading>
          </CardHeader>
          <CardBody>
            <LoadingOverlay isLoading={isLoading} message="Processing your request...">
              <Box p={8} bg="gray.50" borderRadius="md" textAlign="center">
                <Text fontSize="lg" fontWeight="medium" mb={2}>
                  Content Area
                </Text>
                <Text color="gray.600">
                  This content will be overlaid with a loading spinner when processing.
                </Text>
                <Button mt={4} onClick={() => {
                  setIsLoading(true)
                  setTimeout(() => setIsLoading(false), 3000)
                }}>
                  Trigger Loading Overlay
                </Button>
              </Box>
            </LoadingOverlay>
          </CardBody>
        </Card>
      </VStack>

      {/* Toast Container */}
      <ToastContainer position="top-right" />

      {/* Confirmation Dialog Components */}
      {ConfirmationComponent}
      {DeleteConfirmation}
      {LogoutConfirmation}
      {DiscardConfirmation}
    </Box>
  )
}