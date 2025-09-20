import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query'
import { apiClient, queryKeys, type ApiResponse, type PaginatedResponse } from '../api'
import { useUIStore } from '../../stores/uiStore'

// Generic query hook
export function useApiQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  })
}

// Generic mutation hook with optimistic updates
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables> & {
    successMessage?: string
    invalidateKeys?: QueryKey[]
    optimisticUpdate?: {
      queryKey: QueryKey
      updater: (oldData: any, variables: TVariables) => any
    }
  }
) {
  const queryClient = useQueryClient()
  const { addNotification } = useUIStore()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Show success notification
      if (options?.successMessage) {
        addNotification({
          title: 'Success',
          message: options.successMessage,
          type: 'success',
        })
      }

      // Invalidate specified query keys
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }

      options?.onSuccess?.(data, variables, context)
    },
    onMutate: async (variables) => {
      // Optimistic update
      if (options?.optimisticUpdate) {
        const { queryKey, updater } = options.optimisticUpdate
        
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey })
        
        // Snapshot previous value
        const previousData = queryClient.getQueryData(queryKey)
        
        // Optimistically update
        queryClient.setQueryData(queryKey, (oldData: any) => 
          updater(oldData, variables)
        )
        
        // Return context with previous data
        return { previousData }
      }

      return options?.onMutate?.(variables)
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update on error
      if (options?.optimisticUpdate && context?.previousData) {
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          context.previousData
        )
      }

      options?.onError?.(error, variables, context)
    },
    onSettled: (data, error, variables, context) => {
      // Refetch queries after mutation settles
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }

      options?.onSettled?.(data, error, variables, context)
    },
    ...options,
  })
}

// Paginated query hook
export function usePaginatedQuery<T>(
  resource: string,
  params: {
    page?: number
    limit?: number
    search?: string
    sort?: string
    order?: 'asc' | 'desc'
    [key: string]: any
  } = {},
  options?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
) {
  const queryKey = queryKeys.list(resource, params)
  
  return useQuery({
    queryKey,
    queryFn: () => apiClient.get<PaginatedResponse<T>>(`/${resource}`, params),
    ...options,
  })
}

// CRUD hooks
export function useCreateMutation<T, TVariables = Partial<T>>(
  resource: string,
  options?: {
    successMessage?: string
    onSuccess?: (data: T) => void
  }
) {
  return useApiMutation(
    (variables: TVariables) => 
      apiClient.post<ApiResponse<T>>(`/${resource}`, variables),
    {
      successMessage: options?.successMessage || `${resource} created successfully`,
      invalidateKeys: [queryKeys.list(resource)],
      onSuccess: (response) => {
        options?.onSuccess?.(response.data)
      },
    }
  )
}

export function useUpdateMutation<T, TVariables = Partial<T> & { id: string }>(
  resource: string,
  options?: {
    successMessage?: string
    onSuccess?: (data: T) => void
  }
) {
  return useApiMutation(
    (variables: TVariables) => 
      apiClient.put<ApiResponse<T>>(`/${resource}/${variables.id}`, variables),
    {
      successMessage: options?.successMessage || `${resource} updated successfully`,
      invalidateKeys: [queryKeys.list(resource)],
      onSuccess: (response) => {
        options?.onSuccess?.(response.data)
      },
    }
  )
}

export function useDeleteMutation<T = any>(
  resource: string,
  options?: {
    successMessage?: string
    onSuccess?: () => void
  }
) {
  return useApiMutation(
    (id: string) => apiClient.delete<ApiResponse<T>>(`/${resource}/${id}`),
    {
      successMessage: options?.successMessage || `${resource} deleted successfully`,
      invalidateKeys: [queryKeys.list(resource)],
      onSuccess: () => {
        options?.onSuccess?.()
      },
    }
  )
}

// Bulk operations hook
export function useBulkMutation<T>(
  resource: string,
  action: 'delete' | 'update',
  options?: {
    successMessage?: string
    onSuccess?: (data: T[]) => void
  }
) {
  return useApiMutation(
    (variables: { ids: string[]; data?: any }) => 
      apiClient.post<ApiResponse<T[]>>(`/${resource}/bulk-${action}`, variables),
    {
      successMessage: options?.successMessage || `Bulk ${action} completed successfully`,
      invalidateKeys: [queryKeys.list(resource)],
      onSuccess: (response) => {
        options?.onSuccess?.(response.data)
      },
    }
  )
}

// Infinite query hook for large datasets
export function useInfiniteApiQuery<T>(
  resource: string,
  params: Record<string, any> = {},
  options?: {
    pageSize?: number
    enabled?: boolean
  }
) {
  const { pageSize = 20, ...queryOptions } = options || {}
  
  return useQuery({
    queryKey: queryKeys.list(resource, { ...params, infinite: true }),
    queryFn: async ({ pageParam = 1 }) => {
      return apiClient.get<PaginatedResponse<T>>(`/${resource}`, {
        ...params,
        page: pageParam,
        limit: pageSize,
      })
    },
    ...queryOptions,
  })
}