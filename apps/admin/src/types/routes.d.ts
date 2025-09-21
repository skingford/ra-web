// 路由相关类型定义

import type { RouteObject } from 'react-router-dom';

// 路由配置类型
export interface RouteConfig extends Omit<RouteObject, 'children'> {
  children?: RouteConfig[];
  meta?: RouteMeta;
}

// 路由元信息类型
export interface RouteMeta {
  title?: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
  icon?: string;
  hidden?: boolean;
  breadcrumb?: boolean;
}

// 动态路由参数类型
export interface DynamicRouteParams {
  id?: string;
  slug?: string;
  category?: string;
  [key: string]: string | undefined;
}

// 路由钩子返回类型
export interface RouteHooks {
  navigate: (to: string, options?: NavigateOptions) => void;
  goBack: () => void;
  goForward: () => void;
  replace: (to: string, options?: NavigateOptions) => void;
}

// 导航选项类型
export interface NavigateOptions {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: 'route' | 'path';
}

// 面包屑项类型
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  label: string;
  path?: string;
  icon?: string;
  children?: MenuItem[];
  meta?: RouteMeta;
}

// 权限检查函数类型
export type PermissionChecker = (roles: string[]) => boolean;
