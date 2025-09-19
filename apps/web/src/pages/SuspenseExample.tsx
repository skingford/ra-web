import React, { Suspense, lazy, useState, use } from 'react'

// 模拟异步数据获取
const fetchUserProfile = (userId: number): Promise<{ id: number; name: string; avatar: string; bio: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        reject(new Error('获取用户信息失败'))
      } else {
        resolve({
          id: userId,
          name: `用户 ${userId}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          bio: `这是用户 ${userId} 的个人简介，包含了一些有趣的信息。`
        })
      }
    }, Math.random() * 2000 + 500)
  })
}

const fetchUserPosts = (userId: number): Promise<Array<{ id: number; title: string; content: string }>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        Array.from({ length: 5 }, (_, i) => ({
          id: i,
          title: `用户 ${userId} 的帖子 ${i + 1}`,
          content: `这是用户 ${userId} 发布的第 ${i + 1} 篇帖子内容...`
        }))
      )
    }, Math.random() * 1500 + 800)
  })
}

// 懒加载组件
const LazyChart = lazy(() => 
  new Promise<{ default: React.ComponentType }>((resolve) => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div style={{ 
            height: '200px', 
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            📊 动态加载的图表组件
          </div>
        )
      })
    }, 2000)
  })
)

// 使用 use Hook 的用户资料组件
function UserProfile({ userPromise }: { userPromise: Promise<any> }) {
  const user = use(userPromise)
  
  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      padding: '1.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      background: 'white'
    }}>
      <img 
        src={user.avatar} 
        alt={user.name}
        style={{ width: '80px', height: '80px', borderRadius: '50%' }}
      />
      <div>
        <h3 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>{user.name}</h3>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{user.bio}</p>
      </div>
    </div>
  )
}

// 使用 use Hook 的用户帖子组件
function UserPosts({ postsPromise }: { postsPromise: Promise<any> }) {
  const posts = use(postsPromise)
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {posts.map((post: any) => (
        <div 
          key={post.id}
          style={{ 
            padding: '1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            background: 'white'
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>{post.title}</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{post.content}</p>
        </div>
      ))}
    </div>
  )
}

// 嵌套 Suspense 示例
function NestedSuspenseExample() {
  const [userId, setUserId] = useState(1)
  
  // 创建 Promise
  const userPromise = fetchUserProfile(userId)
  const postsPromise = fetchUserPosts(userId)

  return (
    <div className="example-container">
      <h3 className="example-title">嵌套 Suspense 示例</h3>
      <p className="example-description">
        不同的数据源可以有独立的加载状态，提供更精细的用户体验
      </p>
      
      <div style={{ marginBottom: '1rem' }}>
        <label>
          选择用户: 
          <select 
            value={userId} 
            onChange={(e) => setUserId(Number(e.target.value))}
            className="input"
            style={{ marginLeft: '0.5rem', width: 'auto' }}
          >
            {[1, 2, 3, 4, 5].map(id => (
              <option key={id} value={id}>用户 {id}</option>
            ))}
          </select>
        </label>
      </div>

      {/* 🎯 关键特性：嵌套的 Suspense 边界 */}
      <Suspense fallback={
        <div className="status loading" style={{ padding: '2rem', textAlign: 'center' }}>
          加载用户资料中...
        </div>
      }>
        <UserProfile userPromise={userPromise} />
        
        <div style={{ marginTop: '1.5rem' }}>
          <h4>用户帖子</h4>
          <Suspense fallback={
            <div className="status loading" style={{ padding: '1rem', textAlign: 'center' }}>
              加载帖子中...
            </div>
          }>
            <UserPosts postsPromise={postsPromise} />
          </Suspense>
        </div>
      </Suspense>
    </div>
  )
}

// 懒加载组件示例
function LazyLoadingExample() {
  const [showChart, setShowChart] = useState(false)

  return (
    <div className="example-container">
      <h3 className="example-title">懒加载组件示例</h3>
      <p className="example-description">
        使用 React.lazy 和 Suspense 实现组件的按需加载
      </p>
      
      <button 
        onClick={() => setShowChart(!showChart)}
        className="btn"
        style={{ marginBottom: '1rem' }}
      >
        {showChart ? '隐藏图表' : '显示图表'}
      </button>
      
      {showChart && (
        <Suspense fallback={
          <div style={{ 
            height: '200px',
            border: '2px dashed #e2e8f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b'
          }}>
            <div className="status loading">加载图表组件中...</div>
          </div>
        }>
          <LazyChart />
        </Suspense>
      )}
    </div>
  )
}

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Suspense Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// 带错误处理的 Suspense 示例
function SuspenseWithErrorHandling() {
  const [userId, setUserId] = useState(1)
  const [key, setKey] = useState(0)
  
  const userPromise = fetchUserProfile(userId)

  const handleRetry = () => {
    setKey(prev => prev + 1)
  }

  return (
    <div className="example-container">
      <h3 className="example-title">Suspense 错误处理</h3>
      <p className="example-description">
        结合错误边界处理 Suspense 中的异步错误
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <label>
          用户 ID: 
          <input 
            type="number" 
            value={userId} 
            onChange={(e) => setUserId(Number(e.target.value))}
            className="input"
            style={{ marginLeft: '0.5rem', width: '100px' }}
            min="1"
            max="100"
          />
        </label>
        <button onClick={handleRetry} className="btn">
          重新加载
        </button>
      </div>

      <ErrorBoundary 
        fallback={
          <div className="status error" style={{ padding: '2rem', textAlign: 'center' }}>
            <div>❌ 加载失败</div>
            <button 
              onClick={handleRetry} 
              className="btn" 
              style={{ marginTop: '1rem' }}
            >
              重试
            </button>
          </div>
        }
      >
        <Suspense 
          key={key}
          fallback={
            <div className="status loading" style={{ padding: '2rem', textAlign: 'center' }}>
              加载用户信息中...
            </div>
          }
        >
          <UserProfile userPromise={userPromise} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

export default function SuspenseExample() {
  return (
    <div>
      <h1>Enhanced Suspense 示例</h1>
      <p className="example-description">
        React 19 增强了 Suspense 的功能，提供更好的异步数据处理和组件懒加载体验。
        配合新的 use Hook，可以实现更优雅的异步状态管理。
      </p>

      {/* 代码示例 */}
      <div className="code-example">
        <h3>核心用法</h3>
        <pre>{`// 1. 基础 Suspense 用法
<Suspense fallback={<Loading />}>
  <AsyncComponent />
</Suspense>

// 2. 嵌套 Suspense
<Suspense fallback={<PageLoading />}>
  <Header />
  <Suspense fallback={<ContentLoading />}>
    <Content />
  </Suspense>
</Suspense>

// 3. 配合 use Hook
function DataComponent({ dataPromise }) {
  const data = use(dataPromise)
  return <div>{data.content}</div>
}

// 4. 懒加载组件
const LazyComponent = lazy(() => import('./LazyComponent'))

<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>`}</pre>
      </div>

      {/* 实际示例 */}
      <NestedSuspenseExample />
      <LazyLoadingExample />
      <SuspenseWithErrorHandling />

      {/* React 19 新特性 */}
      <div className="example-container">
        <h2 className="example-title">🆕 React 19 增强功能</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>🪝 use Hook 集成</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              可以直接在组件中使用 use Hook 读取 Promise，自动触发 Suspense
            </p>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>⚡ 更好的性能</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              改进的调度算法，减少不必要的重新渲染
            </p>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>🔄 更好的错误处理</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              与错误边界的更好集成，提供更可靠的错误恢复
            </p>
          </div>
        </div>
      </div>

      {/* 最佳实践 */}
      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>粒度控制:</strong> 为不同的异步操作设置独立的 Suspense 边界</li>
          <li><strong>加载状态:</strong> 提供有意义的加载提示，避免空白页面</li>
          <li><strong>错误处理:</strong> 结合错误边界处理异步操作中的错误</li>
          <li><strong>性能优化:</strong> 合理使用懒加载，避免初始包过大</li>
          <li><strong>用户体验:</strong> 考虑骨架屏等更好的加载体验</li>
          <li><strong>缓存策略:</strong> 配合数据缓存减少重复请求</li>
        </ul>
      </div>

      {/* 使用场景 */}
      <div className="example-container">
        <h2 className="example-title">🎯 适用场景</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#10b981' }}>✅ 适合使用</h4>
            <ul style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              <li>异步数据获取</li>
              <li>代码分割和懒加载</li>
              <li>图片和媒体资源加载</li>
              <li>第三方组件加载</li>
              <li>路由级别的懒加载</li>
            </ul>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#ef4444' }}>❌ 不适合使用</h4>
            <ul style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              <li>同步数据处理</li>
              <li>简单的状态更新</li>
              <li>事件处理函数</li>
              <li>CSS 样式加载</li>
              <li>非关键的 UI 更新</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 注意事项 */}
      <div className="example-container">
        <h2 className="example-title">⚠️ 注意事项</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li>Suspense 只能捕获子组件中的异步操作</li>
          <li>需要配合错误边界处理异步错误</li>
          <li>避免在 Suspense 边界内进行副作用操作</li>
          <li>考虑服务端渲染的兼容性</li>
          <li>合理设置 fallback 组件，避免布局跳动</li>
        </ul>
      </div>
    </div>
  )
}