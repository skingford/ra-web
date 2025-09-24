import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Users,
  Shield,
  Settings,
  Activity,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLayout } from '../../stores/themeStore';
import { ROUTES } from '../../constants';
import type { MenuItem } from '../../types';

/**
 * Sidebar 组件
 * GitHub 风格的侧边导航栏
 */
export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin, hasPermission } = useAuth();
  const { layoutConfig } = useLayout();
  
  const [expandedMenus, setExpandedMenus] = React.useState<Set<string>>(new Set(['users']));

  /**
   * 菜单配置
   */
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: 'Home',
      meta: {
        title: 'Dashboard',
        requiresAuth: true,
      },
    },
    {
      id: 'users',
      title: 'User Management',
      path: '/users',
      icon: 'Users',
      meta: {
        title: 'Users',
        requiresAuth: true,
        permissions: ['users:read'],
      },
      children: [
        {
          id: 'users-list',
          title: 'All Users',
          path: '/users',
          meta: {
            title: 'All Users',
            requiresAuth: true,
            permissions: ['users:read'],
          },
        },
        {
          id: 'users-create',
          title: 'Create User',
          path: '/users/create',
          meta: {
            title: 'Create User',
            requiresAuth: true,
            permissions: ['users:create'],
          },
        },
        {
          id: 'users-roles',
          title: 'User Roles',
          path: '/users/roles',
          meta: {
            title: 'User Roles',
            requiresAuth: true,
            permissions: ['roles:read'],
          },
        },
      ],
    },
    {
      id: 'permissions',
      title: 'Permissions',
      path: '/permissions',
      icon: 'Shield',
      meta: {
        title: 'Permissions',
        requiresAuth: true,
        permissions: ['permissions:read'],
      },
      children: [
        {
          id: 'permissions-list',
          title: 'All Permissions',
          path: '/permissions',
          meta: {
            title: 'All Permissions',
            requiresAuth: true,
            permissions: ['permissions:read'],
          },
        },
        {
          id: 'roles-list',
          title: 'Roles',
          path: '/roles',
          meta: {
            title: 'Roles',
            requiresAuth: true,
            permissions: ['roles:read'],
          },
        },
      ],
    },
    {
      id: 'activity',
      title: 'Activity Logs',
      path: '/activity',
      icon: 'Activity',
      meta: {
        title: 'Activity',
        requiresAuth: true,
        permissions: ['logs:read'],
      },
    },
    {
      id: 'reports',
      title: 'Reports',
      path: '/reports',
      icon: 'FileText',
      meta: {
        title: 'Reports',
        requiresAuth: true,
        permissions: ['reports:read'],
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      path: '/settings',
      icon: 'Settings',
      meta: {
        title: 'Settings',
        requiresAuth: true,
        roles: ['admin' as any],
      },
    },
  ];

  /**
   * 图标映射
   */
  const iconMap = {
    Home,
    Users,
    Shield,
    Settings,
    Activity,
    FileText,
    HelpCircle,
  };

  /**
   * 检查菜单项是否可见
   */
  const isMenuItemVisible = (item: MenuItem): boolean => {
    // 检查角色权限
    if (item.meta?.roles && !item.meta.roles.some(role => role === 'admin' && isAdmin)) {
      return false;
    }

    // 检查具体权限
    if (item.meta?.permissions && !item.meta.permissions.some(permission => hasPermission(permission))) {
      return false;
    }

    return true;
  };

  /**
   * 检查菜单项是否激活
   */
  const isMenuItemActive = (item: MenuItem): boolean => {
    if (item.children) {
      return item.children.some(child => location.pathname === child.path);
    }
    return location.pathname === item.path;
  };

  /**
   * 切换菜单展开状态
   */
  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  /**
   * 渲染菜单项
   */
  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!isMenuItemVisible(item)) {
      return null;
    }

    const IconComponent = item.icon ? iconMap[item.icon as keyof typeof iconMap] : null;
    const isActive = isMenuItemActive(item);
    const isExpanded = expandedMenus.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id} className="sidebar-menu-item">
        {hasChildren ? (
          <button
            className={`sidebar-menu-link sidebar-menu-link--expandable ${isActive ? 'sidebar-menu-link--active' : ''}`}
            onClick={() => toggleMenu(item.id)}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            <div className="sidebar-menu-link__content">
              {IconComponent && (
                <IconComponent className="sidebar-menu-link__icon" size={18} />
              )}
              {!layoutConfig.sidebarCollapsed && (
                <>
                  <span className="sidebar-menu-link__text">{item.title}</span>
                  <div className="sidebar-menu-link__expand">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </>
              )}
            </div>
          </button>
        ) : (
          <Link
            to={item.path}
            className={`sidebar-menu-link ${isActive ? 'sidebar-menu-link--active' : ''}`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            <div className="sidebar-menu-link__content">
              {IconComponent && (
                <IconComponent className="sidebar-menu-link__icon" size={18} />
              )}
              {!layoutConfig.sidebarCollapsed && (
                <span className="sidebar-menu-link__text">{item.title}</span>
              )}
            </div>
          </Link>
        )}

        {/* 子菜单 */}
        {hasChildren && isExpanded && !layoutConfig.sidebarCollapsed && (
          <div className="sidebar-submenu">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`app-sidebar ${layoutConfig.sidebarCollapsed ? 'app-sidebar--collapsed' : ''}`}>
      <div className="app-sidebar__content">
        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="sidebar-menu">
            {menuItems.map(item => renderMenuItem(item))}
          </div>
        </nav>

        {/* Footer */}
        {!layoutConfig.sidebarCollapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-footer__item">
              <Link to="/help" className="sidebar-footer__link">
                <HelpCircle size={16} />
                <span>Help & Support</span>
              </Link>
            </div>
            <div className="sidebar-footer__version">
              <span>v1.0.0</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};