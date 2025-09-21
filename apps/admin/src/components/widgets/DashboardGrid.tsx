import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Button,
  Flex,
  Text,
  VStack,
  HStack,
  Select,
  Input,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { WidgetFactory } from './WidgetFactory';
import { WidgetConfig, DashboardLayout, WidgetData } from './types';

interface DashboardGridProps {
  layout: DashboardLayout;
  widgetData: Record<string, WidgetData>;
  onLayoutChange?: (layout: DashboardLayout) => void;
  onWidgetRefresh?: (widgetId: string) => void;
  onChartDrillDown?: (data: any, point: any) => void;
  onMetricDrillDown?: (metric: any) => void;
  isEditable?: boolean;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  layout,
  widgetData,
  onLayoutChange,
  onWidgetRefresh,
  onChartDrillDown,
  onMetricDrillDown,
  isEditable = false,
}) => {
  // Modal functionality temporarily disabled for Chakra UI v3 compatibility
  const [newWidget, setNewWidget] = useState<Partial<WidgetConfig>>({
    type: 'metric',
    size: { width: 300, height: 200 },
    position: { x: 0, y: 0 },
  });

  const handleAddWidget = useCallback(() => {
    if (!newWidget.title || !onLayoutChange) return;

    const widget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      title: newWidget.title,
      type: newWidget.type!,
      size: newWidget.size!,
      position: newWidget.position!,
      dataSource: newWidget.dataSource,
    };

    const updatedLayout: DashboardLayout = {
      ...layout,
      widgets: [...layout.widgets, widget],
    };

    onLayoutChange(updatedLayout);
    setNewWidget({
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 0, y: 0 },
    });
  }, [newWidget, layout, onLayoutChange]);

  const handleDeleteWidget = useCallback((widgetId: string) => {
    if (!onLayoutChange) return;

    const updatedLayout: DashboardLayout = {
      ...layout,
      widgets: layout.widgets.filter(w => w.id !== widgetId),
    };

    onLayoutChange(updatedLayout);
  }, [layout, onLayoutChange]);

  const handleRefreshWidget = useCallback((widgetId: string) => {
    if (onWidgetRefresh) {
      onWidgetRefresh(widgetId);
    }
  }, [onWidgetRefresh]);

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          {layout.name}
        </Text>
        {isEditable && (
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={() => console.log('Add widget functionality temporarily disabled')}
          >
            Add Widget
          </Button>
        )}
      </Flex>

      <Grid
        templateColumns={`repeat(${layout.columns}, 1fr)`}
        gap={layout.gap}
        autoRows="min-content"
      >
        {layout.widgets.map((widget) => (
          <GridItem
            key={widget.id}
            colSpan={Math.ceil(widget.size.width / (1200 / layout.columns))}
            rowSpan={Math.ceil(widget.size.height / 200)}
          >
            <WidgetFactory
              config={widget}
              data={widgetData[widget.id]}
              onRefresh={() => handleRefreshWidget(widget.id)}
              onDelete={() => handleDeleteWidget(widget.id)}
              onChartDrillDown={onChartDrillDown}
              onMetricDrillDown={onMetricDrillDown}
              isEditable={isEditable}
            />
          </GridItem>
        ))}
      </Grid>

      {/* Modal functionality temporarily disabled for Chakra UI v3 compatibility */}
    </Box>
  );
};