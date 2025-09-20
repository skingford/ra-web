import React from 'react'
import { useMutation, useQuery, useQueryClient, useInfiniteQuery, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { apiClient, queryKeys, type ApiResponse, type PaginatedResponse, type ApiError } from '../api'

// Generic types for CRUD operations
export interface CrudEntity {
  id: string | number
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface ListParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface CreateInput<T> extends Omit<T, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateInput<T> extends Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>> {}

export interface CrudHookOptions<T> {
  resource: string
  queryOptions?: Partial<UseQueryOptions>
  mutationOptions?: {
    create?: Partial<UseMutationOptions<ApiResponse<T>, Error, CreateInput<T>>>
    update?: Partial<UseMutationOptions<ApiResponse<T>, Error, { id: string | number; data: UpdateInput<T> }>>
    delete?: Partial<UseMutationOptions<ApiResponse<void>, Error, string | number>>
  }
  optimisticUpdates?: boolean
  retryConfig?: {
    retries?: number
    retryDelay?: number | ((attempt: number) => number)
  }
  onError?: (error: Error, context?: any) => void
  onSuccess?: (data: any, context?: any) => void
}

// Generic CRUD hooks
export function useCrudList<T extends CrudEntity>(
  resource: string,
  params?: ListParams,
  options?: Partial<UseQueryOptions<PaginatedResponse<T>, Error>>
) {
  return useQuery({
    queryKey: queryKeys.list(resource, params),
    queryFn: () => apiClient.get<PaginatedResponse<T>>(`/${resource}`, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useCrudDetail<T extends CrudEntity>(
  resource: string,
  id: string | number | undefined,
  options?: Partial<UseQueryOptions<ApiResponse<T>, Error>>
) {
  return useQuery({
    queryKey: queryKeys.detail(resource, String(id)),
    queryFn: () => apiClient.get<ApiResponse<T>>(`/${resource}/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export function useCrudCreate<T extends CrudEntity>(
  resource: string,
  options?: Partial<UseMutationOptions<ApiResponse<T>, Error, CreateInput<T>>> & {
    optimisticUpdates?: boolean
    onError?: (error: Error, variables: CreateInput<T>, context?: any) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateInput<T>) => 
      apiClient.post<ApiResponse<T>>(`/${resource}`, data),
    onMutate: async (variables) => {
      if (!options?.optimisticUpdates) return

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.list(resource) 
      })

      // Snapshot previous value
      const previousListData = queryClient.getQueriesData({ 
        queryKey: queryKeys.list(resource) 
      })

      // Create optimistic item with temporary ID
      const optimisticItem = {
        ...variables,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T

      // Optimistically update list queries
      queryClient.setQueriesData<PaginatedResponse<T>>(
        { queryKey: queryKeys.list(resource) },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: [optimisticItem, ...old.data],
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          }
        }
      )

      return { previousListData, optimisticItem }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates on error
      if (context?.previousListData && options?.optimisticUpdates) {
        context.previousListData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      // Enhanced error handling
      let errorMessage = 'An error occurred'
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = error.message
      }

      // Call custom error handler
      options?.onError?.(new Error(errorMessage), variables, context)
    },
    onSuccess: (response, variables, context) => {
      // Update cache with real data
      queryClient.setQueryData(
        queryKeys.detail(resource, String(response.data.id)),
        response
      )

      // If we used optimistic updates, replace the temporary item
      if (options?.optimisticUpdates && context?.optimisticItem) {
        queryClient.setQueriesData<PaginatedResponse<T>>(
          { queryKey: queryKeys.list(resource) },
          (old) => {
            if (!old) return old
            return {
              ...old,
              data: old.data.map(item => 
                item.id === context.optimisticItem.id ? response.data : item
              ),
            }
          }
        )
      } else {
        // Invalidate list queries for fresh data
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.list(resource) 
        })
      }
      
      // Call custom onSuccess if provided
      options?.onSuccess?.(response, variables, context)
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      try {
        const errorData = JSON.parse(error.message)
        if (errorData.status >= 400 && errorData.status < 500) {
          return false
        }
      } catch {
        // Continue with default retry logic
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  })
}

export function useCrudUpdate<T extends CrudEntity>(
  resource: string,
  options?: Partial<UseMutationOptions<ApiResponse<T>, Error, { id: string | number; data: UpdateInput<T> }>> & {
    optimisticUpdates?: boolean
    onError?: (error: Error, variables: { id: string | number; data: UpdateInput<T> }, context?: any) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: UpdateInput<T> }) =>
      apiClient.put<ApiResponse<T>>(`/${resource}/${id}`, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.detail(resource, String(id)) 
      })
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.list(resource) 
      })

      // Snapshot previous values
      const previousDetailData = queryClient.getQueryData<ApiResponse<T>>(
        queryKeys.detail(resource, String(id))
      )
      const previousListData = queryClient.getQueriesData({ 
        queryKey: queryKeys.list(resource) 
      })

      // Optimistically update detail cache
      if (previousDetailData && options?.optimisticUpdates !== false) {
        const updatedItem = { 
          ...previousDetailData.data, 
          ...data,
          updatedAt: new Date().toISOString()
        }
        
        queryClient.setQueryData<ApiResponse<T>>(
          queryKeys.detail(resource, String(id)),
          {
            ...previousDetailData,
            data: updatedItem
          }
        )

        // Optimistically update list caches
        queryClient.setQueriesData<PaginatedResponse<T>>(
          { queryKey: queryKeys.list(resource) },
          (old) => {
            if (!old) return old
            return {
              ...old,
              data: old.data.map(item => 
                item.id === id ? updatedItem : item
              ),
            }
          }
        )
      }

      return { previousDetailData, previousListData }
    },
    onError: (error, { id }, context) => {
      // Rollback optimistic updates on error
      if (context?.previousDetailData) {
        queryClient.setQueryData(
          queryKeys.detail(resource, String(id)),
          context.previousDetailData
        )
      }

      if (context?.previousListData) {
        context.previousListData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      // Enhanced error handling
      let errorMessage = 'Failed to update item'
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = error.message
      }

      // Call custom error handler
      options?.onError?.(new Error(errorMessage), { id, data: {} as UpdateInput<T> }, context)
    },
    onSuccess: (response, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(
        queryKeys.detail(resource, String(id)),
        response
      )
      
      // Update list caches with server response
      queryClient.setQueriesData<PaginatedResponse<T>>(
        { queryKey: queryKeys.list(resource) },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(item => 
              item.id === id ? response.data : item
            ),
          }
        }
      )
      
      // Call custom onSuccess if provided
      options?.onSuccess?.(response, { id, data: {} as UpdateInput<T> }, undefined)
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      try {
        const errorData = JSON.parse(error.message)
        if (errorData.status >= 400 && errorData.status < 500) {
          return false
        }
      } catch {
        // Continue with default retry logic
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  })
}

export function useCrudDelete<T extends CrudEntity>(
  resource: string,
  options?: Partial<UseMutationOptions<ApiResponse<void>, Error, string | number>> & {
    optimisticUpdates?: boolean
    onError?: (error: Error, id: string | number, context?: any) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) =>
      apiClient.delete<ApiResponse<void>>(`/${resource}/${id}`),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.detail(resource, String(id)) 
      })
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.list(resource) 
      })

      // Snapshot previous values
      const previousDetailData = queryClient.getQueryData<ApiResponse<T>>(
        queryKeys.detail(resource, String(id))
      )
      const previousListData = queryClient.getQueriesData({ 
        queryKey: queryKeys.list(resource) 
      })

      if (options?.optimisticUpdates !== false) {
        // Optimistically remove from detail cache
        queryClient.removeQueries({ 
          queryKey: queryKeys.detail(resource, String(id)) 
        })

        // Optimistically remove from list caches
        queryClient.setQueriesData<PaginatedResponse<T>>(
          { queryKey: queryKeys.list(resource) },
          (old) => {
            if (!old) return old
            return {
              ...old,
              data: old.data.filter(item => item.id !== id),
              pagination: {
                ...old.pagination,
                total: Math.max(0, old.pagination.total - 1),
              },
            }
          }
        )
      }

      return { previousDetailData, previousListData }
    },
    onError: (error, id, context) => {
      // Rollback optimistic updates on error
      if (context?.previousDetailData) {
        queryClient.setQueryData(
          queryKeys.detail(resource, String(id)),
          context.previousDetailData
        )
      }

      if (context?.previousListData) {
        context.previousListData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      // Enhanced error handling
      let errorMessage = 'Failed to delete item'
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = error.message
      }

      // Call custom error handler
      options?.onError?.(new Error(errorMessage), id, context)
    },
    onSuccess: (response, id) => {
      // Ensure item is removed from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.detail(resource, String(id)) 
      })
      
      // Update list caches to remove the item (if not already done optimistically)
      if (options?.optimisticUpdates === false) {
        queryClient.setQueriesData<PaginatedResponse<T>>(
          { queryKey: queryKeys.list(resource) },
          (old) => {
            if (!old) return old
            return {
              ...old,
              data: old.data.filter(item => item.id !== id),
              pagination: {
                ...old.pagination,
                total: Math.max(0, old.pagination.total - 1),
              },
            }
          }
        )
      }
      
      // Call custom onSuccess if provided
      options?.onSuccess?.(response, id, undefined)
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      try {
        const errorData = JSON.parse(error.message)
        if (errorData.status >= 400 && errorData.status < 500) {
          return false
        }
      } catch {
        // Continue with default retry logic
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  })
}

// Bulk operations
export function useCrudBulkDelete<T extends CrudEntity>(
  resource: string,
  options?: Partial<UseMutationOptions<ApiResponse<void>, Error, (string | number)[]>> & {
    onError?: (error: Error, ids: (string | number)[], context?: any) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: (string | number)[]) =>
      apiClient.post<ApiResponse<void>>(`/${resource}/bulk-delete`, { ids }),
    onMutate: async (ids) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.list(resource) 
      })

      // Snapshot previous values
      const previousListData = queryClient.getQueriesData({ 
        queryKey: queryKeys.list(resource) 
      })
      const previousDetailData = ids.map(id => ({
        id,
        data: queryClient.getQueryData(queryKeys.detail(resource, String(id)))
      }))

      // Optimistically remove items from list caches
      queryClient.setQueriesData<PaginatedResponse<T>>(
        { queryKey: queryKeys.list(resource) },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter(item => !ids.includes(item.id)),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - ids.length),
            },
          }
        }
      )

      return { previousListData, previousDetailData }
    },
    onError: (error, ids, context) => {
      // Rollback optimistic updates on error
      if (context?.previousListData) {
        context.previousListData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      if (context?.previousDetailData) {
        context.previousDetailData.forEach(({ id, data }) => {
          if (data) {
            queryClient.setQueryData(queryKeys.detail(resource, String(id)), data)
          }
        })
      }

      // Enhanced error handling
      let errorMessage = 'Failed to delete items'
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = error.message
      }

      // Call custom error handler
      options?.onError?.(new Error(errorMessage), ids, context)
    },
    onSuccess: (response, ids) => {
      // Remove all deleted items from cache
      ids.forEach(id => {
        queryClient.removeQueries({ 
          queryKey: queryKeys.detail(resource, String(id)) 
        })
      })
      
      // Ensure list caches are updated (should already be done optimistically)
      queryClient.setQueriesData<PaginatedResponse<T>>(
        { queryKey: queryKeys.list(resource) },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.filter(item => !ids.includes(item.id)),
            pagination: {
              ...old.pagination,
              total: Math.max(0, old.pagination.total - ids.length),
            },
          }
        }
      )
      
      // Call custom onSuccess if provided
      options?.onSuccess?.(response, ids, undefined)
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      try {
        const errorData = JSON.parse(error.message)
        if (errorData.status >= 400 && errorData.status < 500) {
          return false
        }
      } catch {
        // Continue with default retry logic
      }
      return failureCount < 2 // Fewer retries for bulk operations
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  })
}

export function useCrudBulkUpdate<T extends CrudEntity>(
  resource: string,
  options?: Partial<UseMutationOptions<ApiResponse<T[]>, Error, { ids: (string | number)[]; data: UpdateInput<T> }>> & {
    onError?: (error: Error, variables: { ids: (string | number)[]; data: UpdateInput<T> }, context?: any) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, data }: { ids: (string | number)[]; data: UpdateInput<T> }) =>
      apiClient.post<ApiResponse<T[]>>(`/${resource}/bulk-update`, { ids, data }),
    onMutate: async ({ ids, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.list(resource) 
      })

      // Snapshot previous values
      const previousListData = queryClient.getQueriesData({ 
        queryKey: queryKeys.list(resource) 
      })
      const previousDetailData = ids.map(id => ({
        id,
        data: queryClient.getQueryData(queryKeys.detail(resource, String(id)))
      }))

      // Optimistically update list caches
      queryClient.setQueriesData<PaginatedResponse<T>>(
        { queryKey: queryKeys.list(resource) },
        (old) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(item => 
              ids.includes(item.id) 
                ? { ...item, ...data, updatedAt: new Date().toISOString() }
                : item
            ),
          }
        }
      )

      // Optimistically update detail caches
      ids.forEach(id => {
        queryClient.setQueryData<ApiResponse<T>>(
          queryKeys.detail(resource, String(id)),
          (old) => {
            if (!old) return old
            return {
              ...old,
              data: { ...old.data, ...data, updatedAt: new Date().toISOString() }
            }
          }
        )
      })

      return { previousListData, previousDetailData }
    },
    onError: (error, { ids }, context) => {
      // Rollback optimistic updates on error
      if (context?.previousListData) {
        context.previousListData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }

      if (context?.previousDetailData) {
        context.previousDetailData.forEach(({ id, data }) => {
          if (data) {
            queryClient.setQueryData(queryKeys.detail(resource, String(id)), data)
          }
        })
      }

      // Enhanced error handling
      let errorMessage = 'Failed to update items'
      try {
        const errorData = JSON.parse(error.message)
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = error.message
      }

      // Call custom error handler
      options?.onError?.(new Error(errorMessage), { ids, data: {} as UpdateInput<T> }, context)
    },
    onSuccess: (response, { ids }) => {
      // Update individual items in cache with server response
      response.data.forEach(item => {
        queryClient.setQueryData(
          queryKeys.detail(resource, String(item.id)),
          { ...response, data: item }
        )
      })
      
      // Update list caches with server response
      queryClient.setQueriesData<PaginatedResponse<T>>(
        { queryKey: queryKeys.list(resource) },
        (old) => {
          if (!old) return old
          const updatedItemsMap = new Map(response.data.map(item => [item.id, item]))
          return {
            ...old,
            data: old.data.map(item => 
              updatedItemsMap.has(item.id) ? updatedItemsMap.get(item.id)! : item
            ),
          }
        }
      )
      
      // Call custom onSuccess if provided
      options?.onSuccess?.(response, { ids, data: {} as UpdateInput<T> }, undefined)
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      try {
        const errorData = JSON.parse(error.message)
        if (errorData.status >= 400 && errorData.status < 500) {
          return false
        }
      } catch {
        // Continue with default retry logic
      }
      return failureCount < 2 // Fewer retries for bulk operations
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  })
}

// Combined CRUD hook that provides all operations
export function useCrud<T extends CrudEntity>(
  resource: string,
  options?: CrudHookOptions<T>
) {
  const list = (params?: ListParams, queryOptions?: Partial<UseQueryOptions<PaginatedResponse<T>, Error>>) =>
    useCrudList<T>(resource, params, { 
      ...options?.queryOptions, 
      ...queryOptions,
      retry: options?.retryConfig?.retries ?? 3,
      retryDelay: options?.retryConfig?.retryDelay ?? ((attempt) => Math.min(1000 * 2 ** attempt, 30000)),
    })

  const detail = (id: string | number | undefined, queryOptions?: Partial<UseQueryOptions<ApiResponse<T>, Error>>) =>
    useCrudDetail<T>(resource, id, { 
      ...options?.queryOptions, 
      ...queryOptions,
      retry: options?.retryConfig?.retries ?? 3,
      retryDelay: options?.retryConfig?.retryDelay ?? ((attempt) => Math.min(1000 * 2 ** attempt, 30000)),
    })

  const create = useCrudCreate<T>(resource, {
    ...options?.mutationOptions?.create,
    optimisticUpdates: options?.optimisticUpdates ?? true,
    onError: options?.onError,
    onSuccess: options?.onSuccess,
  })
  
  const update = useCrudUpdate<T>(resource, {
    ...options?.mutationOptions?.update,
    optimisticUpdates: options?.optimisticUpdates ?? true,
    onError: options?.onError,
    onSuccess: options?.onSuccess,
  })
  
  const remove = useCrudDelete<T>(resource, {
    ...options?.mutationOptions?.delete,
    optimisticUpdates: options?.optimisticUpdates ?? true,
    onError: options?.onError,
    onSuccess: options?.onSuccess,
  })
  
  const bulkDelete = useCrudBulkDelete<T>(resource, {
    onError: options?.onError,
    onSuccess: options?.onSuccess,
  })
  
  const bulkUpdate = useCrudBulkUpdate<T>(resource, {
    onError: options?.onError,
    onSuccess: options?.onSuccess,
  })

  return {
    list,
    detail,
    create,
    update,
    delete: remove,
    bulkDelete,
    bulkUpdate,
  }
}

// Utility hooks for common patterns
export function useInfiniteList<T extends CrudEntity>(
  resource: string,
  params?: Omit<ListParams, 'page'>,
  options?: Partial<UseQueryOptions>
) {
  return useInfiniteQuery({
    queryKey: queryKeys.list(resource, params),
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<PaginatedResponse<T>>(`/${resource}`, { ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination
      return page < totalPages ? page + 1 : undefined
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// Search hook with debouncing
export function useSearch<T extends CrudEntity>(
  resource: string,
  searchTerm: string,
  debounceMs = 300,
  options?: Partial<UseQueryOptions<PaginatedResponse<T>, Error>>
) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState(searchTerm)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchTerm, debounceMs])

  return useQuery({
    queryKey: queryKeys.list(resource, { search: debouncedSearchTerm }),
    queryFn: () => apiClient.get<PaginatedResponse<T>>(`/${resource}`, { search: debouncedSearchTerm }),
    enabled: debouncedSearchTerm.length > 0,
    staleTime: 5 * 60 * 1000,
    ...options,
  })
}

// Hook for managing form state with CRUD operations
export function useCrudForm<T extends CrudEntity>(
  resource: string,
  id?: string | number,
  options?: {
    onSuccess?: (data: T, isCreate: boolean) => void
    onError?: (error: Error, isCreate: boolean) => void
    optimisticUpdates?: boolean
  }
) {
  const queryClient = useQueryClient()
  
  // Fetch existing data if editing
  const { data: existingData, isLoading } = useCrudDetail<T>(
    resource, 
    id, 
    { enabled: !!id }
  )
  
  const createMutation = useCrudCreate<T>(resource, {
    optimisticUpdates: options?.optimisticUpdates,
    onSuccess: (response) => {
      options?.onSuccess?.(response.data, true)
    },
    onError: (error) => {
      options?.onError?.(error, true)
    }
  })
  
  const updateMutation = useCrudUpdate<T>(resource, {
    optimisticUpdates: options?.optimisticUpdates,
    onSuccess: (response) => {
      options?.onSuccess?.(response.data, false)
    },
    onError: (error) => {
      options?.onError?.(error, false)
    }
  })
  
  const submit = React.useCallback((data: CreateInput<T> | UpdateInput<T>) => {
    if (id) {
      updateMutation.mutate({ id, data: data as UpdateInput<T> })
    } else {
      createMutation.mutate(data as CreateInput<T>)
    }
  }, [id, createMutation, updateMutation])
  
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error
  const isSuccess = createMutation.isSuccess || updateMutation.isSuccess
  
  return {
    existingData: existingData?.data,
    isLoading,
    submit,
    isSubmitting,
    error,
    isSuccess,
    isEditing: !!id,
    reset: () => {
      createMutation.reset()
      updateMutation.reset()
    }
  }
}

// Hook for managing selection state (useful for bulk operations)
export function useSelection<T extends CrudEntity>(items: T[] = []) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string | number>>(new Set())
  
  const selectedItems = React.useMemo(() => 
    items.filter(item => selectedIds.has(item.id)),
    [items, selectedIds]
  )
  
  const isSelected = React.useCallback((id: string | number) => 
    selectedIds.has(id),
    [selectedIds]
  )
  
  const isAllSelected = React.useMemo(() => 
    items.length > 0 && items.every(item => selectedIds.has(item.id)),
    [items, selectedIds]
  )
  
  const isIndeterminate = React.useMemo(() => 
    selectedIds.size > 0 && selectedIds.size < items.length,
    [selectedIds.size, items.length]
  )
  
  const toggle = React.useCallback((id: string | number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])
  
  const toggleAll = React.useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(item => item.id)))
    }
  }, [isAllSelected, items])
  
  const clear = React.useCallback(() => {
    setSelectedIds(new Set())
  }, [])
  
  const select = React.useCallback((ids: (string | number)[]) => {
    setSelectedIds(new Set(ids))
  }, [])
  
  return {
    selectedIds: Array.from(selectedIds),
    selectedItems,
    selectedCount: selectedIds.size,
    isSelected,
    isAllSelected,
    isIndeterminate,
    toggle,
    toggleAll,
    clear,
    select,
  }
}

// Hook for managing pagination state
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = React.useState(initialPage)
  const [limit, setLimit] = React.useState(initialLimit)
  
  const goToPage = React.useCallback((newPage: number) => {
    setPage(Math.max(1, newPage))
  }, [])
  
  const nextPage = React.useCallback(() => {
    setPage(prev => prev + 1)
  }, [])
  
  const prevPage = React.useCallback(() => {
    setPage(prev => Math.max(1, prev - 1))
  }, [])
  
  const changeLimit = React.useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }, [])
  
  const reset = React.useCallback(() => {
    setPage(initialPage)
    setLimit(initialLimit)
  }, [initialPage, initialLimit])
  
  return {
    page,
    limit,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    reset,
  }
}