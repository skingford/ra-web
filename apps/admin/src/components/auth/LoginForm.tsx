import {
  Box,
  Button,
  Card,
  Heading,
  Input,
  VStack,
  Text,
  Alert,
  Link,
  HStack,
  Checkbox,
  Field,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { apiClient } from '../../lib/api'
import type { User } from '../../stores/types'

interface LoginCredentials {
  email: string
  password: string
  rememberMe: boolean
}

interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string>('')

  const { login, setLoading } = useAuthStore()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!credentials.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!credentials.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setLoading(true)

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
      })

      // Store refresh token if remember me is checked
      if (credentials.rememberMe && response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken)
      }

      login(response.user, response.token)
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.'
      
      if (error instanceof Error) {
        try {
          const apiError = JSON.parse(error.message)
          if (apiError.code === 'INVALID_CREDENTIALS') {
            errorMessage = 'Invalid email or password'
          } else if (apiError.code === 'ACCOUNT_LOCKED') {
            errorMessage = 'Account is locked. Please contact support.'
          } else if (apiError.code === 'NETWORK_ERROR') {
            errorMessage = 'Network error. Please check your connection.'
          } else {
            errorMessage = apiError.message || errorMessage
          }
        } catch {
          // Use default error message
        }
      }
      
      setApiError(errorMessage)
    } finally {
      setIsSubmitting(false)
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value
    setCredentials(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError('')
    }
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="neutral.50"
      px={4}
    >
      <Card.Root maxW="400px" w="full">
        <Card.Header textAlign="center" pb={6}>
          <Heading size="lg" color="brand.600" mb={2}>
            Welcome Back
          </Heading>
          <Text color="neutral.600">
            Sign in to your admin account
          </Text>
        </Card.Header>

        <Card.Body>
          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              {apiError && (
                <Alert.Root status="error" w="full">
                  <Alert.Title>Login Error</Alert.Title>
                  <Alert.Description>{apiError}</Alert.Description>
                </Alert.Root>
              )}

              <Field.Root invalid={!!errors.email}>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  value={credentials.email}
                  onChange={handleInputChange('email')}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
                <Field.ErrorText>{errors.email}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.password}>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <Field.ErrorText>{errors.password}</Field.ErrorText>
              </Field.Root>

              <HStack w="full" justify="space-between">
                <Checkbox.Root
                  checked={credentials.rememberMe}
                  onCheckedChange={(e) => setCredentials(prev => ({ ...prev, rememberMe: !!e.checked }))}
                  disabled={isSubmitting}
                >
                  <Checkbox.Indicator />
                  <Checkbox.Label>Remember me</Checkbox.Label>
                </Checkbox.Root>
                <Link color="brand.500" fontSize="sm" href="#forgot-password">
                  Forgot password?
                </Link>
              </HStack>

              <Button
                type="submit"
                w="full"
                size="lg"
                loading={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}