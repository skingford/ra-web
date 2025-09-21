// 路由工具函数

import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import type { DynamicRouteParams, RouteHooks, NavigateOptions } from '../types/routes';

// 路由路径常量
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  USER_DETAIL: (id: string) => `/users/${id}`,
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (category: string) => `/categories/${category}`,
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;

// 路由参数构建器
export const buildRoute = {
  userDetail: (id: string) => `/users/${id}`,
  productDetail: (id: string) => `/products/${id}`,
  categoryDetail: (category: string) => `/categories/${category}`,
  withQuery: (path: string, params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    return `${path}?${searchParams.toString()}`;
  },
} as const;

// 路由钩子
export function useRouteHooks(): RouteHooks {
  const navigate = useNavigate();

  return {
    navigate: useCallback((to: string, options?: NavigateOptions) => {
      navigate(to, options);
    }, [navigate]),
    
    goBack: useCallback(() => {
      navigate(-1);
    }, [navigate]),
    
    goForward: useCallback(() => {
      navigate(1);
    }, [navigate]),
    
    replace: useCallback((to: string, options?: NavigateOptions) => {
      navigate(to, { ...options, replace: true });
    }, [navigate]),
  };
}

// 获取当前路由参数
export function useRouteParams<T extends DynamicRouteParams = DynamicRouteParams>(): T {
  const params = useParams();
  return params as T;
}

// 获取查询参数
export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getParam = useCallback((key: string) => {
    return searchParams.get(key);
  }, [searchParams]);
  
  const setParam = useCallback((key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(key, value);
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);
  
  const removeParam = useCallback((key: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete(key);
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);
  
  const clearParams = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);
  
  return {
    getParam,
    setParam,
    removeParam,
    clearParams,
    searchParams,
    setSearchParams,
  };
}

// 获取当前路径信息
export function useCurrentPath() {
  const location = useLocation();
  
  return useMemo(() => ({
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    state: location.state,
    key: location.key,
    fullPath: `${location.pathname}${location.search}${location.hash}`,
  }), [location]);
}

// 路由匹配器
export function matchRoute(pathname: string, pattern: string): boolean {
  // 简单的路由匹配，支持动态参数
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  
  if (patternParts.length !== pathParts.length) {
    return false;
  }
  
  return patternParts.every((part, index) => {
    if (part.startsWith(':')) {
      // 动态参数，总是匹配
      return true;
    }
    return part === pathParts[index];
  });
}

// 从路径中提取参数
export function extractParams(pathname: string, pattern: string): Record<string, string> {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');
  const params: Record<string, string> = {};
  
  patternParts.forEach((part, index) => {
    if (part.startsWith(':')) {
      const paramName = part.slice(1); // 移除 ':'
      params[paramName] = pathParts[index] || '';
    }
  });
  
  return params;
}

// 权限检查工具
export function hasPermission(userRoles: string[], requiredRoles?: string[]): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  return requiredRoles.some(role => userRoles.includes(role));
}

// 路由守卫
export function createRouteGuard(
  checkAuth: () => boolean,
  checkPermission: (roles: string[]) => boolean,
  userRoles: string[] = []
) {
  return function routeGuard(requiredAuth: boolean = false, requiredRoles?: string[]) {
    if (requiredAuth && !checkAuth()) {
      return false;
    }
    
    if (requiredRoles && !hasPermission(userRoles, requiredRoles)) {
      return false;
    }
    
    return true;
  };
}
