import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './Layout.css'

const examples = [
  { path: '/', label: '首页', description: 'React 19 API 示例集合', icon: '🏠' },
  { path: '/use-hook', label: 'use Hook', description: '新的 use Hook API', icon: '🪝' },
  { path: '/actions', label: 'Actions', description: '表单 Actions 和状态管理', icon: '⚡' },
  { path: '/optimistic-updates', label: 'Optimistic Updates', description: '乐观更新', icon: '🚀' },
  { path: '/transitions', label: 'Transitions', description: '过渡状态管理', icon: '🔄' },
  { path: '/server-components', label: 'Server Components', description: '服务端组件示例', icon: '🖥️' },
  { path: '/suspense', label: 'Suspense', description: '增强的 Suspense', icon: '⏳' },
  { path: '/error-boundary', label: 'Error Boundary', description: '错误边界处理', icon: '🛡️' },
  { path: '/ref-cleanup', label: 'Ref Cleanup', description: 'Ref 清理函数', icon: '🧹' },
  { path: '/context-provider', label: 'Context Provider', description: '简化的 Context Provider', icon: '🔗' },
]

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 关闭移动端菜单当路由改变时
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="layout">
      {/* 移动端菜单按钮 */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleSidebar}
        aria-label="切换菜单"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* 移动端遮罩层 */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      {/* 侧边栏 */}
      <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>React 19 示例</h1>
          <p>完整的 API 使用指南</p>
        </div>
        <ul className="nav-list">
          {examples.map((example) => (
            <li key={example.path}>
              <Link 
                to={example.path} 
                className={location.pathname === example.path ? 'active' : ''}
              >
                <div className="nav-item">
                  <div className="nav-label">
                    <span className="nav-icon">{example.icon}</span>
                    {example.label}
                  </div>
                  <div className="nav-description">{example.description}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 主内容区域 */}
      <main className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}