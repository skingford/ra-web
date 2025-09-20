import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { system } from '../../../theme';
import { WidgetFactory } from '../WidgetFactory';
import { WidgetConfig } from '../types';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <ChakraProvider value={system}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ChakraProvider>
  );
};

describe('Widget Framework Integration', () => {
  it('renders metric widget correctly', () => {
    const config: WidgetConfig = {
      id: 'test-metric',
      title: 'Test Metric',
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 0, y: 0 },
      metricConfig: {
        value: 100,
        label: 'Test Value',
      },
    };

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <WidgetFactory config={config} />
      </Wrapper>
    );

    expect(screen.getByText('Test Metric')).toBeInTheDocument();
  });

  it('renders chart widget correctly', () => {
    const config: WidgetConfig = {
      id: 'test-chart',
      title: 'Test Chart',
      type: 'chart',
      size: { width: 400, height: 300 },
      position: { x: 0, y: 0 },
      chartConfig: {
        chartType: 'line',
        dataKey: 'value',
      },
    };

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <WidgetFactory config={config} />
      </Wrapper>
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('handles unknown widget types', () => {
    const config: WidgetConfig = {
      id: 'test-unknown',
      title: 'Unknown Widget',
      type: 'unknown' as any,
      size: { width: 300, height: 200 },
      position: { x: 0, y: 0 },
    };

    const Wrapper = createWrapper();
    render(
      <Wrapper>
        <WidgetFactory config={config} />
      </Wrapper>
    );

    expect(screen.getByText('Unknown widget type: unknown')).toBeInTheDocument();
  });
});