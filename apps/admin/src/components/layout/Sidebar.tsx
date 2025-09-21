import React, { useState } from 'react'
import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Collapsible,
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
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'

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
  isMobile?: boolean
}

// Navigation items matching the actual routes
const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: FiHome,
    path: '/',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: FiBarChart,
    path: '/dashboard',
  },
  {
    id: 'charts',
    label: 'Interactive Charts',
    icon: FiBarChart,
    path: '/charts',
  },
  {
    id: 'export',
    label: 'Export & Reports',
    icon: FiFileText,
    path: '/export',
    children: [
      {
        id: 'export-full',
        label: 'Full Export Demo',
        icon: FiFileText,
        path: '/export',
      },
      {
        id: 'export-simple',
        label: 'Simple Export',
        icon: FiFileText,
        path: '/export/simple',
      },
      {
        id: 'export-minimal',
        label: 'Minimal Export',
        icon: FiFileText,
        path: '/export/minimal',
      },
    ],
  },
  {
    id: 'data-table',
    label: 'Data Management',
    icon: FiUsers,
    path: '/data-table',
  },
  {
    id: 'form-builder',
    label: 'Form Builder',
    icon: FiSettings,
    path: '/form-builder',
  },
]

interface NavigationItemProps {
  item: NavigationItem
  collapsed: boolean
  level?: number
  currentPath?: string
  isMobile?: boolean
}

const NavigationItemComponent: React.FC<NavigationItemProps> = ({
  item,
  collapsed,
  level = 0,
  currentPath,
  isMobile = false,
}) => {
  const [open, setOpen] = useState(false)
  const onToggle = () => setOpen(!open)
  const { permissions } = useAuthStore()
  const navigate = useNavigate()
  
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
      navigate(item.path)
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
      role="menuitem"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      pl={level > 0 ? (collapsed ? 2 : 6) : undefined}
      // Larger touch targets on mobile
      minH={isMobile ? "48px" : "auto"}
      aria-expanded={hasChildren ? open : undefined}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon as={item.icon} boxSize={isMobile ? 6 : 5} />
      
      {!collapsed && (
        <>
          <Text 
            ml={3} 
            fontSize={isMobile ? "md" : "sm"} 
            fontWeight="medium" 
            flex={1}
          >
            {item.label}
          </Text>
          
          {hasChildren && (
            <Icon
              as={open ? FiChevronDown : FiChevronRight}
              boxSize={isMobile ? 5 : 4}
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
                isMobile={isMobile}
              />
            ))}
          </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      )}
    </Box>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onClose, isMobile = false }) => {
  const { containerRef } = useKeyboardNavigation({
    selector: '[role="menuitem"], button',
    loop: true,
  })
  const location = useLocation()

  return (
    <Box
      ref={containerRef}
      bg="white"
      borderRight="1px"
      borderColor="neutral.200"
      h="100vh"
      overflowY="auto"
      position="relative"
      _dark={{ bg: 'neutral.800', borderColor: 'neutral.700' }}
      role="navigation"
      aria-label="Main navigation menu"
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
            Admin Dashboard
          </Text>
        )}
        
        {collapsed && (
          <Text fontSize="lg" fontWeight="bold" color="brand.600">
            AD
          </Text>
        )}
        
        {onClose && (
          <IconButton
            aria-label="Close menu"
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
              currentPath={location.pathname}
              isMobile={isMobile}
            />
          ))}
        </VStack>
      </Box>
    </Box>
  )
}