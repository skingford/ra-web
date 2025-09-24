/**
 * API 相关常量
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    PROFILE: '/auth/profile',
  },
  USERS: {
    LIST: '/users',
    DETAIL: '/users/:id',
    UPDATE: '/users/:id',
    DELETE: '/users/:id',
  },
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  TOKEN: 'sso_token',
  REFRESH_TOKEN: 'sso_refresh_token',
  USER: 'sso_user',
  THEME: 'sso_theme',
  LANGUAGE: 'sso_language',
  LAYOUT_CONFIG: 'sso_layout_config',
} as const;

/**
 * 路由路径常量
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  USERS: '/users',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
} as const;

/**
 * 主题常量
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

/**
 * 语言常量
 */
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
} as const;

/**
 * 用户角色常量
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
  GUEST: 'guest',
} as const;

/**
 * 权限动作常量
 */
export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  UPDATE: 'update',
  CREATE: 'create',
} as const;

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 表单验证规则
 */
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: {
    MIN_LENGTH: 8,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
} as const;

/**
 * 分页默认配置
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 10000;

/**
 * Token 刷新阈值（分钟）
 */
export const TOKEN_REFRESH_THRESHOLD = 5;