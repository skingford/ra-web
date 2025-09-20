import { describe, it, expect } from 'vitest'
import { themeUtils, responsivePatterns, themeValidation } from '../utils'

describe('Theme Utils', () => {
  describe('themeUtils', () => {
    describe('createResponsiveValue', () => {
      it('should create responsive value with base only', () => {
        const result = themeUtils.createResponsiveValue('small')
        expect(result).toEqual({ base: 'small' })
      })

      it('should create responsive value with multiple breakpoints', () => {
        const result = themeUtils.createResponsiveValue('small', 'medium', 'large')
        expect(result).toEqual({
          base: 'small',
          sm: 'medium',
          md: 'large',
        })
      })

      it('should create responsive value with all breakpoints', () => {
        const result = themeUtils.createResponsiveValue(
          'xs', 'sm', 'md', 'lg', 'xl', '2xl'
        )
        expect(result).toEqual({
          base: 'xs',
          sm: 'sm',
          md: 'md',
          lg: 'lg',
          xl: 'xl',
          '2xl': '2xl',
        })
      })

      it('should skip undefined values', () => {
        const result = themeUtils.createResponsiveValue('base', undefined, 'md')
        expect(result).toEqual({
          base: 'base',
          md: 'md',
        })
      })
    })

    describe('CSS variable helpers', () => {
      it('should get spacing value for number', () => {
        const result = themeUtils.getSpacing(4)
        expect(result).toBe('var(--chakra-space-4)')
      })

      it('should get spacing value for string', () => {
        const result = themeUtils.getSpacing('1rem')
        expect(result).toBe('1rem')
      })

      it('should get color value', () => {
        const result = themeUtils.getColor('brand.500')
        expect(result).toBe('var(--chakra-colors-brand-500)')
      })

      it('should get font size value', () => {
        const result = themeUtils.getFontSize('md')
        expect(result).toBe('var(--chakra-fontSizes-md)')
      })

      it('should get shadow value', () => {
        const result = themeUtils.getShadow('md')
        expect(result).toBe('var(--chakra-shadows-md)')
      })

      it('should get border radius value', () => {
        const result = themeUtils.getBorderRadius('lg')
        expect(result).toBe('var(--chakra-radii-lg)')
      })
    })
  })

  describe('responsivePatterns', () => {
    it('should have padding patterns', () => {
      expect(responsivePatterns.padding.section).toEqual({
        base: 4,
        md: 6,
        lg: 8,
      })
      
      expect(responsivePatterns.padding.card).toEqual({
        base: 4,
        md: 6,
      })
      
      expect(responsivePatterns.padding.container).toEqual({
        base: 4,
        sm: 6,
        md: 8,
        lg: 12,
      })
    })

    it('should have margin patterns', () => {
      expect(responsivePatterns.margin.section).toEqual({
        base: 4,
        md: 6,
        lg: 8,
      })
      
      expect(responsivePatterns.margin.element).toEqual({
        base: 2,
        md: 4,
      })
    })

    it('should have font size patterns', () => {
      expect(responsivePatterns.fontSize.heading).toEqual({
        base: 'xl',
        md: '2xl',
        lg: '3xl',
      })
      
      expect(responsivePatterns.fontSize.subheading).toEqual({
        base: 'lg',
        md: 'xl',
      })
      
      expect(responsivePatterns.fontSize.body).toEqual({
        base: 'sm',
        md: 'md',
      })
    })

    it('should have grid patterns', () => {
      expect(responsivePatterns.grid.columns).toEqual({
        base: 1,
        md: 2,
        lg: 3,
      })
      
      expect(responsivePatterns.grid.columnsWide).toEqual({
        base: 1,
        sm: 2,
        md: 3,
        lg: 4,
      })
    })
  })

  describe('themeValidation', () => {
    describe('isValidColor', () => {
      it('should validate color tokens', () => {
        expect(themeValidation.isValidColor('brand.500')).toBe(true)
        expect(themeValidation.isValidColor('success.300')).toBe(true)
        expect(themeValidation.isValidColor('neutral.100')).toBe(true)
      })

      it('should validate basic colors', () => {
        expect(themeValidation.isValidColor('white')).toBe(true)
        expect(themeValidation.isValidColor('black')).toBe(true)
        expect(themeValidation.isValidColor('transparent')).toBe(true)
      })

      it('should reject invalid colors', () => {
        expect(themeValidation.isValidColor('invalidcolor')).toBe(false)
        expect(themeValidation.isValidColor('red')).toBe(false)
      })
    })

    describe('isValidSpacing', () => {
      it('should validate number spacing', () => {
        expect(themeValidation.isValidSpacing(0)).toBe(true)
        expect(themeValidation.isValidSpacing(4)).toBe(true)
        expect(themeValidation.isValidSpacing(8)).toBe(true)
      })

      it('should validate string spacing', () => {
        expect(themeValidation.isValidSpacing('auto')).toBe(true)
        expect(themeValidation.isValidSpacing('px')).toBe(true)
        expect(themeValidation.isValidSpacing('1rem')).toBe(true)
        expect(themeValidation.isValidSpacing('2.5em')).toBe(true)
        expect(themeValidation.isValidSpacing('16px')).toBe(true)
      })

      it('should reject invalid spacing', () => {
        expect(themeValidation.isValidSpacing(-1)).toBe(false)
        expect(themeValidation.isValidSpacing('invalid')).toBe(false)
        expect(themeValidation.isValidSpacing('1')).toBe(false)
      })
    })

    describe('isValidBreakpoint', () => {
      it('should validate breakpoints', () => {
        expect(themeValidation.isValidBreakpoint('base')).toBe(true)
        expect(themeValidation.isValidBreakpoint('sm')).toBe(true)
        expect(themeValidation.isValidBreakpoint('md')).toBe(true)
        expect(themeValidation.isValidBreakpoint('lg')).toBe(true)
        expect(themeValidation.isValidBreakpoint('xl')).toBe(true)
        expect(themeValidation.isValidBreakpoint('2xl')).toBe(true)
      })

      it('should reject invalid breakpoints', () => {
        expect(themeValidation.isValidBreakpoint('xs')).toBe(false)
        expect(themeValidation.isValidBreakpoint('3xl')).toBe(false)
        expect(themeValidation.isValidBreakpoint('invalid')).toBe(false)
      })
    })
  })
})