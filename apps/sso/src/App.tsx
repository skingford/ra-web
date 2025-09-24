import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layout Components
import { Layout, AuthLayout, ErrorBoundary } from './components/layout/Layout';
import { ProtectedRoute, GuestRoute, AdminRoute } from './components/common/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';

// Constants
import { ROUTES } from './constants';

// Styles
import './styles/main.scss';

/**
 * 创建 React Query 客户端
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // 不重试 4xx 错误
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * 主应用组件
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="app">
            <Routes>
              {/* 认证相关路由 */}
              <Route path="/" element={<AuthLayout />}>
                <Route
                  index
                  element={<Navigate to={ROUTES.DASHBOARD} replace />}
                />
                <Route
                  path={ROUTES.LOGIN}
                  element={
                    <GuestRoute>
                      <LoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path={ROUTES.REGISTER}
                  element={
                    <GuestRoute>
                      <RegisterPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path={ROUTES.RESET_PASSWORD}
                  element={
                    <GuestRoute>
                      <ResetPasswordPage />
                    </GuestRoute>
                  }
                />
              </Route>

              {/* 主应用路由 */}
              <Route path="/" element={<Layout />}>
                {/* 仪表板 */}
                <Route
                  path={ROUTES.DASHBOARD}
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* 用户管理 */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute permissions={['users:read']}>
                      <div>Users List Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/create"
                  element={
                    <ProtectedRoute permissions={['users:create']}>
                      <div>Create User Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:id"
                  element={
                    <ProtectedRoute permissions={['users:read']}>
                      <div>User Detail Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users/:id/edit"
                  element={
                    <ProtectedRoute permissions={['users:update']}>
                      <div>Edit User Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />

                {/* 角色和权限管理 */}
                <Route
                  path="/roles"
                  element={
                    <ProtectedRoute permissions={['roles:read']}>
                      <div>Roles Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/permissions"
                  element={
                    <ProtectedRoute permissions={['permissions:read']}>
                      <div>Permissions Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />

                {/* 活动日志 */}
                <Route
                  path="/activity"
                  element={
                    <ProtectedRoute permissions={['logs:read']}>
                      <div>Activity Logs Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />

                {/* 报告 */}
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute permissions={['reports:read']}>
                      <div>Reports Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />

                {/* 系统设置 */}
                <Route
                  path="/settings"
                  element={
                    <AdminRoute>
                      <div>Settings Page (TODO)</div>
                    </AdminRoute>
                  }
                />

                {/* 个人资料 */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <div>Profile Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />

                {/* 帮助页面 */}
                <Route
                  path="/help"
                  element={<div>Help Page (TODO)</div>}
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <div>Notifications Page (TODO)</div>
                    </ProtectedRoute>
                  }
                />

                {/* 法律页面 */}
                <Route path="/terms" element={<div>Terms of Service (TODO)</div>} />
                <Route path="/privacy" element={<div>Privacy Policy (TODO)</div>} />

                {/* 404 页面 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </div>
        </Router>

        {/* React Query 开发工具 */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

/**
 * 404 页面组件
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <div className="not-found-actions">
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

export default App;
