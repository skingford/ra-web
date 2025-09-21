import React, { useState, useEffect, useCallback } from 'react';
import { useBreakpointValue } from '@chakra-ui/react';

export interface ResponsiveChartConfig {
  mobile: {
    height: number;
    showLegend: boolean;
    showGrid: boolean;
    fontSize: number;
  };
  tablet: {
    height: number;
    showLegend: boolean;
    showGrid: boolean;
    fontSize: number;
  };
  desktop: {
    height: number;
    showLegend: boolean;
    showGrid: boolean;
    fontSize: number;
  };
}

export const useResponsiveChart = (baseConfig: any) => {
  const breakpoint = useBreakpointValue({ base: 'mobile', md: 'tablet', lg: 'desktop' });
  
  const responsiveConfig: ResponsiveChartConfig = {
    mobile: {
      height: 250,
      showLegend: false,
      showGrid: false,
      fontSize: 10,
    },
    tablet: {
      height: 300,
      showLegend: true,
      showGrid: true,
      fontSize: 12,
    },
    desktop: {
      height: 400,
      showLegend: true,
      showGrid: true,
      fontSize: 14,
    },
  };

  const currentConfig = responsiveConfig[breakpoint as keyof ResponsiveChartConfig] || responsiveConfig.desktop;

  return {
    ...baseConfig,
    ...currentConfig,
    margin: breakpoint === 'mobile' 
      ? { top: 10, right: 10, left: 10, bottom: 10 }
      : { top: 20, right: 30, left: 20, bottom: 20 },
  };
};

export const useChartColors = () => {
  const isDark = false; // Static value for Chakra UI v3 compatibility
  
  return {
    primary: isDark ? '#63B3ED' : '#3182CE',
    secondary: isDark ? '#68D391' : '#38A169',
    accent: isDark ? '#F6E05E' : '#D69E2E',
    error: isDark ? '#FC8181' : '#E53E3E',
    warning: isDark ? '#F6AD55' : '#DD6B20',
    grid: isDark ? '#4A5568' : '#E2E8F0',
    text: isDark ? '#F7FAFC' : '#2D3748',
    background: isDark ? '#1A202C' : '#FFFFFF',
  };
};

export const useChartInteractions = () => {
  const [hoveredData, setHoveredData] = useState<any>(null);
  const [selectedData, setSelectedData] = useState<any>(null);

  const handleMouseEnter = useCallback((data: any) => {
    setHoveredData(data);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredData(null);
  }, []);

  const handleClick = useCallback((data: any) => {
    setSelectedData(data);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedData(null);
  }, []);

  return {
    hoveredData,
    selectedData,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
    clearSelection,
  };
};

export const formatChartValue = (value: number, format: string = 'number'): string => {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    
    case 'percentage':
      return `${value.toFixed(1)}%`;
    
    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(value);
    
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

export const calculateTrendDirection = (current: number, previous: number): 'up' | 'down' | 'neutral' => {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Custom hook for chart animations
export const useChartAnimation = (enabled: boolean = true) => {
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    if (enabled) {
      setAnimationClass('chart-enter');
      const timer = setTimeout(() => {
        setAnimationClass('chart-enter-active');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  return animationClass;
};

// Responsive breakpoint detection hook
export const useChartBreakpoint = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const isMobile = dimensions.width < 768;
  const isTablet = dimensions.width >= 768 && dimensions.width < 1024;
  const isDesktop = dimensions.width >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    width: dimensions.width,
    height: dimensions.height,
  };
};