import React, { useState } from 'react'
import {
  Box,
  HStack,
  IconButton,
  Tooltip,
  Drawer,
  Button,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  FiEye,
  FiType,
  FiMousePointer,
  FiSettings,
  FiMinus,
  FiPlus,
} from 'react-icons/fi'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import { AccessibilitySettings } from './AccessibilitySettings'

export const AccessibilityToolbar: React.FC = () => {
  const { settings, updateSetting, announceToScreenReader } = useAccessibility()
  const [showSettings, setShowSettings] = useState(false)

  const toggleHighContrast = () => {
    const newValue = !settings.highContrast
    updateSetting('highContrast', newValue)
    announceToScreenReader(`High contrast mode ${newValue ? 'enabled' : 'disabled'}`)
  }

  const toggleReducedMotion = () => {
    const newValue = !settings.reducedMotion
    updateSetting('reducedMotion', newValue)
    announceToScreenReader(`Reduced motion ${newValue ? 'enabled' : 'disabled'}`)
  }

  const increaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'extra-large'] as const
    const currentIndex = sizes.indexOf(settings.fontSize)
    if (currentIndex < sizes.length - 1) {
      const newSize = sizes[currentIndex + 1]
      updateSetting('fontSize', newSize)
      announceToScreenReader(`Font size increased to ${newSize}`)
    }
  }

  const decreaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'extra-large'] as const
    const currentIndex = sizes.indexOf(settings.fontSize)
    if (currentIndex > 0) {
      const newSize = sizes[currentIndex - 1]
      updateSetting('fontSize', newSize)
      announceToScreenReader(`Font size decreased to ${newSize}`)
    }
  }

  const toggleFocusVisible = () => {
    const newValue = !settings.focusVisible
    updateSetting('focusVisible', newValue)
    announceToScreenReader(`Enhanced focus indicators ${newValue ? 'enabled' : 'disabled'}`)
  }

  return (
    <>
      <Box
        position="fixed"
        top="50%"
        right={0}
        transform="translateY(-50%)"
        bg="white"
        borderLeft="1px solid"
        borderColor="neutral.200"
        borderTopLeftRadius="md"
        borderBottomLeftRadius="md"
        boxShadow="lg"
        zIndex={1000}
        _dark={{
          bg: 'neutral.800',
          borderColor: 'neutral.700',
        }}
        role="toolbar"
        aria-label="Accessibility tools"
      >
        <VStack gap={1} p={2}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Toggle high contrast mode"
                children={<FiEye />}
                variant={settings.highContrast ? 'solid' : 'ghost'}
                size="sm"
                onClick={toggleHighContrast}
                colorScheme={settings.highContrast ? 'brand' : undefined}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>
              {settings.highContrast ? 'Disable' : 'Enable'} high contrast
            </Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Decrease font size"
                children={<FiMinus />}
                variant="ghost"
                size="sm"
                onClick={decreaseFontSize}
                disabled={settings.fontSize === 'small'}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Decrease font size</Tooltip.Content>
          </Tooltip.Root>

          <Text fontSize="xs" color="neutral.600" px={1}>
            {settings.fontSize.charAt(0).toUpperCase()}
          </Text>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Increase font size"
                children={<FiPlus />}
                variant="ghost"
                size="sm"
                onClick={increaseFontSize}
                disabled={settings.fontSize === 'extra-large'}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Increase font size</Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Toggle enhanced focus indicators"
                children={<FiMousePointer />}
                variant={settings.focusVisible ? 'solid' : 'ghost'}
                size="sm"
                onClick={toggleFocusVisible}
                colorScheme={settings.focusVisible ? 'brand' : undefined}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>
              {settings.focusVisible ? 'Disable' : 'Enable'} enhanced focus
            </Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="Open accessibility settings"
                children={<FiSettings />}
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>Accessibility settings</Tooltip.Content>
          </Tooltip.Root>
        </VStack>
      </Box>

      {/* Settings Drawer */}
      <Drawer.Root open={showSettings} onOpenChange={setShowSettings} placement="right">
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content maxW="600px">
            <Drawer.Header>
              <Drawer.Title>Accessibility Settings</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <Button variant="ghost" size="sm">
                  Close
                </Button>
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body>
              <AccessibilitySettings onClose={() => setShowSettings(false)} />
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  )
}