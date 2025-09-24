import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme, LayoutConfig } from '../types';
import { STORAGE_KEYS, THEMES } from '../constants';

/**
 * 主题和布局状态管理 Store
 */
interface ThemeStore {
  // State
  theme: Theme;
  layoutConfig: LayoutConfig;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  updateLayoutConfig: (config: Partial<LayoutConfig>) => void;
  resetLayoutConfig: () => void;
}

/**
 * 默认布局配置
 */
const defaultLayoutConfig: LayoutConfig = {
  sidebarCollapsed: false,
  sidebarWidth: 280,
  headerHeight: 64,
  showBreadcrumb: true,
  showFooter: true,
  contentPadding: 24,
  borderRadius: 8,
  compactMode: false,
  theme: THEMES.LIGHT,
  language: 'zh-CN',
};

/**
 * 创建主题状态管理 Store
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: THEMES.LIGHT,
      layoutConfig: defaultLayoutConfig,

      // Actions
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // 更新 HTML 根元素的 data-theme 属性
        document.documentElement.setAttribute('data-theme', theme);
        
        // 更新 CSS 变量
        if (theme === THEMES.DARK) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        get().setTheme(newTheme);
      },

      updateLayoutConfig: (config: Partial<LayoutConfig>) => {
        set(state => ({
          layoutConfig: { ...state.layoutConfig, ...config }
        }));
      },

      resetLayoutConfig: () => {
        set({ layoutConfig: defaultLayoutConfig });
      },
    }),
    {
      name: STORAGE_KEYS.THEME,
      partialize: (state) => ({
        theme: state.theme,
        layoutConfig: state.layoutConfig,
      }),
      onRehydrateStorage: () => (state) => {
        // 恢复主题时应用到 DOM
        if (state?.theme) {
          document.documentElement.setAttribute('data-theme', state.theme);
          if (state.theme === THEMES.DARK) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);

/**
 * 主题相关的 Hook
 */
export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeStore();
  
  const isDark = theme === THEMES.DARK;
  const isLight = theme === THEMES.LIGHT;
  
  return {
    theme,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
  };
};

/**
 * 布局配置相关的 Hook
 */
export const useLayout = () => {
  const { layoutConfig, updateLayoutConfig, resetLayoutConfig } = useThemeStore();
  
  const toggleSidebar = () => {
    updateLayoutConfig({ sidebarCollapsed: !layoutConfig.sidebarCollapsed });
  };
  
  const setSidebarWidth = (width: number) => {
    updateLayoutConfig({ sidebarWidth: width });
  };
  
  const toggleCompactMode = () => {
    updateLayoutConfig({ compactMode: !layoutConfig.compactMode });
  };
  
  return {
    layoutConfig,
    updateLayoutConfig,
    resetLayoutConfig,
    toggleSidebar,
    setSidebarWidth,
    toggleCompactMode,
  };
};