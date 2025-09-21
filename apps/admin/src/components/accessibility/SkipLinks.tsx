import React from 'react'
import { Box, Link } from '@chakra-ui/react'

interface SkipLink {
  href: string
  label: string
}

const skipLinks: SkipLink[] = [
  { href: '#main-content', label: 'Skip to main content' },
  { href: '#navigation', label: 'Skip to navigation' },
  { href: '#search', label: 'Skip to search' },
]

export const SkipLinks: React.FC = () => {
  const handleSkipClick = (href: string) => {
    const target = document.querySelector(href)
    if (target) {
      // Make the target focusable if it isn't already
      const element = target as HTMLElement
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1')
      }
      
      element.focus()
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Remove tabindex after focus to restore natural tab order
      setTimeout(() => {
        if (element.getAttribute('tabindex') === '-1') {
          element.removeAttribute('tabindex')
        }
      }, 100)
    }
  }

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      zIndex={9999}
      role="navigation"
      aria-label="Skip links"
    >
      {skipLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={(e) => {
            e.preventDefault()
            handleSkipClick(link.href)
          }}
          position="absolute"
          top="-40px"
          left="6px"
          bg="neutral.900"
          color="white"
          px={3}
          py={2}
          borderRadius="md"
          fontSize="sm"
          fontWeight="medium"
          textDecoration="none"
          transform="translateY(-100%)"
          transition="transform 0.2s ease-in-out"
          _focus={{
            transform: 'translateY(0)',
            outline: '2px solid',
            outlineColor: 'brand.500',
            outlineOffset: '2px',
          }}
          _hover={{
            bg: 'neutral.800',
          }}
        >
          {link.label}
        </Link>
      ))}
    </Box>
  )
}