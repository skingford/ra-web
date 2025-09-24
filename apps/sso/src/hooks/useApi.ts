import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import type { ApiResponse, PaginationParams, PaginatedResponse } from '../types';

/**
 * API 基础配置
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

/**
 * HTTP 请求方法
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * 请求配置
 */
interface RequestConfig {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

/**
 * API 请求函数
 */
const apiRequest = async <T = any>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> => {
  const { method = 'GET', headers = {}, body, params } = config;
  
  // 获取认证 token
  const token = useAuthStore.getState().token;
  
  // 构建 URL
  let url = `${API_BASE_URL}${endpoint}`;
  if (params && method === 'GET') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
  }
  
  // 构建请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  
  // 构建请求配置
  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
  };
  
  if (body && method !== 'GET') {
    requestConfig.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, requestConfig);
    
    if (!response.ok) {
      // 处理 401 未授权错误
      if (response.status === 401) {
        useAuthStore.getState().logout();
        throw new Error('Unauthorized');
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

/**
 * 查询 Hook
 */
export const useApiQuery = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  config: Omit<RequestConfig, 'method'> = {},
  options: any = {}
) => {
  return useQuery({
    queryKey,
    queryFn: () => apiRequest<T>(endpoint, { ...config, method: 'GET' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/**
 * 分页查询 Hook
 */
export const usePaginatedQuery = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  paginationParams: PaginationParams,
  config: Omit<RequestConfig, 'method' | 'params'> = {},
  options: any = {}
) => {
  return useQuery({
    queryKey: [...queryKey, paginationParams],
    queryFn: () => apiRequest<PaginatedResponse<T>>(endpoint, {
      ...config,
      method: 'GET',
      params: paginationParams,
    }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * 变更 Hook
 */
export const useApiMutation = <TData = any, TVariables = any>(
  endpoint: string,
  method: Exclude<HttpMethod, 'GET'> = 'POST',
  options: any = {}
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: TVariables) => 
      apiRequest<TData>(endpoint, {
        method,
        body: variables,
      }),
    onSuccess: (data, variables, context) => {
      // 可以在这里添加通用的成功处理逻辑
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // 可以在这里添加通用的错误处理逻辑
      console.error('Mutation Error:', error);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

/**
 * 用户相关 API Hook
 */
export const useUserApi = () => {
  const queryClient = useQueryClient();
  
  // 获取用户列表
  const useUsers = (params: PaginationParams = { page: 1, limit: 10 }) => {
    return usePaginatedQuery(['users'], '/users', params);
  };
  
  // 获取单个用户
  const useUser = (userId: string) => {
    return useApiQuery(['users', userId], `/users/${userId}`, {}, {
      enabled: !!userId,
    });
  };
  
  // 创建用户
  const useCreateUser = () => {
    return useApiMutation('/users', 'POST', {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    });
  };
  
  // 更新用户
  const useUpdateUser = () => {
    return useApiMutation('/users', 'PUT', {
      onSuccess: (data: any, variables: any) => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
      },
    });
  };
  
  // 删除用户
  const useDeleteUser = () => {
    return useApiMutation('/users', 'DELETE', {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    });
  };
  
  return {
    useUsers,
    useUser,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
  };
};

/**
 * 权限相关 API Hook
 */
export const usePermissionApi = () => {
  const queryClient = useQueryClient();
  
  // 获取权限列表
  const usePermissions = () => {
    return useApiQuery(['permissions'], '/permissions');
  };
  
  // 获取角色列表
  const useRoles = () => {
    return useApiQuery(['roles'], '/roles');
  };
  
  // 更新用户角色
  const useUpdateUserRole = () => {
    return useApiMutation('/users/role', 'PUT', {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
    });
  };
  
  return {
    usePermissions,
    useRoles,
    useUpdateUserRole,
  };
};

/**
 * 通用 API Hook
 */
export const useApi = () => {
  return {
    request: apiRequest,
    ...useUserApi(),
    ...usePermissionApi(),
  };
};