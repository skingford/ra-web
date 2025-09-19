import { Outlet, Link, useLocation } from 'react-router-dom'
import './Layout.css'

const examples = [
  { path: '/', label: '首页', description: 'React 19 API 示例集合' },
  { path: '/use-hook', label: 'use Hook', description: '新的 use Hook API' },
  { path: '/actions', label: 'Actions', description: '表单 Actions 和状态管理' },
  { path: '/optimistic-updates', label: 'Optimistic Updates', description: '乐观更新' },
  { path: '/transitions', label: 'Transitions', description: '过渡状态管理' },
  { path: '/server-components', label: 'Server Components', description: '服务端组件示例' },
  { path: '/suspense', label: 'Suspense', description: '增强的 Suspense' },
  { path: '/error-boundary', label: 'Error Boundary', description: '错误边界处理' },
  { path: '/ref-cleanup', label: 'Ref Cleanup', description: 'Ref 清理函数' },
  { path: '/context-provider', label: 'Context Provider', description: '简化的 Context Provider' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="layout">
      <nav className="sidebar">
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
                  <div className="nav-label">{example.label}</div>
                  <div className="nav-description">{example.description}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}