import React from 'react'
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  Avatar,
  Badge,
  HStack,
  useColorMode,
  Tooltip,
} from '@chakra-ui/react'
import {
  FiMenu,
  FiBell,
  FiSun,
  FiMoon,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi'
import { useUIStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'

interface HeaderProps {
  title?: string
  actions?: React.ReactNode
  onMenuClick: () => void
  showMenuButton?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  title,
  actions,
  onMenuClick,
  showMenuButton = true,
}) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { notifications, theme, toggleTheme } = useUIStore()
  const { user, logout } = useAuthStore()

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length

  const handleThemeToggle = () => {
    toggleTheme()
    toggleColorMode()
  }

  const handleLogout = () => {
    logout()
    // In real app, this would redirect to login page
    console.log('User logged out')
  }

  return (
    <Box
      bg="white"
      borderBottom="1px"
      borderColor="neutral.200"
      px={6}
      py={3}
      position="sticky"
      top={0}
      zIndex={5}
      _dark={{ bg: 'neutral.800', borderColor: 'neutral.700' }}
    >
      <Flex align="center" justify="space-between">
        {/* Left Section */}
        <Flex align="center" gap={4}>
          {showMenuButton && (
            <IconButton
              aria-label="切换菜单"
              children={<FiMenu />}
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
            />
          )}
          
          {title && (
            <Text fontSize="lg" fontWeight="semibold" color="neutral.900" _dark={{ color: 'neutral.100' }}>
              {title}
            </Text>
          )}
        </Flex>

        {/* Center Section - Actions */}
        {actions && (
          <Flex align="center" gap={2}>
            {actions}
          </Flex>
        )}

        {/* Right Section */}
        <Flex align="center" gap={2}>
          {/* Theme Toggle */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <IconButton
                aria-label="切换主题"
                children={theme === 'light' ? <FiMoon /> : <FiSun />}
                variant="ghost"
                size="sm"
                onClick={handleThemeToggle}
              />
            </Tooltip.Trigger>
            <Tooltip.Content>
              {theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
            </Tooltip.Content>
          </Tooltip.Root>

          {/* Notifications */}
          <MenuRoot>
            <MenuTrigger asChild>
              <IconButton
                aria-label="通知"
                variant="ghost"
                size="sm"
              >
                <Box position="relative">
                  <FiBell />
                  {unreadCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      colorScheme="red"
                      borderRadius="full"
                      boxSize="18px"
                      fontSize="xs"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Box>
              </IconButton>
            </MenuTrigger>
            <MenuContent maxW="300px">
              <Box px={3} py={2} borderBottom="1px" borderColor="neutral.200" _dark={{ borderColor: 'neutral.700' }}>
                <Text fontWeight="semibold" fontSize="sm">
                  通知 {unreadCount > 0 && `(${unreadCount})`}
                </Text>
              </Box>
              
              {notifications.length === 0 ? (
                <MenuItem value="no-notifications">
                  <Text fontSize="sm" color="neutral.500">
                    暂无通知
                  </Text>
                </MenuItem>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <MenuItem key={notification.id} value={`notification-${notification.id}`} py={3}>
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <Badge colorScheme="blue" size="sm">
                            新
                          </Badge>
                        )}
                      </HStack>
                      <Text fontSize="xs" color="neutral.600" _dark={{ color: 'neutral.400' }} noOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text fontSize="xs" color="neutral.500" mt={1}>
                        {notification.timestamp.toLocaleString()}
                      </Text>
                    </Box>
                  </MenuItem>
                ))
              )}
              
              {notifications.length > 5 && (
                <>
                  <MenuSeparator />
                  <MenuItem value="view-all-notifications">
                    <Text fontSize="sm" color="brand.500" textAlign="center" w="100%">
                      查看全部通知
                    </Text>
                  </MenuItem>
                </>
              )}
            </MenuContent>
          </MenuRoot>

          {/* User Menu */}
          <MenuRoot>
            <MenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                px={2}
              >
                <HStack gap={2}>
                  <Avatar.Root size="sm">
                    <Avatar.Image src={user?.avatar} />
                    <Avatar.Fallback>{user?.name || '用户'}</Avatar.Fallback>
                  </Avatar.Root>
                  <Box textAlign="left" display={{ base: 'none', md: 'block' }}>
                    <Text fontSize="sm" fontWeight="medium" lineHeight="1.2">
                      {user?.name || '未登录'}
                    </Text>
                    <Text fontSize="xs" color="neutral.500" lineHeight="1.2">
                      {user?.email || ''}
                    </Text>
                  </Box>
                  <FiChevronDown />
                </HStack>
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem value="profile">
                <FiUser />
                个人资料
              </MenuItem>
              <MenuItem value="settings">
                <FiSettings />
                账户设置
              </MenuItem>
              <MenuSeparator />
              <MenuItem value="logout" onClick={handleLogout}>
                <FiLogOut />
                退出登录
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </Flex>
      </Flex>
    </Box>
  )
}