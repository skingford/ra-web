import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useKeyboardNavigation, useFocusTrap } from '../useKeyboardNavigation'

// Mock DOM methods
const mockFocus = vi.fn()
const mockQuerySelectorAll = vi.fn()
const mockAddEventListener = vi.fn()
const mockRemoveEventListener = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  
  // Mock DOM elements
  const mockElements = [
    { focus: mockFocus, disabled: false, offsetParent: {}, style: { visibility: 'visible' } },
    { focus: mockFocus, disabled: false, offsetParent: {}, style: { visibility: 'visible' } },
    { focus: mockFocus, disabled: false, offsetParent: {}, style: { visibility: 'visible' } },
  ]
  
  mockQuerySelectorAll.mockReturnValue(mockElements)
  
  // Mock container ref
  Object.defineProperty(HTMLElement.prototype, 'querySelectorAll', {
    value: mockQuerySelectorAll,
  })
  
  Object.defineProperty(HTMLElement.prototype, 'addEventListener', {
    value: mockAddEventListener,
  })
  
  Object.defineProperty(HTMLElement.prototype, 'removeEventListener', {
    value: mockRemoveEventListener,
  })
})

describe('useKeyboardNavigation', () => {
  it('initializes with default options', () => {
    const { result } = renderHook(() => useKeyboardNavigation())
    
    expect(result.current.currentIndex).toBe(-1)
    expect(result.current.isKeyboardMode).toBe(false)
    expect(typeof result.current.focusElementAtIndex).toBe('function')
    expect(typeof result.current.getFocusableElements).toBe('function')
  })

  it('focuses element at specified index', () => {
    const { result } = renderHook(() => useKeyboardNavigation())
    
    // Mock container ref
    const mockContainer = {
      querySelectorAll: mockQuerySelectorAll,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      classList: { add: vi.fn(), remove: vi.fn() },
    }
    
    result.current.containerRef.current = mockContainer as any
    
    act(() => {
      result.current.focusElementAtIndex(1)
    })
    
    expect(mockFocus).toHaveBeenCalled()
    expect(result.current.currentIndex).toBe(1)
  })

  it('handles keyboard navigation with arrow keys', () => {
    const { result } = renderHook(() => useKeyboardNavigation({ loop: true }))
    
    const mockContainer = {
      querySelectorAll: mockQuerySelectorAll,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      classList: { add: vi.fn(), remove: vi.fn() },
    }
    
    result.current.containerRef.current = mockContainer as any
    
    // Simulate ArrowDown key press
    const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' })
    Object.defineProperty(keyDownEvent, 'preventDefault', { value: vi.fn() })
    
    act(() => {
      mockAddEventListener.mock.calls
        .find(call => call[0] === 'keydown')?.[1]?.(keyDownEvent)
    })
    
    expect(result.current.isKeyboardMode).toBe(true)
  })

  it('calls onEscape callback when Escape key is pressed', () => {
    const onEscape = vi.fn()
    const { result } = renderHook(() => useKeyboardNavigation({ onEscape }))
    
    const mockContainer = {
      querySelectorAll: mockQuerySelectorAll,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      classList: { add: vi.fn(), remove: vi.fn() },
    }
    
    result.current.containerRef.current = mockContainer as any
    
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
    Object.defineProperty(escapeEvent, 'preventDefault', { value: vi.fn() })
    
    act(() => {
      mockAddEventListener.mock.calls
        .find(call => call[0] === 'keydown')?.[1]?.(escapeEvent)
    })
    
    expect(onEscape).toHaveBeenCalled()
  })

  it('filters out disabled and hidden elements', () => {
    const mockElementsWithDisabled = [
      { focus: mockFocus, disabled: true, offsetParent: {}, style: { visibility: 'visible' } },
      { focus: mockFocus, disabled: false, offsetParent: null, style: { visibility: 'visible' } },
      { focus: mockFocus, disabled: false, offsetParent: {}, style: { visibility: 'hidden' } },
      { focus: mockFocus, disabled: false, offsetParent: {}, style: { visibility: 'visible' } },
    ]
    
    mockQuerySelectorAll.mockReturnValue(mockElementsWithDisabled)
    
    const { result } = renderHook(() => useKeyboardNavigation())
    
    const mockContainer = {
      querySelectorAll: mockQuerySelectorAll,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      classList: { add: vi.fn(), remove: vi.fn() },
    }
    
    result.current.containerRef.current = mockContainer as any
    
    const focusableElements = result.current.getFocusableElements()
    expect(focusableElements).toHaveLength(1) // Only one element should be focusable
  })
})

describe('useFocusTrap', () => {
  it('focuses first element when trap becomes active', () => {
    const { result } = renderHook(() => useFocusTrap(true))
    
    const mockFirstElement = { focus: mockFocus }
    const mockLastElement = { focus: mockFocus }
    
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([mockFirstElement, mockLastElement]),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }
    
    result.current.current = mockContainer as any
    
    expect(mockFocus).toHaveBeenCalled()
  })

  it('traps focus within container', () => {
    const { result } = renderHook(() => useFocusTrap(true))
    
    const mockFirstElement = { focus: mockFocus }
    const mockLastElement = { focus: mockFocus }
    
    const mockContainer = {
      querySelectorAll: vi.fn().mockReturnValue([mockFirstElement, mockLastElement]),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    }
    
    result.current.current = mockContainer as any
    
    // Simulate Tab key on last element
    Object.defineProperty(document, 'activeElement', {
      value: mockLastElement,
      configurable: true,
    })
    
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' })
    Object.defineProperty(tabEvent, 'preventDefault', { value: vi.fn() })
    
    act(() => {
      mockAddEventListener.mock.calls
        .find(call => call[0] === 'keydown')?.[1]?.(tabEvent)
    })
    
    expect(mockFirstElement.focus).toHaveBeenCalled()
  })
})