import React, { useState, useMemo } from 'react'
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  Avatar,
  Menu,
  IconButton,
  useDisclosure,
  Alert,
} from '@chakra-ui/react'
import { DataTable, type Column } from '../data/DataTable'
import { PermissionGate } from '../auth/PermissionGate'
import { usePermissions } from '../../lib/hooks/usePermissions'
import { PERMISSIONS } from '../../lib/permissions'
import type { User } from '../../stores/types'

interface UserListProps {
  users: User[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
  onCreateUser?: () => void
  onEditUser?: (user: User) => void
  onDeleteUser?: (user: User) => void
  onDeleteUsers?: (users: User[]) => void
  onToggleUserStatus?: (user: User) => void
  onAssignRole?: (user: User) => void
}

export function UserList({
  users,
  loading = false,
  pagination,
  onCreateUser,
  onEditUser,
  onDeleteUser,
  onDeleteUsers,
  onToggleUserStatus,
  onAssignRole,
}: UserListProps) {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sorting, setSorting] = useState<{
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }>({})

  const { can } = usePermissions()

  // Filter and sort users locally if no server-side handling
  const processedUsers = useMemo(() => {
    let filtered = users

    // Apply filters
    if (filters.name) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(filters.name.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      )
    }

    if (filters.status) {
      filtered = filtered.filter(user =>
        user.status.toLowerCase().includes(filters.status.toLowerCase())
      )
    }

    // Apply sorting
    if (sorting.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sorting.sortBy as keyof User]
        const bValue = b[sorting.sortBy as keyof User]
        
        let comparison = 0
        if (aValue < bValue) comparison = -1
        if (aValue > bValue) comparison = 1
        
        return sorting.sortOrder === 'desc' ? -comparison : comparison
      })
    }

    return filtered
  }, [users, filters, sorting])

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      filterable: true,
      accessor: (user) => (
        <HStack gap={3}>
          <Avatar.Root size="sm">
            <Avatar.Image src={user.avatar} />
            <Avatar.Fallback>{user.name}</Avatar.Fallback>
          </Avatar.Root>
          <VStack align="start" gap={0}>
            <Text fontWeight="medium">{user.name}</Text>
            <Text fontSize="sm" color="neutral.600">{user.email}</Text>
          </VStack>
        </HStack>
      ),
    },
    {
      key: 'roles',
      header: 'Roles',
      accessor: (user) => (
        <HStack gap={1} wrap="wrap">
          {user.roles.map(role => (
            <Badge key={role.id} variant="outline" colorScheme="brand">
              {role.name}
            </Badge>
          ))}
          {user.roles.length === 0 && (
            <Text fontSize="sm" color="neutral.500">No roles</Text>
          )}
        </HStack>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      filterable: true,
      accessor: (user) => (
        <Badge
          colorScheme={
            user.status === 'active' ? 'success' :
            user.status === 'inactive' ? 'neutral' : 'warning'
          }
        >
          {user.status}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      accessor: (user) => (
        <Text fontSize="sm">
          {user.lastLogin 
            ? user.lastLogin.toLocaleDateString()
            : 'Never'
          }
        </Text>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      accessor: (user) => (
        <Text fontSize="sm">
          {user.createdAt.toLocaleDateString()}
        </Text>
      ),
    },
  ]

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSorting({ sortBy, sortOrder })
  }

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters)
  }

  const bulkActions = [
    {
      label: 'Delete Selected',
      onClick: (users: User[]) => onDeleteUsers?.(users),
      variant: 'outline' as const,
      colorScheme: 'error',
      disabled: !can('delete', 'users'),
    },
  ].filter(action => !action.disabled)

  const renderRowActions = (user: User) => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton variant="ghost" size="sm">
          ⋮
        </IconButton>
      </Menu.Trigger>
      <Menu.Content>
        <PermissionGate resource="users" action="read">
          <Menu.Item onClick={() => onEditUser?.(user)}>
            View Details
          </Menu.Item>
        </PermissionGate>
        
        <PermissionGate resource="users" action="update">
          <Menu.Item onClick={() => onEditUser?.(user)}>
            Edit User
          </Menu.Item>
        </PermissionGate>
        
        <PermissionGate resource="users" action="update">
          <Menu.Item onClick={() => onAssignRole?.(user)}>
            Manage Roles
          </Menu.Item>
        </PermissionGate>
        
        <PermissionGate resource="users" action="update">
          <Menu.Item onClick={() => onToggleUserStatus?.(user)}>
            {user.status === 'active' ? 'Deactivate' : 'Activate'} User
          </Menu.Item>
        </PermissionGate>
        
        <Menu.Separator />
        
        <PermissionGate resource="users" action="delete">
          <Menu.Item 
            color="error.500"
            onClick={() => onDeleteUser?.(user)}
          >
            Delete User
          </Menu.Item>
        </PermissionGate>
      </Menu.Content>
    </Menu.Root>
  )

  const emptyState = (
    <VStack gap={4}>
      <Text fontSize="lg" color="neutral.600">
        No users found
      </Text>
      <Text color="neutral.500" textAlign="center">
        {Object.keys(filters).some(key => filters[key]) 
          ? 'Try adjusting your filters to see more results.'
          : 'Get started by creating your first user.'
        }
      </Text>
      <PermissionGate resource="users" action="create">
        <Button onClick={onCreateUser}>
          Create User
        </Button>
      </PermissionGate>
    </VStack>
  )

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" gap={1}>
          <Text fontSize="2xl" fontWeight="bold">
            Users
          </Text>
          <Text color="neutral.600">
            Manage user accounts and permissions
          </Text>
        </VStack>

        <PermissionGate resource="users" action="create">
          <Button onClick={onCreateUser}>
            Create User
          </Button>
        </PermissionGate>
      </HStack>

      {/* Permissions Notice */}
      {!can('read', 'users') && (
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Title>Limited Access</Alert.Title>
          <Alert.Description>
            You have limited permissions to view user information.
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Data Table */}
      <DataTable
        data={processedUsers}
        columns={columns}
        loading={loading}
        pagination={pagination}
        sorting={{
          sortBy: sorting.sortBy,
          sortOrder: sorting.sortOrder,
          onSort: handleSort,
        }}
        filtering={{
          filters,
          onFilterChange: handleFilterChange,
        }}
        selection={can('delete', 'users') ? {
          selectedItems: selectedUsers,
          onSelectionChange: setSelectedUsers,
          getItemId: (user) => user.id,
        } : undefined}
        actions={bulkActions}
        emptyState={emptyState}
        rowActions={renderRowActions}
      />
    </VStack>
  )
}