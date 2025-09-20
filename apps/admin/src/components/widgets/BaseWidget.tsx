import React from 'react';
import {
  Box,
  Heading,
  IconButton,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem,
  Spinner,
  Flex,
  Text,
} from '@chakra-ui/react';
import { FiMoreVertical, FiRefreshCw, FiSettings, FiTrash2 } from 'react-icons/fi';
import { WidgetConfig, WidgetData } from './types';

interface BaseWidgetProps {
  config: WidgetConfig;
  data?: WidgetData;
  children: React.ReactNode;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isEditable?: boolean;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  config,
  data,
  children,
  onRefresh,
  onEdit,
  onDelete,
  isEditable = false,
}) => {
  const { title, size } = config;
  const { loading, error, lastUpdated } = data || {};

  return (
    <Box
      width={`${size.width}px`}
      height={`${size.height}px`}
      minWidth={size.minWidth ? `${size.minWidth}px` : undefined}
      minHeight={size.minHeight ? `${size.minHeight}px` : undefined}
      shadow="sm"
      borderRadius="lg"
      overflow="hidden"
      position="relative"
      bg="white"
      border="1px solid"
      borderColor="gray.200"
    >
      {/* Header */}
      <Box p={4} pb={2} borderBottom="1px solid" borderColor="gray.200">
        <Flex justify="space-between" align="center">
          <Heading size="sm" color="gray.700">
            {title}
          </Heading>
          <Flex align="center" gap={2}>
            {lastUpdated && (
              <Text fontSize="xs" color="gray.500">
                {lastUpdated.toLocaleTimeString()}
              </Text>
            )}
            {isEditable && (
              <MenuRoot>
                <MenuTrigger asChild>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    aria-label="Widget options"
                  >
                    <FiMoreVertical />
                  </IconButton>
                </MenuTrigger>
                <MenuContent>
                  {onRefresh && (
                    <MenuItem value="refresh" onClick={onRefresh}>
                      <FiRefreshCw />
                      Refresh
                    </MenuItem>
                  )}
                  {onEdit && (
                    <MenuItem value="edit" onClick={onEdit}>
                      <FiSettings />
                      Edit
                    </MenuItem>
                  )}
                  {onDelete && (
                    <MenuItem value="delete" onClick={onDelete} color="red.500">
                      <FiTrash2 />
                      Delete
                    </MenuItem>
                  )}
                </MenuContent>
              </MenuRoot>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Body */}
      <Box p={4} pt={2} height="calc(100% - 60px)">
        {loading && (
          <Flex justify="center" align="center" height="100%">
            <Spinner size="lg" colorPalette="blue" />
          </Flex>
        )}

        {error && (
          <Box 
            bg="red.50" 
            border="1px solid" 
            borderColor="red.200" 
            borderRadius="md" 
            p={3}
          >
            <Text fontWeight="bold" color="red.800">
              Error loading widget!
            </Text>
            <Text color="red.600" fontSize="sm">
              {error}
            </Text>
          </Box>
        )}

        {!loading && !error && (
          <Box height="100%" overflow="hidden">
            {children}
          </Box>
        )}
      </Box>
    </Box>
  );
};