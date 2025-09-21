import React from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Switch,
  Select,
  Button,
  Card,
  Heading,
  Separator,
  Alert,
  Badge,
} from '@chakra-ui/react'
import { FiSettings, FiEye, FiType, FiMousePointer, FiVolume2 } from 'react-icons/fi'
import { useAccessibility } from '../../contexts/AccessibilityContext'

interface AccessibilitySettingsProps {
  onClose?: () => void
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ onClose }) => {
  const { settings, updateSetting, announceToScreenReader } = useAccessibility()

  const handleSettingChange = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    updateSetting(key, value)
    announceToScreenReader(`${key} setting changed to ${value}`)
  }

  const resetToDefaults = () => {
    updateSetting('highContrast', false)
    updateSetting('reducedMotion', false)
    updateSetting('fontSize', 'medium')
    updateSetting('focusVisible', true)
    updateSetting('screenReaderAnnouncements', true)
    announceToScreenReader('Accessibility settings reset to defaults')
  }

  return (
    <Card.Root maxW="600px" w="full">
      <Card.Header>
        <HStack>
          <FiSettings />
          <Heading size="lg">Accessibility Settings</Heading>
        </HStack>
        <Text color="neutral.600" mt={2}>
          Customize the interface to meet your accessibility needs
        </Text>
      </Card.Header>

      <Card.Body>
        <VStack gap={6} align="stretch">
          {/* Visual Settings */}
          <Box>
            <HStack mb={4}>
              <FiEye />
              <Heading size="md">Visual Settings</Heading>
            </HStack>
            
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="medium">High Contrast Mode</Text>
                  <Text fontSize="sm" color="neutral.600">
                    Increases contrast for better visibility
                  </Text>
                </Box>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(e) => handleSettingChange('highContrast', !!e.checked)}
                  aria-label="Toggle high contrast mode"
                />
              </HStack>

              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="medium">Reduced Motion</Text>
                  <Text fontSize="sm" color="neutral.600">
                    Minimizes animations and transitions
                  </Text>
                </Box>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(e) => handleSettingChange('reducedMotion', !!e.checked)}
                  aria-label="Toggle reduced motion"
                />
              </HStack>

              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="medium">Font Size</Text>
                  <Text fontSize="sm" color="neutral.600">
                    Adjust text size for better readability
                  </Text>
                </Box>
                <Select.Root
                  value={settings.fontSize}
                  onValueChange={(e) => handleSettingChange('fontSize', e.value as any)}
                  width="150px"
                >
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="small">Small</Select.Item>
                    <Select.Item value="medium">Medium</Select.Item>
                    <Select.Item value="large">Large</Select.Item>
                    <Select.Item value="extra-large">Extra Large</Select.Item>
                  </Select.Content>
                </Select.Root>
              </HStack>
            </VStack>
          </Box>

          <Separator />

          {/* Navigation Settings */}
          <Box>
            <HStack mb={4}>
              <FiMousePointer />
              <Heading size="md">Navigation Settings</Heading>
            </HStack>
            
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="medium">Enhanced Focus Indicators</Text>
                  <Text fontSize="sm" color="neutral.600">
                    Shows clear focus outlines for keyboard navigation
                  </Text>
                </Box>
                <Switch
                  checked={settings.focusVisible}
                  onCheckedChange={(e) => handleSettingChange('focusVisible', !!e.checked)}
                  aria-label="Toggle enhanced focus indicators"
                />
              </HStack>
            </VStack>
          </Box>

          <Separator />

          {/* Audio Settings */}
          <Box>
            <HStack mb={4}>
              <FiVolume2 />
              <Heading size="md">Audio Settings</Heading>
            </HStack>
            
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Box>
                  <Text fontWeight="medium">Screen Reader Announcements</Text>
                  <Text fontSize="sm" color="neutral.600">
                    Provides audio feedback for actions and changes
                  </Text>
                </Box>
                <Switch
                  checked={settings.screenReaderAnnouncements}
                  onCheckedChange={(e) => handleSettingChange('screenReaderAnnouncements', !!e.checked)}
                  aria-label="Toggle screen reader announcements"
                />
              </HStack>
            </VStack>
          </Box>

          <Separator />

          {/* System Detection */}
          <Box>
            <HStack mb={4}>
              <FiType />
              <Heading size="md">System Preferences</Heading>
            </HStack>
            
            <Alert.Root status="info">
              <Alert.Title>Automatic Detection</Alert.Title>
              <Alert.Description>
                The system automatically detects your OS accessibility preferences and applies them.
                {window.matchMedia('(prefers-reduced-motion: reduce)').matches && (
                  <Badge colorScheme="blue" ml={2}>Reduced Motion Detected</Badge>
                )}
                {window.matchMedia('(prefers-contrast: high)').matches && (
                  <Badge colorScheme="blue" ml={2}>High Contrast Detected</Badge>
                )}
              </Alert.Description>
            </Alert.Root>
          </Box>
        </VStack>
      </Card.Body>

      <Card.Footer>
        <HStack justify="space-between" w="full">
          <Button variant="outline" onClick={resetToDefaults}>
            Reset to Defaults
          </Button>
          <HStack>
            {onClose && (
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            )}
            <Button onClick={() => announceToScreenReader('Settings saved successfully')}>
              Save Settings
            </Button>
          </HStack>
        </HStack>
      </Card.Footer>
    </Card.Root>
  )
}