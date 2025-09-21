import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { system, theme, breakpointUtils, colorModeUtils } from '../index'

// Mock window object for breakpoint tests
// const mockWindow = {
//   innerWidth: 1024,
//   matchMedia: vi.fn(),
// }

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: vi.fn(),
})

describe('Theme System', () => {
  describe('System Configuration', () => {
    it('should export a valid Chakra UI system', () => {
      expect(system).toBeDefined()
      expect(system.token).toBeDefined()
      expect(typeof system.token).toBe('function')
    })

    it('should have all required theme tokens', () => {
      expect(theme.tokens).toBeDefined()
      expect(theme.tokens.colors).toBeDefined()
      expect(theme.tokens.fonts).toBeDefined()
      expect(theme.tokens.fontSizes).toBeDefined()
      expect(theme.tokens.spacing).toBeDefined()
    })

    it('should have brand colors defined', () => {
      const brandColors = theme.tokens.colors.brand
      expect(brandColors).toBeDefined()
      expect(brandColors[50]).toEqual({ value: '#e3f2fd' })
      expect(brandColors[500]).toEqual({ value: '#2196f3' })
      expect(brandColors[900]).toEqual({ value: '#0d47a1' })
    })

    it('should have semantic colors defined', () => {
      const { success, warning, error } = theme.tokens.colors
      expect(success).toBeDefined()
      expect(warning).toBeDefined()
      expect(error).toBeDefined()
      
      expect(success[500]).toEqual({ value: '#4caf50' })
      expect(warning[500]).toEqual({ value: '#ffc107' })
      expect(error[500]).toEqual({ value: '#f44336' })
    })

    it('should have neutral colors for better contrast', () => {
      const neutral = theme.tokens.colors.neutral
      expect(neutral).toBeDefined()
      expect(neutral[50]).toEqual({ value: '#fafafa' })
      expect(neutral[900]).toEqual({ value: '#212121' })
    })
  })

  describe('Typography', () => {
    it('should have font families defined', () => {
      const { fonts } = theme.tokens
      expect(fonts.heading.value).toContain('Inter')
      expect(fonts.body.value).toContain('Inter')
      expect(fonts.mono.value).toContain('SFMono-Regular')
    })

    it('should have font sizes defined', () => {
      const { fontSizes } = theme.tokens
      expect(fontSizes.xs).toEqual({ value: '0.75rem' })
      expect(fontSizes.md).toEqual({ value: '1rem' })
      expect(fontSizes['2xl']).toEqual({ value: '1.5rem' })
    })

    it('should have font weights defined', () => {
      const { fontWeights } = theme.tokens
      expect(fontWeights.normal).toEqual({ value: 400 })
      expect(fontWeights.medium).toEqual({ value: 500 })
      expect(fontWeights.bold).toEqual({ value: 700 })
    })

    it('should have line heights defined', () => {
      const { lineHeights } = theme.tokens
      expect(lineHeights.normal).toEqual({ value: 'normal' })
      expect(lineHeights.base).toEqual({ value: 1.5 })
      expect(lineHeights.tall).toEqual({ value: 1.625 })
    })
  })

  describe('Spacing and Layout', () => {
    it('should have spacing tokens defined', () => {
      const { spacing } = theme.tokens
      expect(spacing.px).toEqual({ value: '1px' })
      expect(spacing[4]).toEqual({ value: '1rem' })
      expect(spacing[8]).toEqual({ value: '2rem' })
    })

    it('should have border radius tokens defined', () => {
      const { radii } = theme.tokens
      expect(radii.none).toEqual({ value: '0' })
      expect(radii.md).toEqual({ value: '0.375rem' })
      expect(radii.full).toEqual({ value: '9999px' })
    })

    it('should have shadow tokens defined', () => {
      const { shadows } = theme.tokens
      expect(shadows.sm).toBeDefined()
      expect(shadows.md).toBeDefined()
      expect(shadows.lg).toBeDefined()
      expect(shadows.inner).toBeDefined()
    })
  })

  describe('Breakpoints', () => {
    it('should have responsive breakpoints defined', () => {
      expect(theme.breakpoints).toBeDefined()
      expect(theme.breakpoints.base).toBe('0px')
      expect(theme.breakpoints.sm).toBe('480px')
      expect(theme.breakpoints.md).toBe('768px')
      expect(theme.breakpoints.lg).toBe('992px')
      expect(theme.breakpoints.xl).toBe('1280px')
      expect(theme.breakpoints['2xl']).toBe('1536px')
    })

    it('should match design system breakpoints', () => {
      const expectedBreakpoints = {
        base: '0px',
        sm: '480px',
        md: '768px',
        lg: '992px',
        xl: '1280px',
        '2xl': '1536px',
      }
      
      expect(theme.breakpoints).toEqual(expectedBreakpoints)
    })
  })

  describe('Component Themes', () => {
    it('should have Button component theme', () => {
      const buttonTheme = theme.components.Button
      expect(buttonTheme).toBeDefined()
      expect(buttonTheme.baseStyle).toBeDefined()
      expect(buttonTheme.variants).toBeDefined()
      expect(buttonTheme.sizes).toBeDefined()
      expect(buttonTheme.defaultProps).toBeDefined()
    })

    it('should have Card component theme', () => {
      const cardTheme = theme.components.Card
      expect(cardTheme).toBeDefined()
      expect(cardTheme.baseStyle).toBeDefined()
      expect(cardTheme.baseStyle.container).toBeDefined()
      expect(cardTheme.baseStyle.header).toBeDefined()
      expect(cardTheme.baseStyle.body).toBeDefined()
    })

    it('should have Input component theme', () => {
      const inputTheme = theme.components.Input
      expect(inputTheme).toBeDefined()
      expect(inputTheme.baseStyle).toBeDefined()
      expect(inputTheme.variants).toBeDefined()
    })

    it('should have Table component theme', () => {
      const tableTheme = theme.components.Table
      expect(tableTheme).toBeDefined()
      expect(tableTheme.baseStyle).toBeDefined()
      expect(tableTheme.variants).toBeDefined()
    })
  })
})

