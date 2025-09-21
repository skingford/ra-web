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
  
  // Responsive breakpoint values for different screen sizes
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })
  const isDesktop = useBreakpointValue({ base: false, lg: true })
  
  // Set breadcrumbs when they change
  React.useEffect(() => {
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs)
    }
  }, [breadcrumbs, setBreadcrumbs])

  // Handle sidebar toggle for different screen sizes
  const handleSidebarToggle = () => {
    if (isMobile || isTablet) {
      onOpen()
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // Calculate sidebar width based on collapsed state and screen size
  const sidebarWidth = useBreakpointValue({
    base: '0px', // Hidden on mobile
    md: '0px',   // Hidden on tablet (drawer only)
    lg: sidebarCollapsed ? '60px' : '240px', // Collapsible on desktop
    xl: sidebarCollapsed ? '60px' : '280px', // Wider on large screens
  })
  
  const mobileSidebarWidth = useBreakpointValue({
    base: '280px', // Full width drawer on mobile
    md: '320px',   // Wider drawer on tablet
  })

  return (
    <Box minH="100vh" bg="neutral.50" _dark={{ bg: 'neutral.900' }}>
      {/* Desktop Sidebar - Only show on large screens */}
      {isDesktop && (
        <Box
          position="fixed"
          left={0}
          top={0}
          w={sidebarWidth}
          h="100vh"
          transition="width 0.3s ease-in-out"
          zIndex={10}
          role="navigation"
          aria-label="Main navigation"
          id="navigation"
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </Box>
      )}

      {/* Mobile/Tablet Drawer */}
      {(isMobile || isTablet) && (
        <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content 
              maxW={mobileSidebarWidth}
              role="navigation"
              aria-label="Main navigation"
              // Add touch-friendly gestures
              style={{
                touchAction: 'pan-y',
              }}
            >
              <Sidebar collapsed={false} onClose={onClose} isMobile={isMobile} />
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      )}

      {/* Main Content Area */}
      <Box
        ml={isDesktop ? sidebarWidth : 0}
        transition="margin-left 0.3s ease-in-out"
        minH="100vh"
        role="main"
      >
        {/* Header */}
        <Header
          title={title ?? ''}
          actions={actions}
          onMenuClick={handleSidebarToggle}
          showMenuButton={true}
          isMobile={isMobile}
        />

        {/* Breadcrumbs - Responsive padding */}
        <Box 
          px={{ base: 4, md: 6 }} 
          py={{ base: 2, md: 3 }} 
          bg="white" 
          borderBottom="1px" 
          borderColor="neutral.200" 
          _dark={{ bg: 'neutral.800', borderColor: 'neutral.700' }}
          // Hide on very small screens to save space
          display={{ base: breadcrumbs && breadcrumbs.length > 1 ? 'block' : 'none', md: 'block' }}
          role="navigation"
          aria-label="Breadcrumb navigation"
        >
          <Breadcrumbs />
        </Box>

        {/* Page Content - Responsive padding */}
        <Box 
          id="main-content"
          p={{ base: 4, md: 6 }}
          // Ensure content doesn't get too wide on large screens
          maxW={{ base: '100%', '2xl': '1400px' }}
          mx="auto"
          tabIndex={-1}
          role="main"
          aria-label={title ? `${title} content` : 'Main content'}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}