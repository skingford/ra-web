import { useCallback } from 'react';
import { useAuthStore, usePermissions } from '../stores/authStore';
import type { LoginFormData, RegisterFormData } from '../types';

/**
 * 认证相关的自定义 Hook
 * 提供认证状态和操作的便捷访问
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    clearError,
    setLoading,
  } = useAuthStore();

  const permissions = usePermissions();

  /**
   * 登录处理
   */
  const handleLogin = useCallback(async (credentials: LoginFormData) => {
    try {
      await login(credentials);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }, [login]);

  /**
   * 注册处理
   */
  const handleRegister = useCallback(async (userData: RegisterFormData) => {
    try {
      await register(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }, [register]);

  /**
   * 登出处理
   */
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  /**
   * Token 刷新处理
   */
  const handleRefreshToken = useCallback(async () => {
    try {
      await refreshToken();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      };
    }
  }, [refreshToken]);

  /**
   * 检查是否需要刷新 Token
   */
  const shouldRefreshToken = useCallback((): boolean => {
    if (!token || !isAuthenticated) return false;
    
    try {
      // 解析 JWT token (简化版本，实际项目中应使用专门的库)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;
      
      // 如果 token 在 5 分钟内过期，则需要刷新
      return timeUntilExpiry < 300;
    } catch {
      return true; // 如果无法解析 token，则需要刷新
    }
  }, [token, isAuthenticated]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    updateUser,
    clearError,
    setLoading,
    
    // Utilities
    shouldRefreshToken,
    
    // Permissions
    ...permissions,
  };
};