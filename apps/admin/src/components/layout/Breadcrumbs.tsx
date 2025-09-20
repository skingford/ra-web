import React from 'react'
import {
  BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbCurrentLink,
  Text,
  Icon,
} from '@chakra-ui/react'
import { FiChevronRight, FiHome } from 'react-icons/fi'
import { useUIStore } from '../../stores/uiStore'

export const Breadcrumbs: React.FC = () => {
  const { breadcrumbs } = useUIStore()

  // Don't render if no breadcrumbs
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null
  }

  return (
    <BreadcrumbRoot>
      <BreadcrumbList>
        {/* Always show home as first item if not already present */}
        {breadcrumbs[0]?.label !== '首页' && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                display="flex"
                alignItems="center"
                gap={1}
                fontSize="sm"
                color="neutral.600"
                _hover={{ color: 'brand.500' }}
                _dark={{ color: 'neutral.400', _hover: { color: 'brand.300' } }}
                onClick={(e) => {
                  e.preventDefault()
                  console.log('Navigate to: /dashboard')
                }}
              >
                <Icon as={FiHome} boxSize={3} />
                首页
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <Icon as={FiChevronRight} color="neutral.400" boxSize={3} />
            </BreadcrumbSeparator>
          </>
        )}

        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1
          const isCurrentPage = item.isCurrentPage || isLast

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isCurrentPage ? (
                  <BreadcrumbCurrentLink
                    fontSize="sm"
                    color="neutral.900"
                    fontWeight="medium"
                    _dark={{ color: 'neutral.100' }}
                  >
                    {item.label}
                  </BreadcrumbCurrentLink>
                ) : (
                  <BreadcrumbLink
                    href={item.href}
                    fontSize="sm"
                    color="neutral.600"
                    _hover={{ color: 'brand.500' }}
                    _dark={{ color: 'neutral.400', _hover: { color: 'brand.300' } }}
                    onClick={(e) => {
                      if (item.href) {
                        e.preventDefault()
                        // In real app, this would use React Router
                        console.log(`Navigate to: ${item.href}`)
                      }
                    }}
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <Icon as={FiChevronRight} color="neutral.400" boxSize={3} />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </BreadcrumbRoot>
  )
}