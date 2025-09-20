import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../theme';
import { MetricWidget } from '../MetricWidget';
import { WidgetConfig, WidgetData } from '../types';

const mockConfig: WidgetConfig = {
  id: 'metric-widget',
  title: 'Revenue',
  type: 'metric',
  size: { width: 300, height: 200 },
  position: { x: 0, y: 0 },
  metricConfig: {
    value: 12345,
    label: 'Total Revenue',
    format: 'currency',
    trend: {
      value: 15,
      direction: 'up',
      period: 'vs last month',
    },
  },
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {component}
    </ChakraProvider>
  );
};

describe('MetricWidget', () => {
  it('renders metric value with currency formatting', () => {
    renderWithChakra(<MetricWidget config={mockConfig} />);

    expect(screen.getByText('$12,345.00')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('renders trend information', () => {
    renderWithChakra(<MetricWidget config={mockConfig} />);

    expect(screen.getByText('15% vs last month')).toBeInTheDocument();
  });

  it('formats percentage values correctly', () => {
    const percentageConfig = {
      ...mockConfig,
      metricConfig: {
        ...mockConfig.metricConfig!,
        value: 85,
        format: 'percentage' as const,
      },
    };

    renderWithChakra(<MetricWidget config={percentageConfig} />);

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('formats number values correctly', () => {
    const numberConfig = {
      ...mockConfig,
      metricConfig: {
        ...mockConfig.metricConfig!,
        value: 1234567,
        format: 'number' as const,
      },
    };

    renderWithChakra(<MetricWidget config={numberConfig} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
  });

  it('handles string values', () => {
    const stringConfig = {
      ...mockConfig,
      metricConfig: {
        ...mockConfig.metricConfig!,
        value: 'Active',
      },
    };

    renderWithChakra(<MetricWidget config={stringConfig} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders without trend data', () => {
    const noTrendConfig = {
      ...mockConfig,
      metricConfig: {
        value: 100,
        label: 'Simple Metric',
      },
    };

    renderWithChakra(<MetricWidget config={noTrendConfig} />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Simple Metric')).toBeInTheDocument();
    expect(screen.queryByText('vs last month')).not.toBeInTheDocument();
  });

  it('uses data from props when provided', () => {
    const mockData: WidgetData = {
      id: 'metric-widget',
      data: {
        value: 99999,
        label: 'Dynamic Value',
        format: 'currency',
      },
      loading: false,
    };

    renderWithChakra(
      <MetricWidget config={mockConfig} data={mockData} />
    );

    expect(screen.getByText('$99,999.00')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Value')).toBeInTheDocument();
  });
});