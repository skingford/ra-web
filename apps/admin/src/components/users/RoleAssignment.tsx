import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Checkbox,
  Badge,
  Card,
  Heading,
  Avatar,
  Alert,
  Spinner,
  Input,
} from '@chakra-ui/react'
import { PermissionGate } from '../auth/PermissionGate'
import type { User, Role } from '../../stores/types'

interface RoleAssignmentProps {
  user: User
  availableRoles: Role[]
  loading?: boolean
  onSave: (userId: string, roleIds: string[]) => Promise<void>
  onCancel: () => void
}

export function RoleAssignment({
  user,
  availableRoles,
  loading = false,
  onSave,
  onCancel,
}: RoleAssignmentProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize selected roles
  useEffect(() => {
    setSelectedRoleIds(user.roles.map(role => role.id))
  }, [user])

  // Filter roles based on search term
  const filteredRoles = availableRoles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    setSelectedRoleIds(prev =>
      checked
        ? [...prev, roleId]
        : prev.filter(id => id !== roleId)
    )
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await onSave(user.id, selectedRoleIds)
    } catch (error) {
      console.error('Failed to update user roles:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedRoles = availableRoles.filter(role =>
    selectedRoleIds.includes(role.id)
  )

  const hasChanges = JSON.stringify(selectedRoleIds.sort()) !== 
    JSON.stringify(user.roles.map(r => r.id).sort())

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
        <VStack gap={3}>
          <Spinner size="lg" color="brand.500" />
          <Text color="neutral.600">Loading roles...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box maxW="800px" mx="auto">
      <Card.Root>
        <Card.Header>
          <HStack gap={4} align="start">
            <Avatar.Root size="lg">
              <Avatar.Image src={user.avatar} />
              <Avatar.Fallback>{user.name}</Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" gap={1} flex={1}>
              <Heading size="lg">Manage Roles</Heading>
              <Text color="neutral.600">
                Assign roles to {user.name} ({user.email})
              </Text>
              <Badge colorScheme={
                user.status === 'active' ? 'success' :
                user.status === 'inactive' ? 'neutral' : 'warning'
              }>
                {user.status}
              </Badge>
            </VStack>
          </HStack>
        </Card.Header>

        <Card.Body>
          <VStack gap={6} align="stretch">
            {/* Current Roles Summary */}
            <Box p={4} bg="neutral.50" borderRadius="md">
              <Text fontWeight="medium" mb={2}>
                Current Roles ({user.roles.length})
              </Text>
              {user.roles.length > 0 ? (
                <HStack gap={2} wrap="wrap">
                  {user.roles.map(role => (
                    <Badge key={role.id} colorScheme="brand">
                      {role.name}
                    </Badge>
                  ))}
                </HStack>
              ) : (
                <Text color="neutral.500" fontSize="sm">
                  No roles assigned
                </Text>
              )}
            </Box>

            {/* Search */}
            <Box>
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
              />
            </Box>

            {/* Available Roles */}
            <VStack gap={4} align="stretch">
              <Heading size="md" color="neutral.700">
                Available Roles ({filteredRoles.length})
              </Heading>

              {filteredRoles.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color="neutral.500">
                    {searchTerm ? 'No roles match your search.' : 'No roles available.'}
                  </Text>
                </Box>
              ) : (
                <VStack gap={3} align="stretch">
                  {filteredRoles.map(role => {
                    const isSelected = selectedRoleIds.includes(role.id)
                    const wasOriginallySelected = user.roles.some(r => r.id === role.id)
                    
                    return (
                      <PermissionGate
                        key={role.id}
                        resource="roles"
                        action="read"
                        fallback={
                          <Box
                            p={4}
                            border="1px"
                            borderColor="neutral.200"
                            borderRadius="md"
                            bg="neutral.100"
                          >
                            <Text color="neutral.500">
                              {role.name} - Access restricted
                            </Text>
                          </Box>
                        }
                      >
                        <Box
                          p={4}
                          border="1px"
                          borderColor={isSelected ? 'brand.300' : 'neutral.200'}
                          borderRadius="md"
                          bg={isSelected ? 'brand.50' : 'white'}
                          position="relative"
                        >
                          {/* Change indicator */}
                          {isSelected !== wasOriginallySelected && (
                            <Box
                              position="absolute"
                              top={2}
                              right={2}
                              w={3}
                              h={3}
                              bg={isSelected ? 'success.500' : 'warning.500'}
                              borderRadius="full"
                            />
                          )}

                          <HStack justify="space-between" align="start">
                            <VStack align="start" gap={2} flex={1}>
                              <HStack>
                                <Checkbox.Root
                                  checked={isSelected}
                                  onCheckedChange={(e) => handleRoleToggle(role.id, !!e.checked)}
                                  disabled={isSubmitting}
                                >
                                  <Checkbox.Indicator />
                                  <Checkbox.Label fontWeight="medium" fontSize="lg">
                                    {role.name}
                                  </Checkbox.Label>
                                </Checkbox.Root>
                              </HStack>

                              <Text color="neutral.600">
                                {role.description}
                              </Text>

                              {/* Permissions preview */}
                              <VStack align="start" gap={2} w="full">
                                <Text fontSize="sm" fontWeight="medium" color="neutral.700">
                                  Permissions ({role.permissions.length})
                                </Text>
                                <HStack gap={1} wrap="wrap">
                                  {role.permissions.slice(0, 6).map(permission => (
                                    <Badge
                                      key={permission.id}
                                      size="sm"
                                      variant="outline"
                                      colorScheme="neutral"
                                    >
                                      {permission.resource}:{permission.action}
                                    </Badge>
                                  ))}
                                  {role.permissions.length > 6 && (
                                    <Badge size="sm" variant="outline" color="neutral.500">
                                      +{role.permissions.length - 6} more
                                    </Badge>
                                  )}
                                </HStack>
                              </VStack>
                            </VStack>
                          </HStack>
                        </Box>
                      </PermissionGate>
                    )
                  })}
                </VStack>
              )}
            </VStack>

            {/* Selected Roles Summary */}
            {selectedRoles.length > 0 && (
              <Box p={4} bg="brand.50" borderRadius="md" border="1px" borderColor="brand.200">
                <Text fontWeight="medium" mb={2} color="brand.700">
                  Selected Roles ({selectedRoles.length})
                </Text>
                <HStack gap={2} wrap="wrap">
                  {selectedRoles.map(role => (
                    <Badge key={role.id} colorScheme="brand">
                      {role.name}
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Changes Alert */}
            {hasChanges && (
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Title>Unsaved Changes</Alert.Title>
                <Alert.Description>
                  You have made changes to the role assignments. Don't forget to save your changes.
                </Alert.Description>
              </Alert.Root>
            )}

            {/* Actions */}
            <HStack justify="flex-end" gap={3} pt={4}>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                loading={isSubmitting}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}