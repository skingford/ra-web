import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../../../theme';
import { vi } from 'vitest';
import { ChartWidget } from '../ChartWidget';
import { MetricWidget } from '../MetricWidget';
import { InteractiveCharts } from '../InteractiveCharts';
import { WidgetConfig, WidgetData } from '../types';

// Mock Recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children, onClick }: any) => (
    <div data-testid="line-chart" onClick={() => onClick?.({ activePayload: [{ payload: { name: 'Test', value: 100 } }] })}>
      {children}
    </div>
  ),
  BarChart: ({ children, onClick }: any) => (
    <div data-testid="bar-chart" onClick={() => onClick?.({ activePayload: [{ payload: { name: 'Test', value: 100 } }] })}>
      {children}
    </div>
  ),
  PieChart: ({ children, onClick }: any) => (
    <div data-testid="pie-chart" onClick={() => onClick?.({ activePayload: [{ payload: { name: 'Test', value: 100 } }] })}>
      {children}
    </div>
  ),
  AreaChart: ({ children, onClick }: any) => (
    <div data-testid="area-chart" onClick={() => onClick?.({ activePayload: [{ payload: { name: 'Test', value: 100 } }] })}>
      {children}
    </div>
  ),
  ScatterChart: ({ children, onClick }: any) => (
    <div data-testid="scatter-chart" onClick={() => onClick?.({ activePayload: [{ payload: { name: 'Test', value: 100 } }] })}>
      {children}
    </div>
  ),
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Area: () => <div data-testid="area" />,
  Scatter: () => <div data-testid="scatter" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
}));

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider value={system}>
      {component}
    </ChakraProvider>
  );
};

