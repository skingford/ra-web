import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { WidgetConfig, WidgetData } from '../types';

interface UseWidgetDataOptions {
  config: WidgetConfig;
  enabled?: boolean;
}

export const useWidgetData = ({ config, enabled = true }: UseWidgetDataOptions) => {
  const queryClient = useQueryClient();

  const queryKey = ['widget-data', config.id, config.dataSource];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async (): Promise<any> => {
      if (!config.dataSource) {
        // Return mock data for demonstration
        return generateMockData(config);
      }

      // In a real application, this would fetch from the actual API
      const response = await fetch(config.dataSource);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: enabled && !!config.dataSource,
    refetchInterval: config.refreshInterval || false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const widgetData: WidgetData = {
    id: config.id,
    data: data || generateMockData(config),
    loading: isLoading,
    error: error?.message,
    lastUpdated: new Date(),
  };

  return {
    data: widgetData,
    refresh,
    invalidate,
  };
};

// Mock data generator for demonstration purposes
const generateMockData = (config: WidgetConfig) => {
  switch (config.type) {
    case 'metric':
      return {
        value: Math.floor(Math.random() * 10000),
        label: config.title,
        trend: {
          value: Math.floor(Math.random() * 20) - 10,
          direction: Math.random() > 0.5 ? 'up' : 'down',
          period: 'vs last month',
        },
        format: 'number',
      };

    case 'chart':
      const chartType = config.chartConfig?.chartType || 'line';
      
      if (chartType === 'pie') {
        return [
          { name: 'Desktop', value: 400 },
          { name: 'Mobile', value: 300 },
          { name: 'Tablet', value: 200 },
          { name: 'Other', value: 100 },
        ];
      }

      return Array.from({ length: 7 }, (_, i) => ({
        name: `Day ${i + 1}`,
        value: Math.floor(Math.random() * 1000) + 100,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      }));

    case 'table':
      return Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        status: Math.random() > 0.5 ? 'Active' : 'Inactive',
        value: Math.floor(Math.random() * 1000),
      }));

    default:
      return null;
  }
};