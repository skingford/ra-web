import React from 'react'
import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Collapsible,
  useDisclosure,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiBarChart, 
  FiFileText,
  FiChevronDown,
  FiChevronRight,
  FiX
} from 'react-icons/fi'
import { useAuthStore } from '../../stores/authStore'

interface NavigationItem {
  id: string
  label: string
  icon: React.ElementType
  path: string
  children?: NavigationItem[]
  permissions?: string[]
}

interface SidebarProps {
  collapsed?: boolean
  onClose?: () => void
}

// Mock navigation items - in real app, this would come from config/API
const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: '仪表板',
    icon: FiHome,
    path: '/dashboard',
  },
  {
    id: 'users',
    label: '用户管理',
    icon: FiUsers,
    path: '/users',
    children: [
      {
        id: 'users-list',
        label: '用户列表',
        icon: FiUsers,
        path: '/users/list',
      },
      {
        id: 'users-roles',
        label: '角色管理',
        icon: FiUsers,
        path: '/users/roles',
        permissions: ['users.manage_roles'],
      },
    ],
  },
  {
    id: 'analytics',
    label: '数据分析',
    icon: FiBarChart,
    path: '/analytics',
    children: [
      {
        id: 'analytics-overview',
        label: '概览',
        icon: FiBarChart,
        path: '/analytics/overview',
      },
      {
        id: 'analytics-reports',
        label: '报表',
        icon: FiFileText,
        path: '/analytics/reports',
      },
    ],
  },
  {
    id: 'content',
    label: '内容管理',
    icon: FiFileText,
    path: '/content',
  },
  {
    id: 'settings',
    label: '系统设置',
    icon: FiSettings,
    path: '/settings',
    permissions: ['system.settings'],
  },
]

interface NavigationItemProps {
  item: NavigationItem
  collapsed: boolean
  level?: number
  currentPath?: string
}

const NavigationItemComponent: React.FC<NavigationItemProps> = ({
  item,
  collapsed,
  level = 0,
  currentPath = '/dashboard',
}) => {
  const { open, onToggle } = useDisclosure()
  const { permissions } = useAuthStore()
  
  // Check if user has permission to see this item
  const hasPermission = !item.permissions || 
    item.permissions.some(permission => permissions.has(permission))
  
  if (!hasPermission) {
    return null
  }

  const isActive = currentPath === item.path
  const hasChildren = item.children && item.children.length > 0
  const isParentActive = item.children?.some(child => child.path === currentPath)

  const handleClick = () => {
    if (hasChildren) {
      onToggle()
    } else {
      // In real app, this would use React Router
      console.log(`Navigate to: ${item.path}`)
    }
  }

  const ItemContent = () => (
    <Flex
      align="center"
      p={collapsed ? 2 : 3}
      mx={collapsed ? 1 : 2}
      borderRadius="md"
      cursor="pointer"
      bg={isActive || isParentActive ? 'brand.50' : 'transparent'}
      color={isActive || isParentActive ? 'brand.600' : 'neutral.700'}
      _hover={{
        bg: isActive || isParentActive ? 'brand.100' : 'neutral.100',
      }}
      _dark={{
        color: isActive || isParentActive ? 'brand.300' : 'neutral.300',
        bg: isActive || isParentActive ? 'brand.900' : 'transparent',
        _hover: {
          bg: isActive || isParentActive ? 'brand.800' : 'neutral.800',
        },
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      pl={level > 0 ? (collapsed ? 2 : 6) : undefined}
    >
      <Icon as={item.icon} boxSize={5} />
      
      {!collapsed && (
        <>
          <Text ml={3} fontSize="sm" fontWeight="medium" flex={1}>
            {item.label}
          </Text>
          
          {hasChildren && (
            <Icon
              as={isOpen ? FiChevronDown : FiChevronRight}
              boxSize={4}
              transition="transform 0.2s"
            />
          )}
        </>
      )}
    </Flex>
  )

  return (
    <Box>
      {collapsed && hasChildren ? (
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Box>
              <ItemContent />
            </Box>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {item.label}
          </Tooltip.Content>
        </Tooltip.Root>
      ) : (
        <ItemContent />
      )}
      
      {hasChildren && !collapsed && (
        <Collapsible.Root open={open} onOpenChange={onToggle}>
          <Collapsible.Content>
          <VStack gap={1} align="stretch" mt={1}>
            {item.children?.map((child) => (
              <NavigationItemComponent
                key={child.id}
                item={child}
                collapsed={collapsed}
                level={level + 1}
                currentPath={currentPath}
              />
            ))}
          </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </Box>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onClose }) => {
  return (
    <Box
      bg="white"
      borderRight="1px"
      borderColor="neutral.200"
      h="100vh"
      overflowY="auto"
      position="relative"
      _dark={{ bg: 'neutral.800', borderColor: 'neutral.700' }}
    >
      {/* Header */}
      <Flex
        align="center"
        justify={collapsed ? 'center' : 'space-between'}
        p={4}
        borderBottom="1px"
        borderColor="neutral.200"
        _dark={{ borderColor: 'neutral.700' }}
        minH="60px"
      >
        {!collapsed && (
          <Text fontSize="lg" fontWeight="bold" color="brand.600">
            RA Web 管理后台
          </Text>
        )}
        
        {collapsed && (
          <Text fontSize="lg" fontWeight="bold" color="brand.600">
            RA
          </Text>
        )}
        
        {onClose && (
          <IconButton
            aria-label="关闭菜单"
            children={<FiX />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        )}
      </Flex>

      {/* Navigation */}
      <Box p={2}>
        <VStack gap={1} align="stretch">
          {navigationItems.map((item) => (
            <NavigationItemComponent
              key={item.id}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </VStack>
      </Box>
    </Box>
  )
}