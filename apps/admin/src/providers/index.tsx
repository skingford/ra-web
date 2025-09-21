import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { queryClient } from '../lib/queryClient'
import { system } from '../theme/simple'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  console.log('AppProviders 渲染中...')
  console.log('system:', system)
  console.log('queryClient:', queryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </QueryClientProvider>
  )
}