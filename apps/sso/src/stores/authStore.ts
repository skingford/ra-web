import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginFormData, RegisterFormData } from '../types';
import { STORAGE_KEYS, API_ENDPOINTS } from '../constants';

/**
 * 认证状态管理 Store
 * 使用 Zustand 进行状态管理，支持持久化存储
 */
interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * 模拟 API 调用
 * 在实际项目中，这些应该是真实的 API 调用
 */
const mockApi = {
  login: async (credentials: LoginFormData): Promise<{ user: User; token: string }> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 模拟登录验证
    if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
      return {
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin' as any,
          permissions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
        },
        token: 'mock-jwt-token',
      };
    }
    
    throw new Error('Invalid credentials');
  },
  
  register: async (userData: RegisterFormData): Promise<{ user: User; token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        role: 'user' as any,
        permissions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      },
      token: 'mock-jwt-token',
    };
  },
  
  refreshToken: async (): Promise<{ token: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { token: 'new-mock-jwt-token' };
  },
};

/**
 * 创建认证状态管理 Store
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginFormData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await mockApi.login(credentials);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // 存储 token 到 localStorage
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          
          // 清除存储的 token
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          
          throw error;
        }
      },

      register: async (userData: RegisterFormData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await mockApi.register(userData);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // 清除所有存储的认证信息
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      },

      refreshToken: async () => {
        try {
          set({ isLoading: true });
          
          const response = await mockApi.refreshToken();
          
          set({
            token: response.token,
            isLoading: false,
            error: null,
          });
          
          localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
          
        } catch (error) {
          // Token 刷新失败，执行登出
          get().logout();
          
          throw error;
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: STORAGE_KEYS.USER,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * 权限检查 Hook
 */
export const usePermissions = () => {
  const { user } = useAuthStore();
  
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };
  
  const hasPermission = (permission: string): boolean => {
    return user?.permissions.some(p => p.name === permission) ?? false;
  };
  
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };
  
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };
  
  return {
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    isAdmin: hasRole('admin'),
    isUser: hasRole('user'),
    isModerator: hasRole('moderator'),
  };
};