import React, { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { 
  Box, 
  VStack,
  HStack,
  Text,
  Badge,
  Separator,
  Button,
} from '@chakra-ui/react';
import { FiMaximize2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { BaseWidget } from './BaseWidget';
import { WidgetConfig, WidgetData, ChartConfig } from './types';

interface ChartWidgetProps {
  config: WidgetConfig;
  data?: WidgetData;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDrillDown?: (data: any, point: any) => void;
  isEditable?: boolean;
}

interface DrillDownData {
  point: any;
  series: string;
  category: string;
  value: number;
  percentage?: number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    period: string;
  };
}

const DEFAULT_COLORS = [
  '#3182CE', '#38A169', '#D69E2E', '#E53E3E', '#805AD5',
  '#DD6B20', '#319795', '#C53030', '#9F7AEA', '#2B6CB0'
];

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  config,
  data,
  onRefresh,
  onEdit,
  onDelete,
  onDrillDown,
  isEditable,
}) => {
  const chartConfig = config.chartConfig as ChartConfig;
  const chartData = data?.data || [];
  const [selectedData, setSelectedData] = useState<DrillDownData | null>(null);

  // Handle chart interactions
  const handleChartClick = useCallback((data: any, index: number) => {
    if (!data || !data.activePayload) return;
    
    const payload = data.activePayload[0]?.payload;
    if (!payload) return;

    const drillDownData: DrillDownData = {
      point: payload,
      series: config.title,
      category: payload[chartConfig.xAxis || 'name'] || 'Unknown',
      value: payload[chartConfig.dataKey || 'value'] || 0,
      percentage: calculatePercentage(payload[chartConfig.dataKey || 'value'], chartData),
      trend: generateTrendData(payload, chartData, index),
    };

    setSelectedData(drillDownData);
    // Modal functionality temporarily disabled for compatibility
    console.log('Chart clicked:', drillDownData);
    
    // Call external drill-down handler if provided
    if (onDrillDown) {
      onDrillDown(data, payload);
    }
  }, [config.title, chartConfig, chartData, onDrillDown]);

  const calculatePercentage = (value: number, data: any[]): number => {
    const total = data.reduce((sum, item) => sum + (item[chartConfig.dataKey || 'value'] || 0), 0);
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const generateTrendData = (currentPoint: any, data: any[], index: number) => {
    if (index === 0 || !data[index - 1]) return undefined;
    
    const currentValue = currentPoint[chartConfig.dataKey || 'value'] || 0;
    const previousValue = data[index - 1][chartConfig.dataKey || 'value'] || 0;
    
    if (previousValue === 0) return undefined;
    
    const change = ((currentValue - previousValue) / previousValue) * 100;
    
    return {
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const,
      value: Math.abs(Math.round(change)),
      period: 'vs previous period',
    };
  };

  const renderChart = () => {
    const {
      chartType,
      xAxis = 'name',
      yAxis = 'value',
      dataKey = 'value',
      colors = DEFAULT_COLORS,
      showLegend = true,
      showGrid = true,
      showTooltip = true,
    } = chartConfig;

    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps} onClick={handleChartClick}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps} onClick={handleChartClick}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            {showTooltip && <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }} />}
            {showLegend && <Legend />}
            <Bar 
              dataKey={dataKey} 
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps} onClick={handleChartClick}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps} onClick={handleChartClick}>
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill={colors[0]}
              dataKey={dataKey}
              label
            >
              {chartData.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={colors[index % colors.length]}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps} onClick={handleChartClick}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis dataKey={yAxis} />
            {showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
            {showLegend && <Legend />}
            <Scatter dataKey={dataKey} fill={colors[0]} />
          </ScatterChart>
        );

      default:
        return <Box>Unsupported chart type</Box>;
    }
  };

  // Modal functionality temporarily disabled for Chakra UI v3 compatibility

  return (
    <BaseWidget
      config={config}
      data={data}
      onRefresh={onRefresh}
      onEdit={onEdit}
      onDelete={onDelete}
      isEditable={isEditable}
    >
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </BaseWidget>
  );
};