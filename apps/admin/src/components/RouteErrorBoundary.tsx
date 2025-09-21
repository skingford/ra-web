import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { useLocation } from 'react-router-dom'

interface RouteErrorBoundaryProps {
  children: React.ReactNode
}

export const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children }) => {
  const location = useLocation()
  
  return (
    <ErrorBoundary
      level="route"
      resetKeys={[location.pathname]}
      resetOnPropsChange={true}
      onError={(error, errorInfo) => {
        console.error(`Route error at ${location.pathname}:`, error, errorInfo)
        // You could send route-specific error data to analytics
      }}
    >
      {children}
    </ErrorBoundary>
  )
}