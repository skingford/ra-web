import { breakpointUtils } from './index'

// Re-export utilities for easier access
export { breakpointUtils, colorModeUtils } from './index'

// Additional theme utilities
export const themeUtils = {
  // Create responsive values helper
  createResponsiveValue: <T>(
    base: T,
    sm?: T,
    md?: T,
    lg?: T,
    xl?: T,
    xxl?: T
  ) => {
    const values: Record<string, T> = { base }
    if (sm !== undefined) values.sm = sm
    if (md !== undefined) values.md = md
    if (lg !== undefined) values.lg = lg
    if (xl !== undefined) values.xl = xl
    if (xxl !== undefined) values['2xl'] = xxl
    
    return values
  },

  // Get spacing value
  getSpacing: (value: number | string) => {
    if (typeof value === 'number') {
      return `var(--chakra-space-${value})`
    }
    return value
  },

  // Get color value
  getColor: (color: string) => {
    return `var(--chakra-colors-${color.replace('.', '-')})`
  },

  // Get font size value
  getFontSize: (size: string) => {
    return `var(--chakra-fontSizes-${size})`
  },

  // Create shadow value
  getShadow: (shadow: string) => {
    return `var(--chakra-shadows-${shadow})`
  },

  // Create border radius value
  getBorderRadius: (radius: string) => {
    return `var(--chakra-radii-${radius})`
  },
}

// Commonly used responsive patterns
export const responsivePatterns = {
  // Common padding patterns
  padding: {
    section: { base: 4, md: 6, lg: 8 },
    card: { base: 4, md: 6 },
    container: { base: 4, sm: 6, md: 8, lg: 12 },
  },

  // Common margin patterns
  margin: {
    section: { base: 4, md: 6, lg: 8 },
    element: { base: 2, md: 4 },
  },

  // Common font size patterns
  fontSize: {
    heading: { base: 'xl', md: '2xl', lg: '3xl' },
    subheading: { base: 'lg', md: 'xl' },
    body: { base: 'sm', md: 'md' },
  },

  // Common grid patterns
  grid: {
    columns: { base: 1, md: 2, lg: 3 },
    columnsWide: { base: 1, sm: 2, md: 3, lg: 4 },
  },
}

// Theme validation utilities
export const themeValidation = {
  // Check if a color exists in the theme
  isValidColor: (color: string): boolean => {
    // This would need to be implemented with actual theme checking
    // For now, return true for basic validation
    return color.includes('.') || ['white', 'black', 'transparent'].includes(color)
  },

  // Check if a spacing value is valid
  isValidSpacing: (spacing: string | number): boolean => {
    if (typeof spacing === 'number') return spacing >= 0
    return ['auto', 'px'].includes(spacing) || spacing.match(/^\d+(\.\d+)?(rem|em|px)$/) !== null
  },

  // Check if a breakpoint is valid
  isValidBreakpoint: (breakpoint: string): boolean => {
    return ['base', 'sm', 'md', 'lg', 'xl', '2xl'].includes(breakpoint)
  },
}