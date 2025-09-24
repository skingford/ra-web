import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useLayout } from '../../stores/themeStore';

/**
 * 主布局组件
 * 包含 Header、Sidebar 和主内容区域
 */
export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { layoutConfig } = useLayout();

  // 如果未认证，只显示内容区域（用于登录、注册等页面）
  if (!isAuthenticated) {
    return (
      <div className="app-layout app-layout--auth">
        <main className="app-main app-main--auth">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <Header />
      
      <div className="app-body">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main 
          className={`app-main ${layoutConfig.sidebarCollapsed ? 'app-main--sidebar-collapsed' : ''}`}
          style={{
            paddingTop: `${layoutConfig.headerHeight}px`,
            marginLeft: layoutConfig.sidebarCollapsed ? '60px' : `${layoutConfig.sidebarWidth}px`,
          }}
        >
          <div 
            className="app-content"
            style={{
              padding: `${layoutConfig.contentPadding}px`,
            }}
          >
            <Outlet />
          </div>
          
          {/* Footer */}
          {layoutConfig.showFooter && (
            <footer className="app-footer">
              <div className="app-footer__content">
                <div className="app-footer__left">
                  <span>&copy; 2024 SSO Admin. All rights reserved.</span>
                </div>
                <div className="app-footer__right">
                  <a href="/terms" className="app-footer__link">Terms</a>
                  <a href="/privacy" className="app-footer__link">Privacy</a>
                  <a href="/help" className="app-footer__link">Help</a>
                </div>
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
};

/**
 * 认证布局组件
 * 用于登录、注册等认证相关页面
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      <div className="auth-layout__background">
        {/* 背景装饰 */}
        <div className="auth-background-pattern"></div>
      </div>
      
      <div className="auth-layout__content">
        <Outlet />
      </div>
      
      <footer className="auth-layout__footer">
        <div className="auth-footer__content">
          <div className="auth-footer__links">
            <a href="/terms" className="auth-footer__link">Terms</a>
            <a href="/privacy" className="auth-footer__link">Privacy</a>
            <a href="/help" className="auth-footer__link">Help</a>
          </div>
          <div className="auth-footer__copyright">
            <span>&copy; 2024 SSO Admin</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/**
 * 错误边界组件
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h1>Something went wrong</h1>
            <p>We're sorry, but something unexpected happened.</p>
            <details className="error-boundary__details">
              <summary>Error details</summary>
              <pre>{this.state.error?.stack}</pre>
            </details>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}