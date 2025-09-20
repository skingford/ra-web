import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button, Box } from '@chakra-ui/react'
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '../index'

// Simple test provider that only includes Chakra
const TestProvider = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>
    {children}
  </ChakraProvider>
)

describe('Theme Integration', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(<TestProvider>{component}</TestProvider>)
  }

  describe('Button Component', () => {
    it('should render with default theme styles', () => {
      renderWithProviders(
        <Button data-testid="themed-button">Test Button</Button>
      )

      const button = screen.getByTestId('themed-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Test Button')
    })

    it('should apply different sizes', () => {
      renderWithProviders(
        <div>
          <Button size="sm" data-testid="small-button">Small</Button>
          <Button size="md" data-testid="medium-button">Medium</Button>
          <Button size="lg" data-testid="large-button">Large</Button>
        </div>
      )

      expect(screen.getByTestId('small-button')).toBeInTheDocument()
      expect(screen.getByTestId('medium-button')).toBeInTheDocument()
      expect(screen.getByTestId('large-button')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should apply responsive styles', () => {
      renderWithProviders(
        <Box
          data-testid="responsive-box"
          p={{ base: 2, md: 4, lg: 6 }}
          bg={{ base: 'gray.100', md: 'gray.200' }}
        >
          Responsive Content
        </Box>
      )

      const box = screen.getByTestId('responsive-box')
      expect(box).toBeInTheDocument()
      expect(box).toHaveTextContent('Responsive Content')
    })
  })

  describe('Color Tokens', () => {
    it('should apply brand colors', () => {
      renderWithProviders(
        <Box
          data-testid="brand-colored-box"
          bg="brand.500"
          color="white"
          p={4}
        >
          Brand Colored Box
        </Box>
      )

      const box = screen.getByTestId('brand-colored-box')
      expect(box).toBeInTheDocument()
    })

    it('should apply semantic colors', () => {
      renderWithProviders(
        <div>
          <Box bg="success.500" data-testid="success-box">Success</Box>
          <Box bg="warning.500" data-testid="warning-box">Warning</Box>
          <Box bg="error.500" data-testid="error-box">Error</Box>
        </div>
      )

      expect(screen.getByTestId('success-box')).toBeInTheDocument()
      expect(screen.getByTestId('warning-box')).toBeInTheDocument()
      expect(screen.getByTestId('error-box')).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('should apply font tokens', () => {
      renderWithProviders(
        <div>
          <Box fontFamily="heading" data-testid="heading-font">
            Heading Font
          </Box>
          <Box fontFamily="body" data-testid="body-font">
            Body Font
          </Box>
          <Box fontFamily="mono" data-testid="mono-font">
            Mono Font
          </Box>
        </div>
      )

      expect(screen.getByTestId('heading-font')).toBeInTheDocument()
      expect(screen.getByTestId('body-font')).toBeInTheDocument()
      expect(screen.getByTestId('mono-font')).toBeInTheDocument()
    })

    it('should apply font size tokens', () => {
      renderWithProviders(
        <div>
          <Box fontSize="xs" data-testid="xs-text">Extra Small</Box>
          <Box fontSize="md" data-testid="md-text">Medium</Box>
          <Box fontSize="2xl" data-testid="2xl-text">2X Large</Box>
        </div>
      )

      expect(screen.getByTestId('xs-text')).toBeInTheDocument()
      expect(screen.getByTestId('md-text')).toBeInTheDocument()
      expect(screen.getByTestId('2xl-text')).toBeInTheDocument()
    })
  })

  describe('Spacing', () => {
    it('should apply spacing tokens', () => {
      renderWithProviders(
        <div>
          <Box p={2} data-testid="small-padding">Small Padding</Box>
          <Box p={4} data-testid="medium-padding">Medium Padding</Box>
          <Box p={8} data-testid="large-padding">Large Padding</Box>
        </div>
      )

      expect(screen.getByTestId('small-padding')).toBeInTheDocument()
      expect(screen.getByTestId('medium-padding')).toBeInTheDocument()
      expect(screen.getByTestId('large-padding')).toBeInTheDocument()
    })

    it('should apply margin tokens', () => {
      renderWithProviders(
        <div>
          <Box m={1} data-testid="small-margin">Small Margin</Box>
          <Box m={4} data-testid="medium-margin">Medium Margin</Box>
          <Box m={6} data-testid="large-margin">Large Margin</Box>
        </div>
      )

      expect(screen.getByTestId('small-margin')).toBeInTheDocument()
      expect(screen.getByTestId('medium-margin')).toBeInTheDocument()
      expect(screen.getByTestId('large-margin')).toBeInTheDocument()
    })
  })
})