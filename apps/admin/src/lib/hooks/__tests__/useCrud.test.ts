import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { 
  useCrud, 
  useCrudList, 
  useCrudDetail, 
  useCrudCreate, 
  useCrudUpdate, 
  useCrudDelete,
  useSearch,
  useCrudForm,
  useSelection,
  usePagination,
  type CrudEntity 
} from '../useCrud'
import { apiClient } from '../../api'

// Mock the API client
vi.mock('../../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  queryKeys: {
    list: (resource: string, params?: any) => ['list', resource, params],
    detail: (resource: string, id: string) => ['detail', resource, id],
  },
}))

// Test entity type
interface TestUser extends CrudEntity {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

// Mock data
const mockUsers: TestUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
]

const mockPaginatedResponse = {
  data: mockUsers,
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  },
  success: true,
  message: 'Success',
  timestamp: '2023-01-01T00:00:00Z',
}

const mockApiResponse = {
  data: mockUsers[0],
  success: true,
  message: 'Success',
  timestamp: '2023-01-01T00:00:00Z',
}

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  )
}

describe('CRUD Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCrudList', () => {
    it('fetches list of entities', async () => {
      const mockGet = vi.mocked(apiClient.get)
      mockGet.mockResolvedValueOnce(mockPaginatedResponse)

      const { result } = renderHook(
        () => useCrudList<TestUser>('users'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockGet).toHaveBeenCalledWith('/users', undefined)
      expect(result.current.data).toEqual(mockPaginatedResponse)
    })

    it('passes query parameters correctly', async () => {
      const mockGet = vi.mocked(apiClient.get)
      mockGet.mockResolvedValueOnce(mockPaginatedResponse)

      const params = {
        page: 2,
        limit: 20,
        search: 'john',
        sort: 'name',
        order: 'asc' as const,
      }

      renderHook(
        () => useCrudList<TestUser>('users', params),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/users', params)
      })
    })
  })

  describe('useCrudDetail', () => {
    it('fetches single entity by id', async () => {
      const mockGet = vi.mocked(apiClient.get)
      mockGet.mockResolvedValueOnce(mockApiResponse)

      const { result } = renderHook(
        () => useCrudDetail<TestUser>('users', '1'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockGet).toHaveBeenCalledWith('/users/1')
      expect(result.current.data).toEqual(mockApiResponse)
    })

    it('does not fetch when id is undefined', () => {
      const mockGet = vi.mocked(apiClient.get)

      renderHook(
        () => useCrudDetail<TestUser>('users', undefined),
        { wrapper: createWrapper() }
      )

      expect(mockGet).not.toHaveBeenCalled()
    })
  })

  describe('useCrudCreate', () => {
    it('creates new entity', async () => {
      const mockPost = vi.mocked(apiClient.post)
      mockPost.mockResolvedValueOnce(mockApiResponse)

      const { result } = renderHook(
        () => useCrudCreate<TestUser>('users'),
        { wrapper: createWrapper() }
      )

      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      }

      result.current.mutate(newUser)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockPost).toHaveBeenCalledWith('/users', newUser)
    })

    it('calls onSuccess callback', async () => {
      const mockPost = vi.mocked(apiClient.post)
      mockPost.mockResolvedValueOnce(mockApiResponse)

      const onSuccess = vi.fn()

      const { result } = renderHook(
        () => useCrudCreate<TestUser>('users', { onSuccess }),
        { wrapper: createWrapper() }
      )

      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      }

      result.current.mutate(newUser)

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
        const [response, variables] = onSuccess.mock.calls[0]
        expect(response).toEqual(mockApiResponse)
        expect(variables).toEqual(newUser)
      })
    })
  })

  describe('useCrudUpdate', () => {
    it('updates existing entity', async () => {
      const mockPut = vi.mocked(apiClient.put)
      mockPut.mockResolvedValueOnce(mockApiResponse)

      const { result } = renderHook(
        () => useCrudUpdate<TestUser>('users'),
        { wrapper: createWrapper() }
      )

      const updateData = {
        name: 'Updated Name',
      }

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockPut).toHaveBeenCalledWith('/users/1', updateData)
    })

    it('handles optimistic updates', async () => {
      const mockPut = vi.mocked(apiClient.put)
      // Simulate a delay to test optimistic updates
      mockPut.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve(mockApiResponse), 100)
        )
      )

      const { result } = renderHook(
        () => useCrudUpdate<TestUser>('users'),
        { wrapper: createWrapper() }
      )

      const updateData = {
        name: 'Updated Name',
      }

      result.current.mutate({ id: '1', data: updateData })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
    })
  })

  describe('useCrudDelete', () => {
    it('deletes entity', async () => {
      const mockDelete = vi.mocked(apiClient.delete)
      mockDelete.mockResolvedValueOnce({
        data: undefined,
        success: true,
        message: 'Deleted successfully',
        timestamp: '2023-01-01T00:00:00Z',
      })

      const { result } = renderHook(
        () => useCrudDelete<TestUser>('users'),
        { wrapper: createWrapper() }
      )

      result.current.mutate('1')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockDelete).toHaveBeenCalledWith('/users/1')
    })
  })

  describe('useCrud (combined hook)', () => {
    it('provides all CRUD operations', () => {
      const { result } = renderHook(
        () => useCrud<TestUser>('users'),
        { wrapper: createWrapper() }
      )

      expect(result.current).toHaveProperty('list')
      expect(result.current).toHaveProperty('detail')
      expect(result.current).toHaveProperty('create')
      expect(result.current).toHaveProperty('update')
      expect(result.current).toHaveProperty('delete')
      expect(result.current).toHaveProperty('bulkDelete')
      expect(result.current).toHaveProperty('bulkUpdate')
    })

    it('passes options to individual hooks', async () => {
      const onSuccess = vi.fn()
      const options = {
        onSuccess,
      }

      const mockPost = vi.mocked(apiClient.post)
      mockPost.mockResolvedValueOnce(mockApiResponse)

      const { result } = renderHook(
        () => useCrud<TestUser>('users', options),
        { wrapper: createWrapper() }
      )

      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      }

      result.current.create.mutate(newUser)

      await waitFor(() => {
        expect(result.current.create.isSuccess).toBe(true)
      })

      expect(onSuccess).toHaveBeenCalled()
    })

    it('supports optimistic updates configuration', async () => {
      const mockPost = vi.mocked(apiClient.post)
      mockPost.mockResolvedValueOnce(mockApiResponse)

      const { result } = renderHook(
        () => useCrud<TestUser>('users', { optimisticUpdates: true }),
        { wrapper: createWrapper() }
      )

      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      }

      result.current.create.mutate(newUser)

      await waitFor(() => {
        expect(result.current.create.isSuccess).toBe(true)
      })
    })

    it('supports global error handling configuration', () => {
      const onError = vi.fn()

      const { result } = renderHook(
        () => useCrud<TestUser>('users', { 
          onError,
          retryConfig: { retries: 0 }
        }),
        { wrapper: createWrapper() }
      )

      // Just verify the hook is configured correctly
      expect(result.current.create).toBeDefined()
      expect(result.current.update).toBeDefined()
      expect(result.current.delete).toBeDefined()
    })
  })

  describe('useSearch', () => {
    it('searches with debounced term', async () => {
      const mockGet = vi.mocked(apiClient.get)
      mockGet.mockResolvedValueOnce(mockPaginatedResponse)

      const { result, rerender } = renderHook(
        ({ searchTerm }) => useSearch<TestUser>('users', searchTerm, 100),
        { 
          wrapper: createWrapper(),
          initialProps: { searchTerm: '' }
        }
      )

      // Initially should not search with empty term
      expect(mockGet).not.toHaveBeenCalled()

      // Update search term
      rerender({ searchTerm: 'john' })

      // Should search after debounce delay
      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith('/users', { search: 'john' })
      }, { timeout: 200 })
    })

    it('does not search with empty search term', () => {
      const mockGet = vi.mocked(apiClient.get)

      renderHook(
        () => useSearch<TestUser>('users', ''),
        { wrapper: createWrapper() }
      )

      expect(mockGet).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('handles API errors in list query', async () => {
      const mockGet = vi.mocked(apiClient.get)
      const error = new Error('API Error')
      mockGet.mockRejectedValueOnce(error)

      const { result } = renderHook(
        () => useCrudList<TestUser>('users'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })

    it('handles API errors in mutations', async () => {
      const mockPost = vi.mocked(apiClient.post)
      const error = new Error('Creation failed')
      mockPost.mockRejectedValueOnce(error)

      const { result } = renderHook(
        () => useCrudCreate<TestUser>('users', { retry: false }),
        { wrapper: createWrapper() }
      )

      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      }

      act(() => {
        result.current.mutate(newUser)
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      }, { timeout: 2000 })

      expect(result.current.error).toEqual(error)
    })
  })

  describe('Cache Management', () => {
    it('invalidates cache after successful create', async () => {
      const mockPost = vi.mocked(apiClient.post)
      mockPost.mockResolvedValueOnce(mockApiResponse)

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(QueryClientProvider, { client: queryClient }, children)
      )

      const { result } = renderHook(
        () => useCrudCreate<TestUser>('users'),
        { wrapper }
      )

      const newUser = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
      }

      result.current.mutate(newUser)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['list', 'users', undefined]
      })
    })
  })

  describe('Utility Hooks', () => {
    describe('useCrudForm', () => {
      it('handles create mode', async () => {
        const mockPost = vi.mocked(apiClient.post)
        mockPost.mockResolvedValueOnce(mockApiResponse)

        const onSuccess = vi.fn()

        const { result } = renderHook(
          () => useCrudForm<TestUser>('users', undefined, { onSuccess }),
          { wrapper: createWrapper() }
        )

        expect(result.current.isEditing).toBe(false)
        expect(result.current.existingData).toBeUndefined()

        const newUser = {
          name: 'New User',
          email: 'new@example.com',
          role: 'user',
        }

        act(() => {
          result.current.submit(newUser)
        })

        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalledWith(mockApiResponse.data, true)
        })
      })

      it('handles edit mode', async () => {
        const mockGet = vi.mocked(apiClient.get)
        const mockPut = vi.mocked(apiClient.put)
        mockGet.mockResolvedValueOnce(mockApiResponse)
        mockPut.mockResolvedValueOnce(mockApiResponse)

        const onSuccess = vi.fn()

        const { result } = renderHook(
          () => useCrudForm<TestUser>('users', '1', { onSuccess }),
          { wrapper: createWrapper() }
        )

        await waitFor(() => {
          expect(result.current.isEditing).toBe(true)
          expect(result.current.existingData).toEqual(mockApiResponse.data)
        })

        const updateData = { name: 'Updated Name' }

        act(() => {
          result.current.submit(updateData)
        })

        await waitFor(() => {
          expect(onSuccess).toHaveBeenCalledWith(mockApiResponse.data, false)
        })
      })
    })

    describe('useSelection', () => {
      it('manages selection state', () => {
        const { result } = renderHook(() => useSelection(mockUsers))

        expect(result.current.selectedCount).toBe(0)
        expect(result.current.isAllSelected).toBe(false)
        expect(result.current.isIndeterminate).toBe(false)

        act(() => {
          result.current.toggle('1')
        })

        expect(result.current.selectedCount).toBe(1)
        expect(result.current.isSelected('1')).toBe(true)
        expect(result.current.isIndeterminate).toBe(true)

        act(() => {
          result.current.toggleAll()
        })

        expect(result.current.selectedCount).toBe(2)
        expect(result.current.isAllSelected).toBe(true)
        expect(result.current.isIndeterminate).toBe(false)

        act(() => {
          result.current.clear()
        })

        expect(result.current.selectedCount).toBe(0)
      })
    })

    describe('usePagination', () => {
      it('manages pagination state', () => {
        const { result } = renderHook(() => usePagination(1, 10))

        expect(result.current.page).toBe(1)
        expect(result.current.limit).toBe(10)

        act(() => {
          result.current.nextPage()
        })

        expect(result.current.page).toBe(2)

        act(() => {
          result.current.prevPage()
        })

        expect(result.current.page).toBe(1)

        act(() => {
          result.current.changeLimit(20)
        })

        expect(result.current.limit).toBe(20)
        expect(result.current.page).toBe(1) // Should reset to page 1
      })
    })
  })
})