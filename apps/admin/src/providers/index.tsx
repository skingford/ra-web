import { ChakraProvider } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useEffect } from 'react'
import { queryClient, networkUtils } from '../lib/queryClient'
import { system } from '../theme'

// Network status management
function NetworkStatusManager() {
  useEffect(() => {
    // Set up network status listeners
    const cleanup = networkUtils.pauseQueriesWhenOffline()
    
    return cleanup
  }, [])
  
  return null
}

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <NetworkStatusManager />
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ChakraProvider>
    </QueryClientProvider>
  )
}