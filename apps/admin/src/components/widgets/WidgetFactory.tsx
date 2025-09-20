import React from 'react';
import { ChartWidget } from './ChartWidget';
import { MetricWidget } from './MetricWidget';
import { WidgetConfig, WidgetData } from './types';

interface WidgetFactoryProps {
  config: WidgetConfig;
  data?: WidgetData;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export const WidgetFactory: React.FC<WidgetFactoryProps> = ({
  config,
  data,
  onRefresh,
  onEdit,
  onDelete,
  isEditable,
}) => {
  const commonProps = {
    config,
    data,
    onRefresh,
    onEdit,
    onDelete,
    isEditable,
  };

  switch (config.type) {
    case 'chart':
      return <ChartWidget {...commonProps} />;
    
    case 'metric':
      return <MetricWidget {...commonProps} />;
    
    case 'table':
      // TODO: Implement TableWidget in future tasks
      return <div>Table widget not implemented yet</div>;
    
    case 'custom':
      // TODO: Implement CustomWidget in future tasks
      return <div>Custom widget not implemented yet</div>;
    
    default:
      return <div>Unknown widget type: {config.type}</div>;
  }
};