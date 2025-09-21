import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

// Design tokens
const tokens = {
  colors: {
    // Brand colors
    brand: {
      50: { value: '#e3f2fd' },
      100: { value: '#bbdefb' },
      200: { value: '#90caf9' },
      300: { value: '#64b5f6' },
      400: { value: '#42a5f5' },
      500: { value: '#2196f3' },
      600: { value: '#1e88e5' },
      700: { value: '#1976d2' },
      800: { value: '#1565c0' },
      900: { value: '#0d47a1' },
    },
    
    // Semantic colors
    success: {
      50: { value: '#e8f5e8' },
      100: { value: '#c3e6c3' },
      200: { value: '#9dd69d' },
      300: { value: '#76c576' },
      400: { value: '#57b757' },
      500: { value: '#4caf50' },
      600: { value: '#43a047' },
      700: { value: '#388e3c' },
      800: { value: '#2e7d32' },
      900: { value: '#1b5e20' },
    },
    
    warning: {
      50: { value: '#fff8e1' },
      100: { value: '#ffecb3' },
      200: { value: '#ffe082' },
      300: { value: '#ffd54f' },
      400: { value: '#ffca28' },
      500: { value: '#ffc107' },
      600: { value: '#ffb300' },
      700: { value: '#ffa000' },
      800: { value: '#ff8f00' },
      900: { value: '#ff6f00' },
    },
    
    error: {
      50: { value: '#ffebee' },
      100: { value: '#ffcdd2' },
      200: { value: '#ef9a9a' },
      300: { value: '#e57373' },
      400: { value: '#ef5350' },
      500: { value: '#f44336' },
      600: { value: '#e53935' },
      700: { value: '#d32f2f' },
      800: { value: '#c62828' },
      900: { value: '#b71c1c' },
    },
    
    // Neutral colors for better contrast
    neutral: {
      50: { value: '#fafafa' },
      100: { value: '#f5f5f5' },
      200: { value: '#eeeeee' },
      300: { value: '#e0e0e0' },
      400: { value: '#bdbdbd' },
      500: { value: '#9e9e9e' },
      600: { value: '#757575' },
      700: { value: '#616161' },
      800: { value: '#424242' },
      900: { value: '#212121' },
    },
  },
  
  fonts: {
    heading: { value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' },
    body: { value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' },
    mono: { value: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
  },
  
  fontSizes: {
    xs: { value: '0.75rem' },
    sm: { value: '0.875rem' },
    md: { value: '1rem' },
    lg: { value: '1.125rem' },
    xl: { value: '1.25rem' },
    '2xl': { value: '1.5rem' },
    '3xl': { value: '1.875rem' },
    '4xl': { value: '2.25rem' },
    '5xl': { value: '3rem' },
    '6xl': { value: '3.75rem' },
    '7xl': { value: '4.5rem' },
    '8xl': { value: '6rem' },
    '9xl': { value: '8rem' },
  },
  
  fontWeights: {
    hairline: { value: 100 },
    thin: { value: 200 },
    light: { value: 300 },
    normal: { value: 400 },
    medium: { value: 500 },
    semibold: { value: 600 },
    bold: { value: 700 },
    extrabold: { value: 800 },
    black: { value: 900 },
  },
  
  lineHeights: {
    normal: { value: 'normal' },
    none: { value: 1 },
    shorter: { value: 1.25 },
    short: { value: 1.375 },
    base: { value: 1.5 },
    tall: { value: 1.625 },
    taller: { value: 2 },
  },
  
  radii: {
    none: { value: '0' },
    sm: { value: '0.125rem' },
    base: { value: '0.25rem' },
    md: { value: '0.375rem' },
    lg: { value: '0.5rem' },
    xl: { value: '0.75rem' },
    '2xl': { value: '1rem' },
    '3xl': { value: '1.5rem' },
    full: { value: '9999px' },
  },
  
  shadows: {
    xs: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
    sm: { value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
    base: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
    md: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    lg: { value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
    xl: { value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    '2xl': { value: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    inner: { value: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' },
  },
  
  spacing: {
    px: { value: '1px' },
    0.5: { value: '0.125rem' },
    1: { value: '0.25rem' },
    1.5: { value: '0.375rem' },
    2: { value: '0.5rem' },
    2.5: { value: '0.625rem' },
    3: { value: '0.75rem' },
    3.5: { value: '0.875rem' },
    4: { value: '1rem' },
    5: { value: '1.25rem' },
    6: { value: '1.5rem' },
    7: { value: '1.75rem' },
    8: { value: '2rem' },
    9: { value: '2.25rem' },
    10: { value: '2.5rem' },
    12: { value: '3rem' },
    14: { value: '3.5rem' },
    16: { value: '4rem' },
    20: { value: '5rem' },
    24: { value: '6rem' },
    28: { value: '7rem' },
    32: { value: '8rem' },
    36: { value: '9rem' },
    40: { value: '10rem' },
    44: { value: '11rem' },
    48: { value: '12rem' },
    52: { value: '13rem' },
    56: { value: '14rem' },
    60: { value: '15rem' },
    64: { value: '16rem' },
    72: { value: '18rem' },
    80: { value: '20rem' },
    96: { value: '24rem' },
  },
}

// Breakpoints for responsive design
const breakpoints = {
  base: '0px',
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1280px',
  '2xl': '1536px',
}

// Component-specific theme overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
      _focus: {
        boxShadow: 'outline',
      },
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          _disabled: {
            bg: 'brand.500',
          },
        },
        _active: {
          bg: 'brand.700',
        },
      },
      outline: {
        border: '1px solid',
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
        },
        _active: {
          bg: 'brand.100',
        },
      },
      ghost: {
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
        },
        _active: {
          bg: 'brand.100',
        },
      },
    },
    sizes: {
      sm: {
        h: 8,
        minW: 8,
        fontSize: 'sm',
        px: 3,
      },
      md: {
        h: 10,
        minW: 10,
        fontSize: 'md',
        px: 4,
      },
      lg: {
        h: 12,
        minW: 12,
        fontSize: 'lg',
        px: 6,
      },
    },
    defaultProps: {
      size: 'md',
      variant: 'solid',
    },
  },
  
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        boxShadow: 'sm',
        borderRadius: 'lg',
        border: '1px solid',
        borderColor: 'neutral.200',
        _dark: {
          bg: 'neutral.800',
          borderColor: 'neutral.700',
        },
      },
      header: {
        px: 6,
        py: 4,
        borderBottom: '1px solid',
        borderColor: 'neutral.200',
        _dark: {
          borderColor: 'neutral.700',
        },
      },
      body: {
        px: 6,
        py: 4,
      },
      footer: {
        px: 6,
        py: 4,
        borderTop: '1px solid',
        borderColor: 'neutral.200',
        _dark: {
          borderColor: 'neutral.700',
        },
      },
    },
  },
  
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'md',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
        },
      },
    },
    variants: {
      outline: {
        field: {
          border: '1px solid',
          borderColor: 'neutral.300',
          _hover: {
            borderColor: 'neutral.400',
          },
          _invalid: {
            borderColor: 'error.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-error-500)',
          },
          _dark: {
            borderColor: 'neutral.600',
            _hover: {
              borderColor: 'neutral.500',
            },
          },
        },
      },
    },
  },
  
  Table: {
    baseStyle: {
      table: {
        borderCollapse: 'collapse',
      },
      th: {
        fontWeight: 'semibold',
        textTransform: 'none',
        letterSpacing: 'normal',
        borderBottom: '1px solid',
        borderColor: 'neutral.200',
        _dark: {
          borderColor: 'neutral.700',
        },
      },
      td: {
        borderBottom: '1px solid',
        borderColor: 'neutral.100',
        _dark: {
          borderColor: 'neutral.800',
        },
      },
    },
    variants: {
      simple: {
        th: {
          color: 'neutral.600',
          _dark: {
            color: 'neutral.400',
          },
        },
        td: {
          color: 'neutral.900',
          _dark: {
            color: 'neutral.100',
          },
        },
      },
    },
  },
}

