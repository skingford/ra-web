import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Button,
  Flex,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Select,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { WidgetFactory } from './WidgetFactory';
import { WidgetConfig, DashboardLayout, WidgetData } from './types';

interface DashboardGridProps {
  layout: DashboardLayout;
  widgetData: Record<string, WidgetData>;
  onLayoutChange?: (layout: DashboardLayout) => void;
  onWidgetRefresh?: (widgetId: string) => void;
  isEditable?: boolean;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  layout,
  widgetData,
  onLayoutChange,
  onWidgetRefresh,
  isEditable = false,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    onClose();
    setNewWidget({
      type: 'metric',
      size: { width: 300, height: 200 },
      position: { x: 0, y: 0 },
    });
  }, [newWidget, layout, onLayoutChange, onClose]);

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
            onClick={onOpen}
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
              isEditable={isEditable}
            />
          </GridItem>
        ))}
      </Grid>

      {/* Add Widget Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Widget</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Widget Title</FormLabel>
                <Input
                  value={newWidget.title || ''}
                  onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                  placeholder="Enter widget title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Widget Type</FormLabel>
                <Select
                  value={newWidget.type}
                  onChange={(e) => setNewWidget({ ...newWidget, type: e.target.value as any })}
                >
                  <option value="metric">Metric</option>
                  <option value="chart">Chart</option>
                  <option value="table">Table</option>
                  <option value="custom">Custom</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Data Source</FormLabel>
                <Input
                  value={newWidget.dataSource || ''}
                  onChange={(e) => setNewWidget({ ...newWidget, dataSource: e.target.value })}
                  placeholder="API endpoint or data source"
                />
              </FormControl>

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Width</FormLabel>
                  <Input
                    type="number"
                    value={newWidget.size?.width || 300}
                    onChange={(e) => setNewWidget({
                      ...newWidget,
                      size: { ...newWidget.size!, width: parseInt(e.target.value) }
                    })}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Height</FormLabel>
                  <Input
                    type="number"
                    value={newWidget.size?.height || 200}
                    onChange={(e) => setNewWidget({
                      ...newWidget,
                      size: { ...newWidget.size!, height: parseInt(e.target.value) }
                    })}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} width="100%">
                <Button colorScheme="blue" onClick={handleAddWidget}>
                  Add Widget
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};