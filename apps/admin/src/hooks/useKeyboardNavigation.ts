import { useEffect, useRef, useState } from 'react'

interface KeyboardNavigationOptions {
  selector?: string
  loop?: boolean
  autoFocus?: boolean
  onEscape?: () => void
  onEnter?: (element: HTMLElement) => void
}

export const useKeyboardNavigation = (options: KeyboardNavigationOptions = {}) => {
  const {
    selector = '[role="menuitem"], button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
    loop = true,
    autoFocus = false,
    onEscape,
    onEnter,
  } = options

  const containerRef = useRef<HTMLElement>(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isKeyboardMode, setIsKeyboardMode] = useState(false)

  // Get all focusable elements
  const getFocusableElements = (): HTMLElement[] => {
    if (!containerRef.current) return []
    
    const elements = Array.from(
      containerRef.current.querySelectorAll(selector)
    ) as HTMLElement[]
    
    return elements.filter(element => {
      return (
        !element.disabled &&
        element.offsetParent !== null &&
        getComputedStyle(element).visibility !== 'hidden'
      )
    })
  }

  // Focus element at index
  const focusElementAtIndex = (index: number) => {
    const elements = getFocusableElements()
    if (elements[index]) {
      elements[index].focus()
      setCurrentIndex(index)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent) => {
    const elements = getFocusableElements()
    if (elements.length === 0) return

    setIsKeyboardMode(true)

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault()
        const nextIndex = currentIndex === -1 ? 0 : 
          loop ? (currentIndex + 1) % elements.length : 
          Math.min(currentIndex + 1, elements.length - 1)
        focusElementAtIndex(nextIndex)
        break

      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault()
        const prevIndex = currentIndex === -1 ? elements.length - 1 : 
          loop ? (currentIndex - 1 + elements.length) % elements.length : 
          Math.max(currentIndex - 1, 0)
        focusElementAtIndex(prevIndex)
        break

      case 'Home':
        event.preventDefault()
        focusElementAtIndex(0)
        break

      case 'End':
        event.preventDefault()
        focusElementAtIndex(elements.length - 1)
        break

      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break

      case 'Enter':
      case ' ':
        if (event.target && onEnter) {
          event.preventDefault()
          onEnter(event.target as HTMLElement)
        }
        break
    }
  }

  // Handle mouse interactions
  const handleMouseMove = () => {
    setIsKeyboardMode(false)
  }

  // Update current index when focus changes
  const handleFocusChange = (event: FocusEvent) => {
    if (!containerRef.current?.contains(event.target as Node)) {
      setCurrentIndex(-1)
      return
    }

    const elements = getFocusableElements()
    const focusedElement = event.target as HTMLElement
    const index = elements.indexOf(focusedElement)
    setCurrentIndex(index)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Add keyboard mode class
    if (isKeyboardMode) {
      container.classList.add('keyboard-navigation')
    } else {
      container.classList.remove('keyboard-navigation')
    }

    // Add event listeners
    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('focusin', handleFocusChange)

    // Auto focus first element if requested
    if (autoFocus && currentIndex === -1) {
      const elements = getFocusableElements()
      if (elements.length > 0) {
        focusElementAtIndex(0)
      }
    }

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('focusin', handleFocusChange)
    }
  }, [currentIndex, isKeyboardMode, autoFocus])

  return {
    containerRef,
    currentIndex,
    isKeyboardMode,
    focusElementAtIndex,
    getFocusableElements,
  }
}

// Hook for managing focus trap (useful for modals, dropdowns)
export const useFocusTrap = (isActive: boolean = true) => {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Focus first element when trap becomes active
    firstElement?.focus()

    container.addEventListener('keydown', handleTabKey)

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return containerRef
}

// Hook for skip links
export const useSkipLinks = () => {
  const skipLinksRef = useRef<HTMLElement>(null)

  const addSkipLink = (target: string, label: string) => {
    if (!skipLinksRef.current) return

    const link = document.createElement('a')
    link.href = `#${target}`
    link.className = 'skip-link'
    link.textContent = label
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const targetElement = document.getElementById(target)
      if (targetElement) {
        targetElement.focus()
        targetElement.scrollIntoView({ behavior: 'smooth' })
      }
    })

    skipLinksRef.current.appendChild(link)
  }

  useEffect(() => {
    // Add common skip links
    addSkipLink('main-content', 'Skip to main content')
    addSkipLink('navigation', 'Skip to navigation')
    addSkipLink('search', 'Skip to search')
  }, [])

  return skipLinksRef
}