// Global styles
const globalCss = {
  'html, body': {
    fontFamily: 'body',
    color: 'neutral.900',
    bg: 'neutral.50',
    lineHeight: 'base',
    _dark: {
      color: 'neutral.100',
      bg: 'neutral.900',
    },
  },
  '*::placeholder': {
    color: 'neutral.400',
  },
  '*, *::before, &::after': {
    borderColor: 'neutral.200',
    _dark: {
      borderColor: 'neutral.700',
    },
  },
}

// Create the theme configuration
const themeConfig = defineConfig({
  theme: {
    tokens,
    breakpoints,
  },
  globalCss,
})

// Create and export the system
export const system = createSystem(defaultConfig, themeConfig)

// Export theme utilities
export const theme = {
  breakpoints,
  tokens,
  components,
}

// Responsive breakpoint utilities
export const breakpointUtils = {
  // Check if current screen size matches breakpoint
  isBreakpoint: (breakpoint: keyof typeof breakpoints) => {
    if (typeof window === 'undefined') return false
    const bp = breakpoints[breakpoint]
    return window.matchMedia(`(min-width: ${bp})`).matches
  },
  
  // Get current breakpoint
  getCurrentBreakpoint: (): keyof typeof breakpoints => {
    if (typeof window === 'undefined') return 'base'
    
    const width = window.innerWidth
    if (width >= parseInt(breakpoints['2xl'])) return '2xl'
    if (width >= parseInt(breakpoints.xl)) return 'xl'
    if (width >= parseInt(breakpoints.lg)) return 'lg'
    if (width >= parseInt(breakpoints.md)) return 'md'
    if (width >= parseInt(breakpoints.sm)) return 'sm'
    return 'base'
  },
  
  // Create responsive array values
  responsive: <T>(values: Partial<Record<keyof typeof breakpoints, T>>) => {
    return Object.entries(breakpoints).map(([key]) => 
      values[key as keyof typeof breakpoints]
    ).filter(Boolean)
  },
}

// Color mode utilities
export const colorModeUtils = {
  // Get color value based on color mode
  mode: (light: string, dark: string) => ({
    _light: light,
    _dark: dark,
  }),
  
  // Toggle color mode
  toggleColorMode: () => {
    // This would be implemented with Chakra's useColorMode hook
    console.log('Color mode toggle - implement with useColorMode hook')
  },
}