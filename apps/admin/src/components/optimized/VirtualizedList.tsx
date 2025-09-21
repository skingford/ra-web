// Virtualized List component for handling large datasets efficiently
import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Spinner,
  Alert,
} from '@chakra-ui/react'
import { FiAlertTriangle } from 'react-icons/fi'

// Virtual scrolling configuration
const ITEM_HEIGHT = 60
const CONTAINER_HEIGHT = 400
const BUFFER_SIZE = 5

interface ListItem {
  id: string | number
  [key: string]: any
}

interface VirtualizedListProps<T extends ListItem> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  loading?: boolean
  error?: string
  onLoadMore?: () => void
  hasMore?: boolean
  searchable?: boolean
  onSearch?: (query: string) => void
  itemHeight?: number
  containerHeight?: number
}

// Memoized list item wrapper
const ListItemWrapper = memo(({ 
  children, 
  style 
}: { 
  children: React.ReactNode
  style: React.CSSProperties 
}) => (
  <Box style={style}>
    {children}
  </Box>
))

// Memoized search bar
const SearchBar = memo(({ 
  onSearch, 
  placeholder = "Search items..." 
}: { 
  onSearch: (query: string) => void
  placeholder?: string 
}) => {
  const [query, setQuery] = useState('')

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }, [onSearch])

  return (
    <Input
      placeholder={placeholder}
      value={query}
      onChange={handleSearch}
      mb={4}
    />
  )
})

// Main virtualized list component
export const VirtualizedList = memo(<T extends ListItem>({
  items,
  renderItem,
  loading = false,
  error,
  onLoadMore,
  hasMore = false,
  searchable = false,
  onSearch,
  itemHeight = ITEM_HEIGHT,
  containerHeight = CONTAINER_HEIGHT,
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const isLoadingMore = useRef(false)
  
  // Use static colors instead of useColorModeValue for Chakra UI v3 compatibility
  const bgColor = 'white'
  const borderColor = 'gray.200'

  // Calculate visible range with buffer
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - BUFFER_SIZE)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + BUFFER_SIZE
    )
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length])

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
  }, [items, visibleRange])

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.startIndex * itemHeight

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop
    setScrollTop(scrollTop)

    // Load more items when near bottom
    if (
      onLoadMore &&
      hasMore &&
      !isLoadingMore.current &&
      scrollTop + containerHeight >= totalHeight - itemHeight * 3
    ) {
      isLoadingMore.current = true
      onLoadMore()
    }
  }, [onLoadMore, hasMore, containerHeight, totalHeight, itemHeight])

  // Reset loading flag when items change
  useEffect(() => {
    isLoadingMore.current = false
  }, [items.length])

  // Memoized rendered items
  const renderedItems = useMemo(() => {
    return visibleItems.map((item, index) => {
      const actualIndex = visibleRange.startIndex + index
      const style: React.CSSProperties = {
        position: 'absolute',
        top: actualIndex * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      }

      return (
        <ListItemWrapper key={item.id} style={style}>
          {renderItem(item, actualIndex)}
        </ListItemWrapper>
      )
    })
  }, [visibleItems, visibleRange.startIndex, itemHeight, renderItem])

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Icon as={FiAlertTriangle} />
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    )
  }

  return (
    <VStack spacing={4} align="stretch">
      {searchable && onSearch && (
        <SearchBar onSearch={onSearch} />
      )}

      <Box
        ref={containerRef}
        height={containerHeight}
        overflowY="auto"
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        bg={bgColor}
        position="relative"
        onScroll={handleScroll}
      >
        {loading && items.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <VStack spacing={3}>
              <Spinner size="lg" />
              <Text color="gray.500">Loading items...</Text>
            </VStack>
          </Box>
        ) : items.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Text color="gray.500">No items found</Text>
          </Box>
        ) : (
          <>
            {/* Virtual container with total height */}
            <Box height={totalHeight} position="relative">
              {/* Visible items container */}
              <Box
                position="absolute"
                top={offsetY}
                left={0}
                right={0}
              >
                {renderedItems}
              </Box>
            </Box>

            {/* Loading more indicator */}
            {loading && items.length > 0 && (
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                p={4}
                bg={bgColor}
                borderTop="1px"
                borderColor={borderColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <HStack spacing={2}>
                  <Spinner size="sm" />
                  <Text fontSize="sm" color="gray.500">Loading more...</Text>
                </HStack>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Load more button (alternative to infinite scroll) */}
      {hasMore && !loading && (
        <Button onClick={onLoadMore} variant="outline" size="sm">
          Load More Items
        </Button>
      )}
    </VStack>
  )
})

VirtualizedList.displayName = 'VirtualizedList'

// Hook for managing virtualized list state
export const useVirtualizedList = <T extends ListItem>(
  initialItems: T[] = [],
  pageSize: number = 50
) => {
  const [items, setItems] = useState<T[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadMore = useCallback(async (loadFunction: () => Promise<T[]>) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const newItems = await loadFunction()
      
      if (newItems.length < pageSize) {
        setHasMore(false)
      }

      setItems(prev => [...prev, ...newItems])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [loading, pageSize])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    // Reset items and pagination when searching
    setItems([])
    setHasMore(true)
  }, [])

  const reset = useCallback(() => {
    setItems([])
    setLoading(false)
    setError(null)
    setHasMore(true)
    setSearchQuery('')
  }, [])

  return {
    items,
    loading,
    error,
    hasMore,
    searchQuery,
    loadMore,
    search,
    reset,
    setItems,
  }
}