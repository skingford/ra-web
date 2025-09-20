import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  Select,
  Checkbox,
  Portal, 
  createListCollection,
  Alert,
  Card,
  Heading,
  Avatar,
  Badge,
  Textarea,
  Field,
} from "@chakra-ui/react";
import { PermissionGate } from "../auth/PermissionGate";
import type { User, Role } from "../../stores/types";

interface UserFormData {
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive" | "pending";
  roles: string[];
  bio?: string;
}

interface UserFormProps {
  user?: User;
  availableRoles: Role[];
  loading?: boolean;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
}

export function UserForm({
  user,
  availableRoles,
  loading = false,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    avatar: "",
    status: "active",
    roles: [],
    bio: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        status: user.status,
        roles: user.roles.map((role) => role.id),
        bio: user.bio || "", // Now properly typed
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.roles.length === 0) {
      newErrors.roles = "At least one role must be assigned";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange =
    (field: keyof UserFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleSelectChange = (field: keyof UserFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRoleToggle = (roleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      roles: checked
        ? [...prev.roles, roleId]
        : prev.roles.filter((id) => id !== roleId),
    }));

    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: "" }));
    }
  };

  const selectedRoles = availableRoles.filter((role) =>
    formData.roles.includes(role.id)
  );

  const frameworks = createListCollection({
    items: [
      { label: "React.js", value: "react" },
      { label: "Vue.js", value: "vue" },
      { label: "Angular", value: "angular" },
      { label: "Svelte", value: "svelte" },
    ],
  });

  return (
    <Box maxW="600px" mx="auto">
      <Card.Root>
        <Card.Header>
          <Heading size="lg">{user ? "Edit User" : "Create New User"}</Heading>
          <Text color="neutral.600">
            {user
              ? "Update user information and permissions"
              : "Add a new user to the system"}
          </Text>
        </Card.Header>

        <Card.Body>
          <form onSubmit={handleSubmit}>
            <VStack gap={6} align="stretch">
              {/* Basic Information */}
              <VStack gap={4} align="stretch">
                <Heading size="md" color="neutral.700">
                  Basic Information
                </Heading>

                <HStack gap={4} align="start">
                  <Avatar.Root size="lg">
                    <Avatar.Image src={formData.avatar} />
                    <Avatar.Fallback>{formData.name}</Avatar.Fallback>
                  </Avatar.Root>
                  <VStack flex={1} align="stretch" gap={4}>
                    <Field.Root invalid={!!errors.name}>
                      <Field.Label>Full Name</Field.Label>
                      <Input
                        value={formData.name}
                        onChange={handleInputChange("name")}
                        placeholder="Enter full name"
                        disabled={isSubmitting}
                      />
                      <Field.ErrorText>{errors.name}</Field.ErrorText>
                    </Field.Root>

                    <Field.Root invalid={!!errors.email}>
                      <Field.Label>Email Address</Field.Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        placeholder="Enter email address"
                        disabled={isSubmitting}
                      />
                      <Field.ErrorText>{errors.email}</Field.ErrorText>
                    </Field.Root>
                  </VStack>
                </HStack>

                <Field.Root>
                  <Field.Label>Avatar URL (Optional)</Field.Label>
                  <Input
                    value={formData.avatar}
                    onChange={handleInputChange("avatar")}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={isSubmitting}
                  />
                  <Field.HelperText>
                    Provide a URL to the user's profile picture
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Bio (Optional)</Field.Label>
                  <Textarea
                    value={formData.bio}
                    onChange={handleInputChange("bio")}
                    placeholder="Brief description about the user"
                    disabled={isSubmitting}
                    rows={3}
                  />
                </Field.Root>
              </VStack>

              {/* Status */}
              <VStack gap={4} align="stretch">
                <Heading size="md" color="neutral.700">
                  Account Status
                </Heading>

                <Field.Root>
                  <Field.Label>Status</Field.Label>
                  <Select.Root collection={frameworks}>
                    <Select.HiddenSelect />
                    <Select.Label>Select framework</Select.Label>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select framework" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {frameworks.items.map((framework) => (
                            <Select.Item item={framework} key={framework.value}>
                              {framework.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                  )
                </Field.Root>
              </VStack>

              {/* Role Assignment */}
              <PermissionGate resource="roles" action="read">
                <VStack gap={4} align="stretch">
                  <Heading size="md" color="neutral.700">
                    Role Assignment
                  </Heading>

                  {errors.roles && (
                    <Alert.Root status="error">
                      <Alert.Indicator />
                      <Alert.Description>{errors.roles}</Alert.Description>
                    </Alert.Root>
                  )}

                  <VStack gap={3} align="stretch">
                    {availableRoles.map((role) => (
                      <Box
                        key={role.id}
                        p={4}
                        border="1px"
                        borderColor="neutral.200"
                        borderRadius="md"
                        bg={
                          formData.roles.includes(role.id)
                            ? "brand.50"
                            : "white"
                        }
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" gap={1} flex={1}>
                            <HStack>
                              <Checkbox.Root
                                checked={formData.roles.includes(role.id)}
                                onCheckedChange={(e) =>
                                  handleRoleToggle(role.id, !!e.checked)
                                }
                                disabled={isSubmitting}
                              >
                                <Checkbox.Indicator />
                                <Checkbox.Label fontWeight="medium">
                                  {role.name}
                                </Checkbox.Label>
                              </Checkbox.Root>
                            </HStack>
                            <Text fontSize="sm" color="neutral.600">
                              {role.description}
                            </Text>
                            <HStack gap={1} wrap="wrap">
                              {role.permissions
                                .slice(0, 3)
                                .map((permission) => (
                                  <Badge
                                    key={permission.id}
                                    size="sm"
                                    variant="outline"
                                  >
                                    {permission.resource}:{permission.action}
                                  </Badge>
                                ))}
                              {role.permissions.length > 3 && (
                                <Badge
                                  size="sm"
                                  variant="outline"
                                  color="neutral.500"
                                >
                                  +{role.permissions.length - 3} more
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>

                  {selectedRoles.length > 0 && (
                    <Box p={4} bg="neutral.50" borderRadius="md">
                      <Text fontWeight="medium" mb={2}>
                        Selected Roles ({selectedRoles.length})
                      </Text>
                      <HStack gap={2} wrap="wrap">
                        {selectedRoles.map((role) => (
                          <Badge key={role.id} colorScheme="brand">
                            {role.name}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}
                </VStack>
              </PermissionGate>

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
                  type="submit"
                  loading={isSubmitting}
                  loadingText={user ? "Updating..." : "Creating..."}
                >
                  {user ? "Update User" : "Create User"}
                </Button>
              </HStack>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
