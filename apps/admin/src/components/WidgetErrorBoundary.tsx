import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'

interface WidgetErrorBoundaryProps {
  children: React.ReactNode
  widgetName?: string
  fallbackComponent?: React.ComponentType<any>
}

export const WidgetErrorBoundary: React.FC<WidgetErrorBoundaryProps> = ({ 
  children, 
  widgetName = 'Widget',
  fallbackComponent 
}) => {
  return (
    <ErrorBoundary
      level="component"
      fallback={fallbackComponent}
      onError={(error, errorInfo) => {
        console.error(`Widget error in ${widgetName}:`, error, errorInfo)
        // You could send widget-specific error data to analytics
      }}
    >
      {children}
    </ErrorBoundary>
  )
}