import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';
import type { UserRole } from '../../types';

/**
 * 受保护路由组件的属性
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  roles?: UserRole[];
  permissions?: string[];
  fallback?: React.ReactNode;
}

/**
 * 受保护路由组件
 * 用于控制页面访问权限
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  roles = [],
  permissions = [],
  fallback,
}) => {
  const { isAuthenticated, user, hasRole, hasPermission, hasAnyRole, hasAnyPermission } = useAuth();
  const location = useLocation();

  // 如果需要认证但用户未登录，重定向到登录页
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return <>{children}</>;
  }

  // 检查角色权限
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return fallback || <UnauthorizedAccess />;
  }

  // 检查具体权限
  if (permissions.length > 0 && !hasAnyPermission(permissions)) {
    return fallback || <UnauthorizedAccess />;
  }

  return <>{children}</>;
};

/**
 * 管理员路由组件
 * 只允许管理员访问
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute roles={['admin' as any]}>
      {children}
    </ProtectedRoute>
  );
};

/**
 * 访客路由组件
 * 只允许未登录用户访问（如登录、注册页面）
 */
export const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    // 如果用户已登录，重定向到仪表板或之前访问的页面
    const from = (location.state as any)?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

/**
 * 权限检查组件
 * 用于在组件内部进行权限检查
 */
interface PermissionCheckProps {
  children: React.ReactNode;
  roles?: UserRole[];
  permissions?: string[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // 是否需要满足所有权限
}

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  children,
  roles = [],
  permissions = [],
  fallback = null,
  requireAll = false,
}) => {
  const { hasRole, hasPermission, hasAnyRole, hasAnyPermission } = useAuth();

  // 检查角色权限
  const hasRequiredRoles = roles.length === 0 || (
    requireAll 
      ? roles.every(role => hasRole(role))
      : hasAnyRole(roles)
  );

  // 检查具体权限
  const hasRequiredPermissions = permissions.length === 0 || (
    requireAll
      ? permissions.every(permission => hasPermission(permission))
      : hasAnyPermission(permissions)
  );

  if (hasRequiredRoles && hasRequiredPermissions) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * 未授权访问组件
 */
const UnauthorizedAccess: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="unauthorized-access">
      <div className="unauthorized-access__content">
        <div className="unauthorized-access__icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        
        <h1 className="unauthorized-access__title">Access Denied</h1>
        
        <p className="unauthorized-access__message">
          Sorry, you don't have permission to access this page.
        </p>
        
        {user && (
          <div className="unauthorized-access__user-info">
            <p>Signed in as: <strong>{user.username}</strong></p>
            <p>Role: <strong>{user.role}</strong></p>
          </div>
        )}
        
        <div className="unauthorized-access__actions">
          <button
            className="btn btn-outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
          <a href={ROUTES.DASHBOARD} className="btn btn-primary">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};