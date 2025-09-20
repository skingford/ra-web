import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { BaseWidget } from './BaseWidget';
import { WidgetConfig, WidgetData, MetricConfig } from './types';

interface MetricWidgetProps {
  config: WidgetConfig;
  data?: WidgetData;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  config,
  data,
  onRefresh,
  onEdit,
  onDelete,
  isEditable,
}) => {
  const metricConfig = config.metricConfig as MetricConfig;
  const metricData = data?.data || metricConfig;

  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      case 'percentage':
        return `${value}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return FiTrendingUp;
      case 'down':
        return FiTrendingDown;
      default:
        return FiMinus;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'green.500';
      case 'down':
        return 'red.500';
      default:
        return 'gray.500';
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
      <Flex
        direction="column"
        justify="center"
        align="center"
        height="100%"
        bg="white"
        color="gray.800"
        p={4}
        _dark={{
          bg: 'gray.800',
          color: 'white',
        }}
      >
        <Box textAlign="center">
          <Text fontSize="md" color="gray.500" mb={2}>
            {metricData.label}
          </Text>
          
          <Text fontSize="3xl" fontWeight="bold" mb={2}>
            {formatValue(metricData.value, metricData.format)}
          </Text>

          {metricData.trend && (
            <Flex align="center" justify="center" gap={1}>
              <Icon
                as={getTrendIcon(metricData.trend.direction)}
                color={getTrendColor(metricData.trend.direction)}
              />
              <Text 
                fontSize="sm"
                color={getTrendColor(metricData.trend.direction)}
              >
                {metricData.trend.direction === 'up' ? '↗' : '↘'} {Math.abs(metricData.trend.value)}% {metricData.trend.period}
              </Text>
            </Flex>
          )}
        </Box>

        {metricData.icon && (
          <Box mt={4} opacity={0.1}>
            <Icon boxSize={12} />
          </Box>
        )}
      </Flex>
    </BaseWidget>
  );
};