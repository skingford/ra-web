import { Spinner, VStack, Text } from '@chakra-ui/react';

interface LoadingProps {
  message?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function Loading({ 
  message = '加载中...', 
  size = 'lg' 
}: LoadingProps) {
  return (
    <VStack spacing={4} py={8}>
      <Spinner 
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size={size}
      />
      <Text color="gray.600" fontSize="sm">
        {message}
      </Text>
    </VStack>
  );
}
