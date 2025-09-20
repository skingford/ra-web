import React from 'react';
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
import { Box } from '@chakra-ui/react';
import { BaseWidget } from './BaseWidget';
import { WidgetConfig, WidgetData, ChartConfig } from './types';

interface ChartWidgetProps {
  config: WidgetConfig;
  data?: WidgetData;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
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
  isEditable,
}) => {
  const chartConfig = config.chartConfig as ChartConfig;
  const chartData = data?.data || [];

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
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ fill: colors[0] }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={colors[0]} />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.6}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
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
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis dataKey={yAxis} />
            {showTooltip && <Tooltip />}
            {showLegend && <Legend />}
            <Scatter dataKey={dataKey} fill={colors[0]} />
          </ScatterChart>
        );

      default:
        return <Box>Unsupported chart type</Box>;
    }
  };

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