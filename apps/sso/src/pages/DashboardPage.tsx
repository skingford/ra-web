import React from 'react';
import { Users, Shield, Activity, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * 仪表板页面组件
 * 显示系统概览和快速操作
 */
export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  /**
   * 统计数据（模拟数据）
   */
  const stats = [
    {
      id: 'users',
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      id: 'permissions',
      title: 'Active Permissions',
      value: '56',
      change: '+3',
      changeType: 'positive' as const,
      icon: Shield,
    },
    {
      id: 'activity',
      title: 'Daily Active Users',
      value: '892',
      change: '-2%',
      changeType: 'negative' as const,
      icon: Activity,
    },
    {
      id: 'settings',
      title: 'System Health',
      value: '99.9%',
      change: 'Stable',
      changeType: 'neutral' as const,
      icon: Settings,
    },
  ];

  /**
   * 快速操作
   */
  const quickActions = [
    {
      id: 'create-user',
      title: 'Create User',
      description: 'Add a new user to the system',
      href: '/users/create',
      icon: Users,
      color: 'blue',
    },
    {
      id: 'manage-roles',
      title: 'Manage Roles',
      description: 'Configure user roles and permissions',
      href: '/roles',
      icon: Shield,
      color: 'green',
    },
    {
      id: 'view-activity',
      title: 'View Activity',
      description: 'Monitor system activity and logs',
      href: '/activity',
      icon: Activity,
      color: 'orange',
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure system preferences',
      href: '/settings',
      icon: Settings,
      color: 'purple',
    },
  ];

  /**
   * 最近活动（模拟数据）
   */
  const recentActivity = [
    {
      id: '1',
      type: 'user_created',
      message: 'New user "john.doe" was created',
      timestamp: '2 minutes ago',
      user: 'Admin',
    },
    {
      id: '2',
      type: 'role_updated',
      message: 'Role "Editor" permissions updated',
      timestamp: '15 minutes ago',
      user: 'Admin',
    },
    {
      id: '3',
      type: 'user_login',
      message: 'User "jane.smith" logged in',
      timestamp: '1 hour ago',
      user: 'jane.smith',
    },
    {
      id: '4',
      type: 'permission_granted',
      message: 'Permission "write" granted to user "bob.wilson"',
      timestamp: '2 hours ago',
      user: 'Admin',
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="dashboard-header">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user?.username}!</h1>
          <p>Here's what's happening with your SSO system today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-stats">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.id} className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-icon">
                  <IconComponent size={24} />
                </div>
                <div className="stat-card-info">
                  <h3 className="stat-card-title">{stat.title}</h3>
                  <div className="stat-card-value">{stat.value}</div>
                </div>
              </div>
              <div className="stat-card-footer">
                <span className={`stat-card-change stat-card-change-${stat.changeType}`}>
                  {stat.change}
                </span>
                <span className="stat-card-period">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-content">
        {/* Quick Actions */}
        {isAdmin && (
          <div className="dashboard-section">
            <h2 className="dashboard-section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <a
                    key={action.id}
                    href={action.href}
                    className={`quick-action-card quick-action-card-${action.color}`}
                  >
                    <div className="quick-action-icon">
                      <IconComponent size={24} />
                    </div>
                    <div className="quick-action-content">
                      <h3 className="quick-action-title">{action.title}</h3>
                      <p className="quick-action-description">{action.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Recent Activity</h2>
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-content">
                  <div className="activity-message">{activity.message}</div>
                  <div className="activity-meta">
                    <span className="activity-user">by {activity.user}</span>
                    <span className="activity-timestamp">{activity.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};