export interface WidgetConfig {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  refreshInterval?: number;
  dataSource?: string;
  chartConfig?: ChartConfig;
  metricConfig?: MetricConfig;
}

export type WidgetType = 'chart' | 'metric' | 'table' | 'custom';

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface ChartConfig {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  dataKey?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export interface MetricConfig {
  value: number | string;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  format?: 'number' | 'currency' | 'percentage';
  icon?: string;
  target?: number;
  progress?: number;
  comparison?: {
    value: number;
    label: string;
    period: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  showProgress?: boolean;
  showComparison?: boolean;
}

export interface WidgetData {
  id: string;
  data: any;
  loading: boolean;
  error?: string;
  lastUpdated?: Date;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  columns: number;
  gap: number;
}