import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Card,
  Alert,
  Badge,
  Separator,
} from '@chakra-ui/react'
import { FiEye, FiKeyboard, FiVolume2, FiSettings } from 'react-icons/fi'
import { useAccessibility } from '../contexts/AccessibilityContext'
import { AccessibilitySettings } from '../components/accessibility/AccessibilitySettings'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'

export const AccessibilityDemo: React.FC = () => {
  const { settings, announceToScreenReader } = useAccessibility()
  const [showSettings, setShowSettings] = useState(false)
  const [testInput, setTestInput] = useState('')
  
  const { containerRef } = useKeyboardNavigation({
    selector: 'button, input',
    loop: true,
  })

  const handleTestAction = (action: string) => {
    announceToScreenReader(`${action} button activated`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTestInput(e.target.value)
    if (e.target.value.length > 0) {
      announceToScreenReader(`Input contains ${e.target.value.length} characters`)
    }
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack gap={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            Accessibility Features Demo
          </Heading>
          <Text color="neutral.600" fontSize="lg">
            This page demonstrates the accessibility features implemented in the admin dashboard.
          </Text>
        </Box>

        {/* Current Settings Display */}
        <Card.Root>
          <Card.Header>
            <HStack>
              <FiSettings />
              <Heading size="lg">Current Accessibility Settings</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text>High Contrast Mode:</Text>
                <Badge colorScheme={settings.highContrast ? 'green' : 'gray'}>
                  {settings.highContrast ? 'Enabled' : 'Disabled'}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Reduced Motion:</Text>
                <Badge colorScheme={settings.reducedMotion ? 'green' : 'gray'}>
                  {settings.reducedMotion ? 'Enabled' : 'Disabled'}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Font Size:</Text>
                <Badge colorScheme="blue">{settings.fontSize}</Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Enhanced Focus:</Text>
                <Badge colorScheme={settings.focusVisible ? 'green' : 'gray'}>
                  {settings.focusVisible ? 'Enabled' : 'Disabled'}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <Text>Screen Reader Announcements:</Text>
                <Badge colorScheme={settings.screenReaderAnnouncements ? 'green' : 'gray'}>
                  {settings.screenReaderAnnouncements ? 'Enabled' : 'Disabled'}
                </Badge>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Keyboard Navigation Demo */}
        <Card.Root>
          <Card.Header>
            <HStack>
              <FiKeyboard />
              <Heading size="lg">Keyboard Navigation Demo</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Text>
                Use Tab, Arrow keys, Enter, and Space to navigate through these elements.
                The container below has enhanced keyboard navigation enabled.
              </Text>
              
              <Box
                ref={containerRef}
                p={4}
                border="2px dashed"
                borderColor="brand.200"
                borderRadius="md"
                bg="brand.50"
                _dark={{ bg: 'brand.900', borderColor: 'brand.700' }}
              >
                <VStack gap={3}>
                  <HStack gap={3} wrap="wrap">
                    <Button onClick={() => handleTestAction('First')}>
                      First Button
                    </Button>
                    <Button onClick={() => handleTestAction('Second')}>
                      Second Button
                    </Button>
                    <Button onClick={() => handleTestAction('Third')}>
                      Third Button
                    </Button>
                  </HStack>
                  
                  <Input
                    placeholder="Type here to test input accessibility"
                    value={testInput}
                    onChange={handleInputChange}
                    aria-label="Test input field"
                  />
                  
                  <HStack gap={3}>
                    <Button variant="outline" onClick={() => handleTestAction('Cancel')}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleTestAction('Submit')}>
                      Submit
                    </Button>
                  </HStack>
                </VStack>
              </Box>
              
              <Alert.Root status="info">
                <Alert.Title>Keyboard Navigation Tips</Alert.Title>
                <Alert.Description>
                  • Use Tab to move forward through focusable elements
                  • Use Shift+Tab to move backward
                  • Use Arrow keys for enhanced navigation within this container
                  • Use Enter or Space to activate buttons
                  • Use Escape to exit menus or modals
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Screen Reader Demo */}
        <Card.Root>
          <Card.Header>
            <HStack>
              <FiVolume2 />
              <Heading size="lg">Screen Reader Announcements Demo</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Text>
                Click these buttons to test screen reader announcements.
                If you have a screen reader enabled, you should hear the announcements.
              </Text>
              
              <HStack gap={3} wrap="wrap">
                <Button
                  onClick={() => announceToScreenReader('This is a polite announcement', 'polite')}
                >
                  Polite Announcement
                </Button>
                <Button
                  onClick={() => announceToScreenReader('This is an assertive announcement!', 'assertive')}
                  colorScheme="orange"
                >
                  Assertive Announcement
                </Button>
                <Button
                  onClick={() => announceToScreenReader('Action completed successfully')}
                  colorScheme="green"
                >
                  Success Message
                </Button>
              </HStack>
              
              <Alert.Root status="info">
                <Alert.Title>Screen Reader Information</Alert.Title>
                <Alert.Description>
                  Screen reader announcements are made using ARIA live regions.
                  Polite announcements wait for the user to finish their current task,
                  while assertive announcements interrupt immediately.
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Visual Accessibility Demo */}
        <Card.Root>
          <Card.Header>
            <HStack>
              <FiEye />
              <Heading size="lg">Visual Accessibility Demo</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Text>
                The following elements demonstrate proper color contrast, focus indicators,
                and semantic markup for visual accessibility.
              </Text>
              
              <VStack gap={3} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={2}>Links with proper contrast:</Text>
                  <HStack gap={4}>
                    <Text as="a" href="#" color="brand.500" textDecoration="underline">
                      Primary Link
                    </Text>
                    <Text as="a" href="#" color="success.500" textDecoration="underline">
                      Success Link
                    </Text>
                    <Text as="a" href="#" color="error.500" textDecoration="underline">
                      Error Link
                    </Text>
                  </HStack>
                </Box>
                
                <Separator />
                
                <Box>
                  <Text fontWeight="semibold" mb={2}>Status indicators:</Text>
                  <HStack gap={3}>
                    <Badge colorScheme="green">Active</Badge>
                    <Badge colorScheme="yellow">Pending</Badge>
                    <Badge colorScheme="red">Inactive</Badge>
                    <Badge colorScheme="gray">Unknown</Badge>
                  </HStack>
                </Box>
                
                <Separator />
                
                <Box>
                  <Text fontWeight="semibold" mb={2}>Form elements with proper labels:</Text>
                  <VStack gap={3} align="stretch" maxW="400px">
                    <Box>
                      <Text as="label" htmlFor="demo-name" fontWeight="medium" mb={1} display="block">
                        Full Name *
                      </Text>
                      <Input
                        id="demo-name"
                        placeholder="Enter your full name"
                        aria-required="true"
                        aria-describedby="name-help"
                      />
                      <Text id="name-help" fontSize="sm" color="neutral.600" mt={1}>
                        This field is required for account creation
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text as="label" htmlFor="demo-email" fontWeight="medium" mb={1} display="block">
                        Email Address
                      </Text>
                      <Input
                        id="demo-email"
                        type="email"
                        placeholder="Enter your email"
                        aria-describedby="email-help"
                      />
                      <Text id="email-help" fontSize="sm" color="neutral.600" mt={1}>
                        We'll never share your email with anyone else
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Settings Panel */}
        <Card.Root>
          <Card.Header>
            <Heading size="lg">Accessibility Settings</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Text>
                Adjust accessibility settings to customize your experience.
                Changes are automatically saved and applied.
              </Text>
              
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant={showSettings ? 'solid' : 'outline'}
              >
                {showSettings ? 'Hide Settings' : 'Show Settings'}
              </Button>
              
              {showSettings && (
                <Box mt={4}>
                  <AccessibilitySettings />
                </Box>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
}