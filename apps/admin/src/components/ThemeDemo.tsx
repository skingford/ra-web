import { 
  Box, 
  Button, 
  Card, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Badge,
  Input,
  Stack
} from '@chakra-ui/react'

export function ThemeDemo() {
  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack gap={8} align="stretch">
        <Box>
          <Heading size="2xl" mb={4} color="brand.600">
            Theme System Demo
          </Heading>
          <Text fontSize="lg" color="neutral.600">
            This component demonstrates the custom theme system with design tokens, 
            responsive breakpoints, and component styling.
          </Text>
        </Box>

        {/* Color Palette */}
        <Card.Root>
          <Card.Header>
            <Heading size="lg">Color Palette</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={2}>Brand Colors</Text>
                <HStack gap={2} wrap="wrap">
                  <Badge bg="brand.100" color="brand.800">brand.100</Badge>
                  <Badge bg="brand.300" color="brand.800">brand.300</Badge>
                  <Badge bg="brand.500" color="white">brand.500</Badge>
                  <Badge bg="brand.700" color="white">brand.700</Badge>
                  <Badge bg="brand.900" color="white">brand.900</Badge>
                </HStack>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" mb={2}>Semantic Colors</Text>
                <HStack gap={2} wrap="wrap">
                  <Badge bg="success.500" color="white">Success</Badge>
                  <Badge bg="warning.500" color="white">Warning</Badge>
                  <Badge bg="error.500" color="white">Error</Badge>
                </HStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Typography */}
        <Card.Root>
          <Card.Header>
            <Heading size="lg">Typography</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Box>
                <Heading size="xs" color="neutral.600" mb={2}>Font Sizes</Heading>
                <VStack gap={2} align="start">
                  <Text fontSize="xs">Extra Small (xs)</Text>
                  <Text fontSize="sm">Small (sm)</Text>
                  <Text fontSize="md">Medium (md)</Text>
                  <Text fontSize="lg">Large (lg)</Text>
                  <Text fontSize="xl">Extra Large (xl)</Text>
                  <Text fontSize="2xl">2X Large (2xl)</Text>
                </VStack>
              </Box>
              
              <Box>
                <Heading size="xs" color="neutral.600" mb={2}>Font Weights</Heading>
                <VStack gap={2} align="start">
                  <Text fontWeight="light">Light (300)</Text>
                  <Text fontWeight="normal">Normal (400)</Text>
                  <Text fontWeight="medium">Medium (500)</Text>
                  <Text fontWeight="semibold">Semibold (600)</Text>
                  <Text fontWeight="bold">Bold (700)</Text>
                </VStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Components */}
        <Card.Root>
          <Card.Header>
            <Heading size="lg">Component Styling</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={6} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={3}>Buttons</Text>
                <HStack gap={3} wrap="wrap">
                  <Button variant="solid" size="sm">Small Solid</Button>
                  <Button variant="solid" size="md">Medium Solid</Button>
                  <Button variant="solid" size="lg">Large Solid</Button>
                </HStack>
                <HStack gap={3} wrap="wrap" mt={2}>
                  <Button variant="outline" size="md">Outline</Button>
                  <Button variant="ghost" size="md">Ghost</Button>
                </HStack>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" mb={3}>Form Elements</Text>
                <Stack gap={3}>
                  <Input placeholder="Default input" />
                  <Input placeholder="Focused input (try clicking)" />
                </Stack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Responsive Design */}
        <Card.Root>
          <Card.Header>
            <Heading size="lg">Responsive Design</Heading>
          </Card.Header>
          <Card.Body>
            <Text mb={4} color="neutral.600">
              Resize your browser window to see responsive behavior:
            </Text>
            <Box
              p={{ base: 4, md: 6, lg: 8 }}
              bg={{ base: 'brand.50', md: 'success.50', lg: 'warning.50' }}
              borderRadius="md"
              textAlign="center"
            >
              <Text fontWeight="semibold">
                Responsive Box
              </Text>
              <Text fontSize="sm" color="neutral.600" mt={2}>
                Padding and background change based on screen size
              </Text>
            </Box>
          </Card.Body>
        </Card.Root>

        {/* Spacing System */}
        <Card.Root>
          <Card.Header>
            <Heading size="lg">Spacing System</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontWeight="semibold" mb={3}>Padding Examples</Text>
                <HStack gap={4} wrap="wrap">
                  <Box p={2} bg="neutral.100" borderRadius="md">
                    <Text fontSize="sm">p={2}</Text>
                  </Box>
                  <Box p={4} bg="neutral.100" borderRadius="md">
                    <Text fontSize="sm">p={4}</Text>
                  </Box>
                  <Box p={6} bg="neutral.100" borderRadius="md">
                    <Text fontSize="sm">p={6}</Text>
                  </Box>
                  <Box p={8} bg="neutral.100" borderRadius="md">
                    <Text fontSize="sm">p={8}</Text>
                  </Box>
                </HStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  )
}