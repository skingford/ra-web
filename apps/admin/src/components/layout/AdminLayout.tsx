import React from 'react'
import {
  Box,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Drawer } from '@chakra-ui/react'
import { useUIStore } from '../../stores/uiStore'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumbs } from './Breadcrumbs'
import type { BreadcrumbItem } from '../../stores/types'

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title,
  breadcrumbs,
  actions,
}) => {
  const { sidebarCollapsed, setSidebarCollapsed, setBreadcrumbs } = useUIStore()
  const [open, setOpen] = React.useState(false)
  const onOpen = () => setOpen(true)
  const onClose = () => setOpen(false)
  
  // Determine if we should show mobile layout
  const isMobile = useBreakpointValue({ base: true, md: false })
  
  // Set breadcrumbs when they change
  React.useEffect(() => {
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs)
    }
  }, [breadcrumbs, setBreadcrumbs])

  // Handle sidebar toggle for mobile
  const handleSidebarToggle = () => {
    if (isMobile) {
      onOpen()
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // Calculate sidebar width based on collapsed state
  const sidebarWidth = sidebarCollapsed ? '60px' : '240px'
  const mobileSidebarWidth = '240px'

  return (
    <Box minH="100vh" bg="neutral.50" _dark={{ bg: 'neutral.900' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          position="fixed"
          left={0}
          top={0}
          w={sidebarWidth}
          h="100vh"
          transition="width 0.2s"
          zIndex={10}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content maxW={mobileSidebarWidth}>
              <Sidebar collapsed={false} onClose={onClose} />
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      )}

      {/* Main Content Area */}
      <Box
        ml={isMobile ? 0 : sidebarWidth}
        transition="margin-left 0.2s"
        minH="100vh"
      >
        {/* Header */}
        <Header
          title={title ?? ''}
          actions={actions}
          onMenuClick={handleSidebarToggle}
          showMenuButton={true}
        />

        {/* Breadcrumbs */}
        <Box px={6} py={3} bg="white" borderBottom="1px" borderColor="neutral.200" _dark={{ bg: 'neutral.800', borderColor: 'neutral.700' }}>
          <Breadcrumbs />
        </Box>

        {/* Page Content */}
        <Box p={6}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}