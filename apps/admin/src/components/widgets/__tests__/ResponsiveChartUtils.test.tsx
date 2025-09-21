import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi } from 'vitest';
import {
  useResponsiveChart,
  useChartColors,
  useChartInteractions,
  formatChartValue,
  calculateTrendDirection,
  calculatePercentageChange,
  useChartBreakpoint,
} from '../ResponsiveChartUtils';

// Mock Chakra UI hooks
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useBreakpointValue: vi.fn((values) => values.lg || values.desktop),
    // useColorModeValue is no longer used in Chakra UI v3
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('ResponsiveChartUtils', () => {
  describe('useResponsiveChart', () => {
    it('returns desktop configuration by default', () => {
      const baseConfig = { chartType: 'line' };
      const { result } = renderHook(() => useResponsiveChart(baseConfig), { wrapper });

      expect(result.current).toMatchObject({
        chartType: 'line',
        height: 400,
        showLegend: true,
        showGrid: true,
        fontSize: 14,
      });
    });

    it('includes responsive margins', () => {
      const baseConfig = { chartType: 'bar' };
      const { result } = renderHook(() => useResponsiveChart(baseConfig), { wrapper });

      expect(result.current.margin).toEqual({
        top: 20,
        right: 30,
        left: 20,
        bottom: 20,
      });
    });
  });

  describe('useChartColors', () => {
    it('returns light theme colors by default', () => {
      const { result } = renderHook(() => useChartColors(), { wrapper });

      expect(result.current).toMatchObject({
        primary: '#3182CE',
        secondary: '#38A169',
        accent: '#D69E2E',
        error: '#E53E3E',
        warning: '#DD6B20',
        grid: '#E2E8F0',
        text: '#2D3748',
        background: '#FFFFFF',
      });
    });
  });

  describe('useChartInteractions', () => {
    it('manages hover and selection state correctly', () => {
      const { result } = renderHook(() => useChartInteractions());

      expect(result.current.hoveredData).toBeNull();
      expect(result.current.selectedData).toBeNull();

      act(() => {
        result.current.handleMouseEnter({ value: 100 });
      });

      expect(result.current.hoveredData).toEqual({ value: 100 });

      act(() => {
        result.current.handleClick({ value: 200 });
      });

      expect(result.current.selectedData).toEqual({ value: 200 });

      act(() => {
        result.current.handleMouseLeave();
      });

      expect(result.current.hoveredData).toBeNull();
      expect(result.current.selectedData).toEqual({ value: 200 });

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedData).toBeNull();
    });
  });

  describe('formatChartValue', () => {
    it('formats currency values correctly', () => {
      expect(formatChartValue(1234.56, 'currency')).toBe('$1,235');
      expect(formatChartValue(0, 'currency')).toBe('$0');
    });

    it('formats percentage values correctly', () => {
      expect(formatChartValue(15.678, 'percentage')).toBe('15.7%');
      expect(formatChartValue(0, 'percentage')).toBe('0.0%');
    });

    it('formats compact values correctly', () => {
      expect(formatChartValue(1234567, 'compact')).toBe('1.2M');
      expect(formatChartValue(1234, 'compact')).toBe('1.2K');
    });

    it('formats number values correctly', () => {
      expect(formatChartValue(1234567)).toBe('1,234,567');
      expect(formatChartValue(1234567, 'number')).toBe('1,234,567');
    });
  });

  describe('calculateTrendDirection', () => {
    it('calculates trend direction correctly', () => {
      expect(calculateTrendDirection(100, 80)).toBe('up');
      expect(calculateTrendDirection(80, 100)).toBe('down');
      expect(calculateTrendDirection(100, 100)).toBe('neutral');
    });
  });

  describe('calculatePercentageChange', () => {
    it('calculates percentage change correctly', () => {
      expect(calculatePercentageChange(120, 100)).toBe(20);
      expect(calculatePercentageChange(80, 100)).toBe(-20);
      expect(calculatePercentageChange(100, 100)).toBe(0);
      expect(calculatePercentageChange(100, 0)).toBe(0);
    });
  });

  describe('useChartBreakpoint', () => {
    beforeEach(() => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });
    });

    it('detects desktop breakpoint correctly', () => {
      const { result } = renderHook(() => useChartBreakpoint());

      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.width).toBe(1024);
      expect(result.current.height).toBe(768);
    });

    it('detects tablet breakpoint correctly', () => {
      window.innerWidth = 800;
      
      const { result } = renderHook(() => useChartBreakpoint());

      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isMobile).toBe(false);
    });

    it('detects mobile breakpoint correctly', () => {
      window.innerWidth = 600;
      
      const { result } = renderHook(() => useChartBreakpoint());

      expect(result.current.isDesktop).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isMobile).toBe(true);
    });

    it('updates on window resize', () => {
      const { result } = renderHook(() => useChartBreakpoint());

      expect(result.current.width).toBe(1024);

      act(() => {
        window.innerWidth = 600;
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.width).toBe(600);
      expect(result.current.isMobile).toBe(true);
    });
  });
});