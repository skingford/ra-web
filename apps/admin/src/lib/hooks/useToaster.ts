import { useCallback } from 'react'

export interface ToastOptions {
  title: string
  description?: string
  status?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  isClosable?: boolean
}

// 简单的 toast 实现，替代 Chakra UI v2 的 useToast
export const useToaster = () => {
  const toast = useCallback((options: ToastOptions) => {
    // 在实际应用中，这里可以使用第三方 toast 库如 react-hot-toast
    // 或者实现自定义的 toast 系统
    console.log('Toast:', options)
    
    // 简单的浏览器通知实现
    if (typeof window !== 'undefined') {
      const message = options.description 
        ? `${options.title}: ${options.description}`
        : options.title
      
      // 可以在这里添加自定义的 toast UI 逻辑
      alert(message)
    }
  }, [])

  return toast
}