describe('Interactive Charts and Metrics', () => {
  describe('ChartWidget', () => {
    const mockChartConfig: WidgetConfig = {
      id: 'test-chart',
      title: 'Test Chart',
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

    const mockChartData: WidgetData = {
      id: 'test-chart',
      data: [
        { name: 'Jan', value: 100 },
        { name: 'Feb', value: 200 },
        { name: 'Mar', value: 150 },
      ],
      loading: false,
    };

    it('renders line chart correctly', () => {
      renderWithChakra(
        <ChartWidget config={mockChartConfig} data={mockChartData} />
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('handles chart click and opens drill-down modal', async () => {
      const mockDrillDown = vi.fn();
      
      renderWithChakra(
        <ChartWidget 
          config={mockChartConfig} 
          data={mockChartData} 
          onDrillDown={mockDrillDown}
        />
      );

      const chart = screen.getByTestId('line-chart');
      fireEvent.click(chart);

      await waitFor(() => {
        expect(screen.getByText('Detailed View - Test Chart')).toBeInTheDocument();
        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });

      expect(mockDrillDown).toHaveBeenCalledWith(
        { activePayload: [{ payload: { name: 'Test', value: 100 } }] },
        { name: 'Test', value: 100 }
      );
    });

    it('renders different chart types correctly', () => {
      const barConfig = {
        ...mockChartConfig,
        chartConfig: { ...mockChartConfig.chartConfig!, chartType: 'bar' as const },
      };

      renderWithChakra(
        <ChartWidget config={barConfig} data={mockChartData} />
      );

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('calculates percentage correctly in drill-down', async () => {
      renderWithChakra(
        <ChartWidget config={mockChartConfig} data={mockChartData} />
      );

      const chart = screen.getByTestId('line-chart');
      fireEvent.click(chart);

      await waitFor(() => {
        // 100 out of total 450 (100+200+150) = 22%
        expect(screen.getByText('22%')).toBeInTheDocument();
      });
    });
  });

  describe('MetricWidget', () => {
    const mockMetricConfig: WidgetConfig = {
      id: 'test-metric',
      title: 'Test Metric',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 0, y: 0 },
      metricConfig: {
        value: 1250,
        label: 'Total Sales',
        subtitle: 'This month',
        trend: {
          value: 15,
          direction: 'up',
          period: 'vs last month',
        },
        format: 'currency',
        target: 1500,
        showProgress: true,
        status: 'success',
        comparison: {
          value: 1100,
          label: 'Last Month',
          period: 'Previous Period',
        },
        showComparison: true,
      },
    };

    it('renders enhanced metric widget correctly', () => {
      renderWithChakra(
        <MetricWidget config={mockMetricConfig} />
      );

      expect(screen.getByText('Total Sales')).toBeInTheDocument();
      expect(screen.getByText('This month')).toBeInTheDocument();
      expect(screen.getByText('$1,250')).toBeInTheDocument();
      expect(screen.getByText('15% vs last month')).toBeInTheDocument();
      expect(screen.getByText('success')).toBeInTheDocument();
    });

    it('shows progress indicator when enabled', () => {
      renderWithChakra(
        <MetricWidget config={mockMetricConfig} />
      );

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Target: $1,500')).toBeInTheDocument();
    });

    it('shows comparison data when enabled', () => {
      renderWithChakra(
        <MetricWidget config={mockMetricConfig} />
      );

      expect(screen.getByText('Last Month')).toBeInTheDocument();
      expect(screen.getByText('$1,100')).toBeInTheDocument();
      expect(screen.getByText('Previous Period')).toBeInTheDocument();
    });

    it('handles metric click for drill-down', () => {
      const mockDrillDown = vi.fn();
      
      renderWithChakra(
        <MetricWidget 
          config={mockMetricConfig} 
          onDrillDown={mockDrillDown}
        />
      );

      const metricBox = screen.getByText('Total Sales').closest('div')?.parentElement;
      if (metricBox) {
        fireEvent.click(metricBox);
        expect(mockDrillDown).toHaveBeenCalledWith(
          expect.objectContaining({
            label: 'Total Sales',
            value: 1250,
          })
        );
      }
    });

    it('calculates progress correctly', () => {
      renderWithChakra(
        <MetricWidget config={mockMetricConfig} />
      );

      // 1250 / 1500 * 100 = 83.33% (rounded to 83%)
      const progressElement = screen.getByRole('progressbar');
      expect(progressElement).toHaveAttribute('aria-valuenow', '83');
    });

    it('renders different status colors correctly', () => {
      const warningConfig = {
        ...mockMetricConfig,
        metricConfig: {
          ...mockMetricConfig.metricConfig!,
          status: 'warning' as const,
        },
      };

      renderWithChakra(
        <MetricWidget config={warningConfig} />
      );

      expect(screen.getByText('warning')).toBeInTheDocument();
    });

    it('handles hover effects for interactive metrics', () => {
      const mockDrillDown = vi.fn();
      
      renderWithChakra(
        <MetricWidget 
          config={mockMetricConfig} 
          onDrillDown={mockDrillDown}
        />
      );

      const metricBox = screen.getByText('Total Sales').closest('div')?.parentElement;
      if (metricBox) {
        fireEvent.mouseEnter(metricBox);
        // Check if hover state is applied (transform scale)
        expect(metricBox).toHaveStyle('cursor: pointer');
      }
    });
  });

  describe('Responsive Design', () => {
    it('adapts chart size to container', () => {
      const config: WidgetConfig = {
        id: 'responsive-chart',
        title: 'Responsive Chart',
        type: 'chart',
        size: { width: 800, height: 400 },
        position: { x: 0, y: 0 },
        chartConfig: {
          chartType: 'line',
          xAxis: 'name',
          dataKey: 'value',
        },
      };

      renderWithChakra(
        <ChartWidget config={config} />
      );

      const container = screen.getByTestId('responsive-container');
      expect(container).toBeInTheDocument();
    });

    it('maintains metric readability on small screens', () => {
      const config: WidgetConfig = {
        id: 'small-metric',
        title: 'Small Metric',
        type: 'metric',
        size: { width: 200, height: 150 },
        position: { x: 0, y: 0 },
        metricConfig: {
          value: 42,
          label: 'Small KPI',
          format: 'number',
        },
      };

      renderWithChakra(
        <MetricWidget config={config} />
      );

      expect(screen.getByText('Small KPI')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('InteractiveCharts Dashboard', () => {
    it('renders complete interactive dashboard', () => {
      renderWithChakra(<InteractiveCharts />);

      expect(screen.getByText('Interactive Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
      expect(screen.getByText('Interactive Charts')).toBeInTheDocument();
    });

    it('handles refresh functionality', async () => {
      renderWithChakra(<InteractiveCharts />);

      const refreshButton = screen.getByLabelText('Refresh data');
      fireEvent.click(refreshButton);

      // Should show loading state
      expect(refreshButton).toHaveAttribute('data-loading', 'true');
    });

    it('opens metric detail modal on drill-down', async () => {
      const mockDrillDown = vi.fn();
      renderWithChakra(<InteractiveCharts onDrillDown={mockDrillDown} />);

      // Find and click a metric widget
      const metricElement = screen.getByText('Total Revenue');
      const metricContainer = metricElement.closest('[role="button"]') || metricElement.parentElement;
      
      if (metricContainer) {
        fireEvent.click(metricContainer);
        
        await waitFor(() => {
          expect(screen.getByText('Metric Details')).toBeInTheDocument();
        });

        expect(mockDrillDown).toHaveBeenCalledWith(
          expect.objectContaining({
            label: expect.any(String),
            value: expect.any(Number),
          }),
          'metric-detail'
        );
      }
    });

    it('displays KPI metrics with trend indicators', () => {
      renderWithChakra(<InteractiveCharts />);

      // Check for various KPI elements
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Total Orders')).toBeInTheDocument();
    });

    it('renders different chart types correctly', () => {
      renderWithChakra(<InteractiveCharts />);

      expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
      expect(screen.getByText('User Growth')).toBeInTheDocument();
      expect(screen.getByText('Device Distribution')).toBeInTheDocument();
      expect(screen.getByText('Conversion Funnel')).toBeInTheDocument();
    });

    it('handles responsive grid layout', () => {
      renderWithChakra(<InteractiveCharts />);

      // Check that grid containers exist
      const kpiSection = screen.getByText('Key Performance Indicators').parentElement;
      const chartsSection = screen.getByText('Interactive Charts').parentElement;

      expect(kpiSection).toBeInTheDocument();
      expect(chartsSection).toBeInTheDocument();
    });

    it('shows live data indicator', () => {
      renderWithChakra(<InteractiveCharts />);

      expect(screen.getByText('Live Data')).toBeInTheDocument();
    });
  });
});