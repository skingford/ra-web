import { createContext, use, useState } from 'react'

// 创建 Context
const ThemeContext = createContext<{ theme: string; toggleTheme: () => void } | null>(null)
const UserContext = createContext<{ user: { name: string; id: number } | null } | null>(null)

// 使用 use Hook 读取 Context 的组件
function ThemeDisplay() {
  const themeContext = use(ThemeContext)
  
  if (!themeContext) {
    throw new Error('ThemeDisplay must be used within ThemeContext')
  }
  
  const { theme, toggleTheme } = themeContext

  return (
    <div 
      style={{ 
        padding: '1rem',
        background: theme === 'dark' ? '#1f2937' : '#f9fafb',
        color: theme === 'dark' ? '#f9fafb' : '#1f2937',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}
    >
      <h4>当前主题: {theme}</h4>
      <button onClick={toggleTheme} className="btn">
        切换主题
      </button>
    </div>
  )
}

function UserProfile() {
  const userContext = use(UserContext)
  
  return (
    <div className="example-container">
      <h4>用户信息</h4>
      {userContext?.user ? (
        <div>
          <p><strong>姓名:</strong> {userContext.user.name}</p>
          <p><strong>ID:</strong> {userContext.user.id}</p>
        </div>
      ) : (
        <p>未登录</p>
      )}
    </div>
  )
}

export default function ContextProviderExample() {
  const [theme, setTheme] = useState('light')
  const [user] = useState<{ name: string; id: number } | null>({
    name: '张三',
    id: 1
  })

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <div>
      <h1>Context Provider 示例</h1>
      <p className="example-description">
        React 19 简化了 Context Provider 的使用，可以直接传递值而不需要 value 属性。
      </p>

      <div className="code-example">
        <h3>React 19 简化语法</h3>
        <pre style={{ 
          background: '#1e293b', 
          color: '#e2e8f0', 
          padding: '1.5rem', 
          borderRadius: '8px',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          overflow: 'auto'
        }}>{`// 传统方式
<ThemeContext.Provider value={{ theme, toggleTheme }}>
  <Component />
</ThemeContext.Provider>

// React 19 新语法 (如果支持)
<ThemeContext value={{ theme, toggleTheme }}>
  <Component />
</ThemeContext>

// 使用 use Hook 读取
function Component() {
  const { theme, toggleTheme } = use(ThemeContext)
  return <div>Current theme: {theme}</div>
}`}</pre>
      </div>

      {/* 传统 Provider 方式 */}
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <UserContext.Provider value={{ user }}>
          <div className="example-container">
            <h2 className="example-title">Context 示例</h2>
            <ThemeDisplay />
            <UserProfile />
          </div>
        </UserContext.Provider>
      </ThemeContext.Provider>

      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>类型安全:</strong> 使用 TypeScript 确保 Context 类型安全</li>
          <li><strong>默认值:</strong> 提供合理的默认值</li>
          <li><strong>错误处理:</strong> 检查 Context 是否在 Provider 内使用</li>
          <li><strong>性能优化:</strong> 避免不必要的重新渲染</li>
        </ul>
      </div>
    </div>
  )
}