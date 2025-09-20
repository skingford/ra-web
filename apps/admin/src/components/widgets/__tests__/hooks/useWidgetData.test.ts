import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useWidgetData } from '../../hooks/useWidgetData';
import { WidgetConfig } from '../../types';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
};

const mockConfig: WidgetConfig = {
  id: 'test-widget',
  title: 'Test Widget',
  type: 'metric',
  size: { width: 300, height: 200 },
  position: { x: 0, y: 0 },
};

describe('useWidgetData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns mock data when no data source is provided', async () => {
    const { result } = renderHook(
      () => useWidgetData({ config: mockConfig }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data.loading).toBe(false);
    });

    expect(result.current.data.id).toBe('test-widget');
    expect(result.current.data.data).toBeDefined();
    expect(result.current.data.lastUpdated).toBeInstanceOf(Date);
  });

  it('generates appropriate mock data for metric widgets', async () => {
    const { result } = renderHook(
      () => useWidgetData({ config: mockConfig }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data.loading).toBe(false);
    });

    const data = result.current.data.data;
    expect(data).toHaveProperty('value');
    expect(data).toHaveProperty('label');
    expect(data).toHaveProperty('trend');
    expect(data.trend).toHaveProperty('value');
    expect(data.trend).toHaveProperty('direction');
    expect(data.trend).toHaveProperty('period');
  });

  it('generates appropriate mock data for chart widgets', async () => {
    const chartConfig: WidgetConfig = {
      ...mockConfig,
      type: 'chart',
      chartConfig: {
        chartType: 'line',
        dataKey: 'value',
      },
    };

    const { result } = renderHook(
      () => useWidgetData({ config: chartConfig }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data.loading).toBe(false);
    });

    const data = result.current.data.data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(7);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('value');
  });

  it('generates pie chart data correctly', async () => {
    const pieConfig: WidgetConfig = {
      ...mockConfig,
      type: 'chart',
      chartConfig: {
        chartType: 'pie',
        dataKey: 'value',
      },
    };

    const { result } = renderHook(
      () => useWidgetData({ config: pieConfig }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data.loading).toBe(false);
    });

    const data = result.current.data.data;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(4);
    expect(data[0]).toHaveProperty('name');
    expect(data[0]).toHaveProperty('value');
    expect(data.map((item: any) => item.name)).toEqual(['Desktop', 'Mobile', 'Tablet', 'Other']);
  });

  it('provides refresh function', async () => {
    const { result } = renderHook(
      () => useWidgetData({ config: mockConfig }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data.loading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe('function');
  });

  it('provides invalidate function', async () => {
    const { result } = renderHook(
      () => useWidgetData({ config: mockConfig }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data.loading).toBe(false);
    });

    expect(typeof result.current.invalidate).toBe('function');
  });

  it('respects enabled option', () => {
    const { result } = renderHook(
      () => useWidgetData({ config: mockConfig, enabled: false }),
      { wrapper: createWrapper() }
    );

    // When disabled, should still return mock data
    expect(result.current.data.id).toBe('test-widget');
    expect(result.current.data.data).toBeDefined();
  });

  it('uses refresh interval when provided', async () => {
    const configWithInterval: WidgetConfig = {
      ...mockConfig,
      refreshInterval: 1000,
      dataSource: '/api/test',
    };

    // Mock fetch to avoid actual network calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ test: 'data' }),
    });

    const { result } = renderHook(
      () => useWidgetData({ config: configWithInterval }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data.loading).toBe(false);
    });

    expect(result.current.data.data).toEqual({ test: 'data' });
  });
});