import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Github, 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme, useLayout } from '../../stores/themeStore';
import { ROUTES } from '../../constants';

/**
 * Header 组件
 * GitHub 风格的顶部导航栏
 */
export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { layoutConfig, toggleSidebar } = useLayout();
  
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  /**
   * 处理登出
   */
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  /**
   * 处理搜索
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Search:', searchQuery);
      // 在实际应用中，这里应该执行搜索逻辑
    }
  };

  /**
   * 关闭下拉菜单
   */
  const closeMenus = () => {
    setShowUserMenu(false);
    setShowNotifications(false);
  };

  // 点击外部关闭菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown')) {
        closeMenus();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="app-header__container">
        {/* Left Section */}
        <div className="app-header__left">
          {/* Sidebar Toggle */}
          <button
            className="app-header__sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={layoutConfig.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {layoutConfig.sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>

          {/* Logo */}
          <Link to={ROUTES.DASHBOARD} className="app-header__logo">
            <Github size={24} />
            <span className="app-header__logo-text">SSO Admin</span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="app-header__center">
          <form className="app-header__search" onSubmit={handleSearch}>
            <div className="app-header__search-wrapper">
              <Search className="app-header__search-icon" size={16} />
              <input
                type="text"
                className="app-header__search-input"
                placeholder="Search users, roles, permissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="app-header__search-shortcut">⌘K</kbd>
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="app-header__right">
          {isAuthenticated ? (
            <>
              {/* Theme Toggle */}
              <button
                className="app-header__action"
                onClick={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Notifications */}
              <div className="dropdown">
                <button
                  className="app-header__action app-header__notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="View notifications"
                >
                  <Bell size={20} />
                  <span className="app-header__notifications-badge">3</span>
                </button>

                {showNotifications && (
                  <div className="dropdown__menu dropdown__menu--right">
                    <div className="dropdown__header">
                      <h3>Notifications</h3>
                    </div>
                    <div className="dropdown__content">
                      <div className="notification-item">
                        <div className="notification-item__content">
                          <p className="notification-item__title">New user registered</p>
                          <p className="notification-item__description">john.doe@example.com</p>
                          <span className="notification-item__time">2 minutes ago</span>
                        </div>
                      </div>
                      <div className="notification-item">
                        <div className="notification-item__content">
                          <p className="notification-item__title">Role permissions updated</p>
                          <p className="notification-item__description">Editor role modified</p>
                          <span className="notification-item__time">1 hour ago</span>
                        </div>
                      </div>
                      <div className="notification-item">
                        <div className="notification-item__content">
                          <p className="notification-item__title">System maintenance</p>
                          <p className="notification-item__description">Scheduled for tonight</p>
                          <span className="notification-item__time">3 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown__footer">
                      <Link to="/notifications" className="dropdown__link">
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="dropdown">
                <button
                  className="app-header__user"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                    alt={user?.username}
                    className="app-header__user-avatar"
                  />
                  <span className="app-header__user-name">{user?.username}</span>
                </button>

                {showUserMenu && (
                  <div className="dropdown__menu dropdown__menu--right">
                    <div className="dropdown__header">
                      <div className="dropdown__user-info">
                        <img
                          src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                          alt={user?.username}
                          className="dropdown__user-avatar"
                        />
                        <div className="dropdown__user-details">
                          <p className="dropdown__user-name">{user?.username}</p>
                          <p className="dropdown__user-email">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown__content">
                      <Link to="/profile" className="dropdown__item">
                        <User size={16} />
                        <span>Profile</span>
                      </Link>
                      <Link to="/settings" className="dropdown__item">
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <div className="dropdown__footer">
                      <button
                        className="dropdown__item dropdown__item--danger"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Guest Actions */
            <div className="app-header__guest-actions">
              <Link to={ROUTES.LOGIN} className="btn btn-outline btn-sm">
                Sign in
              </Link>
              <Link to={ROUTES.REGISTER} className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};