/**
 * 用户相关类型定义
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

/**
 * 用户角色枚举
 */
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * 权限类型
 */
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

/**
 * 认证状态
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * 登录表单数据
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * 注册表单数据
 */
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

/**
 * 密码重置表单数据
 */
export interface ResetPasswordFormData {
  email: string;
}

/**
 * API响应基础类型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 主题类型
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * 布局配置
 */
export interface LayoutConfig {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  headerHeight: number;
  showBreadcrumb: boolean;
  showFooter: boolean;
  contentPadding: number;
  borderRadius: number;
  compactMode: boolean;
  theme: Theme;
  language: string;
}

/**
 * 路由元信息
 */
export interface RouteMeta {
  title: string;
  requiresAuth?: boolean;
  roles?: UserRole[];
  permissions?: string[];
  icon?: string;
  hidden?: boolean;
}

/**
 * 菜单项类型
 */
export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  meta?: RouteMeta;
}