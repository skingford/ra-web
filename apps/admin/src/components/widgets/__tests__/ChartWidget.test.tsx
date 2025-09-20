import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../theme';
import { ChartWidget } from '../ChartWidget';
import { WidgetConfig, WidgetData } from '../types';

const mockChartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
];

const mockConfig: WidgetConfig = {
  id: 'chart-widget',
  title: 'Sales Chart',
  type: 'chart',
  size: { width: 400, height: 300 },
  position: { x: 0, y: 0 },
  chartConfig: {
    chartType: 'line',
    xAxis: 'name',
    yAxis: 'value',
    dataKey: 'value',
    showLegend: true,
    showGrid: true,
    showTooltip: true,
  },
};

const mockData: WidgetData = {
  id: 'chart-widget',
  data: mockChartData,
  loading: false,
};

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {component}
    </ChakraProvider>
  );
};

// Mock Recharts components to avoid canvas rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  ScatterChart: ({ children }: any) => <div data-testid="scatter-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Area: () => <div data-testid="area" />,
  Scatter: () => <div data-testid="scatter" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}));

describe('ChartWidget', () => {
  it('renders line chart correctly', () => {
    renderWithChakra(<ChartWidget config={mockConfig} data={mockData} />);

    expect(screen.getByText('Sales Chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line')).toBeInTheDocument();
  });

  it('renders bar chart correctly', () => {
    const barConfig = {
      ...mockConfig,
      chartConfig: {
        ...mockConfig.chartConfig!,
        chartType: 'bar' as const,
      },
    };

    renderWithChakra(<ChartWidget config={barConfig} data={mockData} />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });

  it('renders pie chart correctly', () => {
    const pieConfig = {
      ...mockConfig,
      chartConfig: {
        ...mockConfig.chartConfig!,
        chartType: 'pie' as const,
      },
    };

    renderWithChakra(<ChartWidget config={pieConfig} data={mockData} />);

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie')).toBeInTheDocument();
  });

  it('renders area chart correctly', () => {
    const areaConfig = {
      ...mockConfig,
      chartConfig: {
        ...mockConfig.chartConfig!,
        chartType: 'area' as const,
      },
    };

    renderWithChakra(<ChartWidget config={areaConfig} data={mockData} />);

    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    expect(screen.getByTestId('area')).toBeInTheDocument();
  });

  it('renders scatter chart correctly', () => {
    const scatterConfig = {
      ...mockConfig,
      chartConfig: {
        ...mockConfig.chartConfig!,
        chartType: 'scatter' as const,
      },
    };

    renderWithChakra(<ChartWidget config={scatterConfig} data={mockData} />);

    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument();
    expect(screen.getByTestId('scatter')).toBeInTheDocument();
  });

  it('includes grid when showGrid is true', () => {
    renderWithChakra(<ChartWidget config={mockConfig} data={mockData} />);

    expect(screen.getByTestId('grid')).toBeInTheDocument();
  });

  it('includes legend when showLegend is true', () => {
    renderWithChakra(<ChartWidget config={mockConfig} data={mockData} />);

    expect(screen.getByTestId('legend')).toBeInTheDocument();
  });

  it('includes tooltip when showTooltip is true', () => {
    renderWithChakra(<ChartWidget config={mockConfig} data={mockData} />);

    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('handles unsupported chart type', () => {
    const unsupportedConfig = {
      ...mockConfig,
      chartConfig: {
        ...mockConfig.chartConfig!,
        chartType: 'unsupported' as any,
      },
    };

    renderWithChakra(<ChartWidget config={unsupportedConfig} data={mockData} />);

    expect(screen.getByText('Unsupported chart type')).toBeInTheDocument();
  });

  it('uses responsive container', () => {
    renderWithChakra(<ChartWidget config={mockConfig} data={mockData} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});