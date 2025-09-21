import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  Progress,
  HStack,
  VStack,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiMinus, 
  FiTarget,
  FiActivity,
  FiBarChart,
  FiInfo
} from 'react-icons/fi';
import { BaseWidget } from './BaseWidget';
import { WidgetConfig, WidgetData, MetricConfig } from './types';
import { CircularProgress } from '../ui/CircularProgress';

interface MetricWidgetProps {
  config: WidgetConfig;
  data?: WidgetData;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDrillDown?: (metric: any) => void;
  isEditable?: boolean;
}

interface EnhancedMetricConfig extends MetricConfig {
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

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  config,
  data,
  onRefresh,
  onEdit,
  onDelete,
  onDrillDown,
  isEditable,
}) => {
  const metricConfig = config.metricConfig as EnhancedMetricConfig;
  const metricData = { ...metricConfig, ...(data?.data || {}) } as EnhancedMetricConfig;
  const [isHovered, setIsHovered] = useState(false);
  
  // Using static colors for Chakra UI v3 compatibility
  const bgColor = 'white';
  const textColor = 'gray.800';
  const subtitleColor = 'gray.600';
  const borderColor = 'gray.200';

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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const calculateProgress = () => {
    if (metricData.progress !== undefined) {
      return metricData.progress;
    }
    if (metricData.target && typeof metricData.value === 'number') {
      return Math.min((metricData.value / metricData.target) * 100, 100);
    }
    return 0;
  };

  const handleClick = () => {
    if (onDrillDown) {
      onDrillDown(metricData);
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
      <Box
        height="100%"
        bg={bgColor}
        color={textColor}
        p={4}
        cursor={onDrillDown ? 'pointer' : 'default'}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        transition="all 0.2s"
        transform={isHovered && onDrillDown ? 'scale(1.02)' : 'scale(1)'}
        borderRadius="md"
        position="relative"
        overflow="hidden"
      >
        <VStack spacing={3} height="100%" justify="space-between">
          {/* Header with status indicator */}
          <HStack width="100%" justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1} flex={1}>
              <HStack>
                <Text fontSize="sm" color={subtitleColor} fontWeight="medium">
                  {metricData.label}
                </Text>
                {metricData.status && (
                  <Badge 
                    colorScheme={getStatusColor(metricData.status)} 
                    size="sm"
                    variant="subtle"
                  >
                    {metricData.status}
                  </Badge>
                )}
              </HStack>
              {metricData.subtitle && (
                <Text fontSize="xs" color={subtitleColor}>
                  {metricData.subtitle}
                </Text>
              )}
            </VStack>
            
            {metricData.icon && (
              <Icon 
                as={FiBarChart} 
                boxSize={5} 
                color={subtitleColor}
                opacity={0.6}
              />
            )}
          </HStack>

          {/* Main metric value */}
          <VStack spacing={2} flex={1} justify="center">
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold">
                {formatValue(metricData.value, metricData.format)}
              </Text>
              
              {metricData.trend && (
                <HStack justify="center" spacing={1} mt={1}>
                  <Text 
                    fontSize="sm" 
                    color={metricData.trend.direction === 'up' ? 'green.500' : 'red.500'}
                  >
                    {metricData.trend.direction === 'up' ? '↗' : '↘'} 
                    {Math.abs(metricData.trend.value)}% {metricData.trend.period}
                  </Text>
                </HStack>
              )}
            </Box>

            {/* Progress indicator */}
            {metricData.showProgress && (
              <Box width="100%">
                {metricData.target ? (
                  <VStack spacing={2}>
                    <HStack width="100%" justify="space-between" fontSize="xs">
                      <Text color={subtitleColor}>Progress</Text>
                      <Text color={subtitleColor}>
                        Target: {formatValue(metricData.target, metricData.format)}
                      </Text>
                    </HStack>
                    <Progress 
                      value={calculateProgress()} 
                      colorScheme={getStatusColor(metricData.status)}
                      size="sm"
                      width="100%"
                      borderRadius="full"
                    />
                  </VStack>
                ) : (
                  <CircularProgress
                    value={calculateProgress()}
                    size={60}
                    color={`${getStatusColor(metricData.status)}.400`}
                    showLabel={true}
                  />
                )}
              </Box>
            )}
          </VStack>

          {/* Comparison data */}
          {metricData.showComparison && metricData.comparison && (
            <Box width="100%" pt={2} borderTop="1px" borderColor={borderColor}>
              <HStack justify="space-between" fontSize="xs">
                <VStack align="flex-start" spacing={0}>
                  <Text color={subtitleColor}>{metricData.comparison.label}</Text>
                  <Text fontWeight="semibold">
                    {formatValue(metricData.comparison.value, metricData.format)}
                  </Text>
                </VStack>
                <Text color={subtitleColor}>{metricData.comparison.period}</Text>
              </HStack>
            </Box>
          )}

          {/* Drill-down indicator */}
          {onDrillDown && (
            <Box
              position="absolute"
              top={2}
              right={2}
              opacity={isHovered ? 1 : 0}
              transition="opacity 0.2s"
            >
              <Tooltip label="Click for details" fontSize="xs">
                <Icon as={FiInfo} boxSize={3} color={subtitleColor} />
              </Tooltip>
            </Box>
          )}
        </VStack>
      </Box>
    </BaseWidget>
  );
};