describe('Breakpoint Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isBreakpoint', () => {
    it('should return false when window is undefined (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const result = breakpointUtils.isBreakpoint('md')
      expect(result).toBe(false)
      
      global.window = originalWindow
    })

    it('should check if current screen matches breakpoint', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: true })
      window.matchMedia = mockMatchMedia
      
      const result = breakpointUtils.isBreakpoint('md')
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)')
      expect(result).toBe(true)
    })

    it('should return false when breakpoint does not match', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({ matches: false })
      window.matchMedia = mockMatchMedia
      
      const result = breakpointUtils.isBreakpoint('lg')
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 992px)')
      expect(result).toBe(false)
    })
  })

  describe('getCurrentBreakpoint', () => {
    it('should return base when window is undefined (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      
      const result = breakpointUtils.getCurrentBreakpoint()
      expect(result).toBe('base')
      
      global.window = originalWindow
    })

    it('should return correct breakpoint for different screen sizes', () => {
      // Test 2xl breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 1600, configurable: true })
      expect(breakpointUtils.getCurrentBreakpoint()).toBe('2xl')
      
      // Test xl breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 1300, configurable: true })
      expect(breakpointUtils.getCurrentBreakpoint()).toBe('xl')
      
      // Test lg breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true })
      expect(breakpointUtils.getCurrentBreakpoint()).toBe('lg')
      
      // Test md breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true })
      expect(breakpointUtils.getCurrentBreakpoint()).toBe('md')
      
      // Test sm breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 500, configurable: true })
      expect(breakpointUtils.getCurrentBreakpoint()).toBe('sm')
      
      // Test base breakpoint
      Object.defineProperty(window, 'innerWidth', { value: 400, configurable: true })
      expect(breakpointUtils.getCurrentBreakpoint()).toBe('base')
    })
  })

  describe('responsive', () => {
    it('should create responsive array values', () => {
      const values = {
        base: 'small',
        md: 'medium',
        lg: 'large',
      }
      
      const result = breakpointUtils.responsive(values)
      
      expect(result).toEqual(['small', 'medium', 'large'])
    })

    it('should filter out undefined values', () => {
      const values = {
        base: 'small',
        lg: 'large',
      }
      
      const result = breakpointUtils.responsive(values)
      
      expect(result).toEqual(['small', 'large'])
    })
  })
})

describe('Color Mode Utilities', () => {
  describe('mode', () => {
    it('should create color mode object', () => {
      const result = colorModeUtils.mode('white', 'black')
      
      expect(result).toEqual({
        _light: 'white',
        _dark: 'black',
      })
    })
  })

  describe('toggleColorMode', () => {
    it('should log toggle message', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      
      colorModeUtils.toggleColorMode()
      
      expect(consoleSpy).toHaveBeenCalledWith('Color mode toggle - implement with useColorMode hook')
      
      consoleSpy.mockRestore()
    })
  })
})