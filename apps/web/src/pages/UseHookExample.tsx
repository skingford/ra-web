import { use, useState, Suspense, createContext } from 'react'

// 模拟 API 调用
const fetchUserData = (userId: number): Promise<{ id: number; name: string; email: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: userId,
        name: `用户 ${userId}`,
        email: `user${userId}@example.com`
      })
    }, 1000)
  })
}

// 创建一个 Context 用于演示 use Hook 读取 Context
const ThemeContext = createContext<{ theme: string; toggleTheme: () => void }>({
  theme: 'light',
  toggleTheme: () => { }
})

// 使用 use Hook 读取 Promise 的组件
function UserProfile({ userPromise }: { userPromise: Promise<any> }) {
  // 🎯 关键特性：use Hook 可以直接读取 Promise
  // 不需要 useEffect 和 useState 的组合
  const user = use(userPromise)

  return (
    <div className="example-container">
      <h3 className="example-title">用户信息</h3>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>姓名:</strong> {user.name}</p>
      <p><strong>邮箱:</strong> {user.email}</p>
    </div>
  )
}

// 使用 use Hook 读取 Context 的组件
function ThemeDisplay() {
  // 🎯 关键特性：use Hook 可以读取 Context，无需 useContext
  const { theme, toggleTheme } = use(ThemeContext)

  return (
    <div className="example-container" style={{
      background: theme === 'dark' ? '#1f2937' : '#f9fafb',
      color: theme === 'dark' ? '#f9fafb' : '#1f2937'
    }}>
      <h3 className="example-title">当前主题: {theme}</h3>
      <button className="btn" onClick={toggleTheme}>
        切换到 {theme === 'light' ? '深色' : '浅色'} 主题
      </button>
    </div>
  )
}

// 条件性使用 use Hook 的示例
function ConditionalDataLoader({ shouldLoad }: { shouldLoad: boolean }) {
  let data = null

  if (shouldLoad) {
    // 🎯 关键特性：use Hook 可以在条件语句中使用
    // 这在传统 Hook 中是不被允许的
    const promise = fetchUserData(Math.floor(Math.random() * 100))
    data = use(promise)
  }

  return (
    <div className="example-container">
      <h3 className="example-title">条件性数据加载</h3>
      {shouldLoad ? (
        <div>
          <p>✅ 数据已加载</p>
          <p><strong>用户:</strong> {data?.name}</p>
        </div>
      ) : (
        <p>❌ 未加载数据</p>
      )}
    </div>
  )
}

export default function UseHookExample() {
  const [userId, setUserId] = useState(1)
  const [theme, setTheme] = useState('light')
  const [shouldLoadConditional, setShouldLoadConditional] = useState(false)

  // 创建 Promise 用于演示
  const userPromise = fetchUserData(userId)

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <div>
      <h1>use Hook 示例</h1>
      <p className="example-description">
        React 19 引入的全新 use Hook 可以读取 Promise 和 Context，
        提供了更简洁的异步数据处理方式。与传统 Hook 不同，use Hook 可以在条件语句和循环中使用。
      </p>

      {/* 代码示例 */}
      <div className="code-example">
        <h3>核心用法</h3>
        <pre style={{
          background: '#1e293b',
          color: '#e2e8f0',
          padding: '1.5rem',
          borderRadius: '8px',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          overflow: 'auto'
        }}>{`// 1. 读取 Promise
const user = use(userPromise)

// 2. 读取 Context  
const theme = use(ThemeContext)

// 3. 条件性使用（传统 Hook 不允许）
if (shouldLoad) {
  const data = use(promise)
}`}</pre>
      </div>

      {/* 实际示例 */}
      <div className="example-container">
        <h2 className="example-title">1. 读取 Promise 示例</h2>
        <p className="example-description">
          use Hook 可以直接读取 Promise，自动处理 pending 状态。
          需要配合 Suspense 使用来处理加载状态。
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <label>
            用户 ID:
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              className="input"
              style={{ marginLeft: '0.5rem', width: '100px' }}
            />
          </label>
        </div>

        <Suspense fallback={<div className="status loading">加载用户数据中...</div>}>
          <UserProfile userPromise={userPromise} />
        </Suspense>
      </div>

      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className="example-container">
          <h2 className="example-title">2. 读取 Context 示例</h2>
          <p className="example-description">
            use Hook 可以替代 useContext，提供更简洁的 Context 读取方式。
          </p>
          <ThemeDisplay />
        </div>
      </ThemeContext.Provider>

      <div className="example-container">
        <h2 className="example-title">3. 条件性使用示例</h2>
        <p className="example-description">
          与传统 Hook 不同，use Hook 可以在条件语句中使用，提供更大的灵活性。
        </p>

        <div style={{ marginBottom: '1rem' }}>
          <button
            className="btn"
            onClick={() => setShouldLoadConditional(!shouldLoadConditional)}
          >
            {shouldLoadConditional ? '停止加载' : '开始加载'}
          </button>
        </div>

        <Suspense fallback={<div className="status loading">条件加载中...</div>}>
          <ConditionalDataLoader shouldLoad={shouldLoadConditional} />
        </Suspense>
      </div>

      {/* 最佳实践 */}
      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>Promise 处理:</strong> 始终配合 Suspense 使用来处理加载状态</li>
          <li><strong>错误处理:</strong> 使用 Error Boundary 捕获 Promise 中的错误</li>
          <li><strong>条件使用:</strong> 利用条件性使用的特性简化复杂逻辑</li>
          <li><strong>Context 读取:</strong> 可以替代 useContext，语法更简洁</li>
          <li><strong>性能考虑:</strong> Promise 会被缓存，避免重复请求</li>
        </ul>
      </div>

      {/* 注意事项 */}
      <div className="example-container">
        <h2 className="example-title">⚠️ 注意事项</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li>use Hook 只能在组件或其他 Hook 中使用</li>
          <li>读取 Promise 时必须配合 Suspense 使用</li>
          <li>Promise 应该是稳定的引用，避免在每次渲染时创建新的 Promise</li>
          <li>错误处理需要通过 Error Boundary 实现</li>
        </ul>
      </div>
    </div>
  )
}