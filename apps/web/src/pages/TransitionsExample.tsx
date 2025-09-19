import { useTransition, useState, useDeferredValue } from 'react'

// 模拟大量数据
const generateLargeDataset = (filter: string) => {
  const items = []
  for (let i = 0; i < 10000; i++) {
    const item = {
      id: i,
      name: `项目 ${i}`,
      category: ['技术', '设计', '产品', '市场'][i % 4],
      description: `这是第 ${i} 个项目的详细描述`
    }
    if (!filter || item.name.includes(filter) || item.category.includes(filter)) {
      items.push(item)
    }
  }
  return items
}

// 模拟 API 调用
const fetchData = async (query: string): Promise<any[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  return Array.from({ length: 100 }, (_, i) => ({
    id: i,
    title: `${query} 结果 ${i + 1}`,
    content: `这是关于 "${query}" 的搜索结果内容 ${i + 1}`
  }))
}

// 基础 useTransition 示例
function BasicTransitionExample() {
  const [isPending, startTransition] = useTransition()
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<string[]>([])

  const handleSlowUpdate = () => {
    startTransition(() => {
      // 🎯 关键特性：将耗时操作包装在 transition 中
      // 这样不会阻塞其他紧急更新
      const newItems = Array.from({ length: 5000 }, (_, i) => `项目 ${count}-${i}`)
      setItems(newItems)
      setCount(prev => prev + 1)
    })
  }

  const handleUrgentUpdate = () => {
    // 紧急更新不使用 transition，会立即执行
    setCount(prev => prev + 1)
  }

  return (
    <div className="example-container">
      <h3 className="example-title">基础 Transition 示例</h3>
      <p className="example-description">
        使用 useTransition 将耗时的状态更新标记为非紧急，避免阻塞用户交互
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={handleUrgentUpdate} className="btn">
          紧急更新 (立即执行)
        </button>
        <button 
          onClick={handleSlowUpdate} 
          className="btn"
          disabled={isPending}
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? '处理中...' : '慢速更新 (Transition)'}
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>当前计数: {count}</strong>
        {isPending && <span className="status loading" style={{ marginLeft: '1rem' }}>更新中</span>}
      </div>
      
      <div style={{ 
        height: '200px', 
        overflowY: 'auto', 
        border: '1px solid #e2e8f0', 
        borderRadius: '6px',
        padding: '1rem',
        background: '#fafafa'
      }}>
        <p>生成的项目数量: {items.length}</p>
        {items.slice(0, 10).map((item, index) => (
          <div key={index} style={{ padding: '0.25rem 0', fontSize: '0.875rem' }}>
            {item}
          </div>
        ))}
        {items.length > 10 && <p>... 还有 {items.length - 10} 个项目</p>}
      </div>
    </div>
  )
}

// 搜索过滤示例（配合 useDeferredValue）
function SearchFilterExample() {
  const [query, setQuery] = useState('')
  
  // 🎯 关键特性：useDeferredValue 延迟更新值
  const deferredQuery = useDeferredValue(query)
  
  // 基于延迟的查询值生成数据
  const filteredData = generateLargeDataset(deferredQuery)

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery)
    // 可以选择性地使用 transition 来处理过滤逻辑
    // 这里我们让 useDeferredValue 自动处理延迟
  }

  return (
    <div className="example-container">
      <h3 className="example-title">搜索过滤示例</h3>
      <p className="example-description">
        使用 useDeferredValue 延迟处理搜索查询，保持输入响应性
      </p>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="搜索项目..."
          className="input"
          style={{ width: '100%', maxWidth: '400px' }}
        />
        {query !== deferredQuery && (
          <div className="status loading" style={{ marginTop: '0.5rem' }}>
            搜索中...
          </div>
        )}
      </div>
      
      <div style={{ 
        height: '300px', 
        overflowY: 'auto', 
        border: '1px solid #e2e8f0', 
        borderRadius: '6px',
        padding: '1rem',
        background: '#fafafa'
      }}>
        <p><strong>找到 {filteredData.length} 个结果</strong></p>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
          当前查询: "{deferredQuery}" {query !== deferredQuery && `(输入: "${query}")`}
        </p>
        
        {filteredData.slice(0, 50).map((item) => (
          <div 
            key={item.id} 
            style={{ 
              padding: '0.75rem', 
              marginBottom: '0.5rem',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              background: 'white'
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {item.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {item.category} - {item.description}
            </div>
          </div>
        ))}
        
        {filteredData.length > 50 && (
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            ... 还有 {filteredData.length - 50} 个结果
          </p>
        )}
      </div>
    </div>
  )
}

// 异步数据加载示例
function AsyncDataExample() {
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setError(null)
    
    startTransition(async () => {
      try {
        const results = await fetchData(searchQuery)
        setData(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : '搜索失败')
      }
    })
  }

  return (
    <div className="example-container">
      <h3 className="example-title">异步数据加载示例</h3>
      <p className="example-description">
        使用 startTransition 处理异步数据加载，保持界面响应性
      </p>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入搜索关键词..."
          className="input"
          style={{ flex: 1 }}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
        />
        <button 
          onClick={() => handleSearch(query)}
          disabled={isPending || !query.trim()}
          className="btn"
        >
          {isPending ? '搜索中...' : '搜索'}
        </button>
      </div>
      
      {error && (
        <div className="status error" style={{ marginBottom: '1rem' }}>
          ❌ {error}
        </div>
      )}
      
      <div style={{ 
        height: '300px', 
        overflowY: 'auto', 
        border: '1px solid #e2e8f0', 
        borderRadius: '6px',
        padding: '1rem',
        background: '#fafafa',
        opacity: isPending ? 0.6 : 1
      }}>
        {data.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            {isPending ? '搜索中...' : '输入关键词开始搜索'}
          </p>
        ) : (
          <>
            <p><strong>搜索结果 ({data.length} 条)</strong></p>
            {data.map((item) => (
              <div 
                key={item.id}
                style={{ 
                  padding: '1rem', 
                  marginBottom: '0.5rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  background: 'white'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem', color: '#1e293b' }}>
                  {item.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                  {item.content}
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export default function TransitionsExample() {
  return (
    <div>
      <h1>Transitions 示例</h1>
      <p className="example-description">
        React 19 的 Transitions 功能允许你将状态更新标记为非紧急，
        确保用户交互始终保持响应性。配合 useDeferredValue 可以实现更流畅的用户体验。
      </p>

      {/* 代码示例 */}
      <div className="code-example">
        <h3>核心 API</h3>
        <pre>{`// 1. useTransition - 管理过渡状态
const [isPending, startTransition] = useTransition()

startTransition(() => {
  // 非紧急的状态更新
  setLargeData(newData)
})

// 2. useDeferredValue - 延迟值更新
const deferredValue = useDeferredValue(value)

// 3. 全局 startTransition
import { startTransition } from 'react'

startTransition(() => {
  // 可以在组件外使用
  updateGlobalState(newState)
})`}</pre>
      </div>

      {/* 实际示例 */}
      <BasicTransitionExample />
      <SearchFilterExample />
      <AsyncDataExample />

      {/* 性能对比 */}
      <div className="example-container">
        <h2 className="example-title">⚡ 性能对比</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <h4 style={{ color: '#ef4444' }}>❌ 不使用 Transition</h4>
            <ul style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              <li>大量数据更新会阻塞 UI</li>
              <li>用户输入可能出现延迟</li>
              <li>界面可能出现卡顿</li>
              <li>所有更新都是同等优先级</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ color: '#10b981' }}>✅ 使用 Transition</h4>
            <ul style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              <li>用户交互始终保持响应</li>
              <li>非紧急更新不会阻塞界面</li>
              <li>提供加载状态反馈</li>
              <li>智能的优先级管理</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 最佳实践 */}
      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>识别非紧急更新:</strong> 将大量数据处理、搜索过滤等操作包装在 transition 中</li>
          <li><strong>保持响应性:</strong> 确保用户输入和点击等交互不被阻塞</li>
          <li><strong>提供反馈:</strong> 使用 isPending 状态给用户适当的加载提示</li>
          <li><strong>合理使用 useDeferredValue:</strong> 对于频繁变化的值使用延迟更新</li>
          <li><strong>避免过度使用:</strong> 不是所有状态更新都需要 transition</li>
          <li><strong>测试性能:</strong> 在实际设备上测试 transition 的效果</li>
        </ul>
      </div>

      {/* 使用场景 */}
      <div className="example-container">
        <h2 className="example-title">🎯 适用场景</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>搜索和过滤</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              大量数据的实时搜索和过滤操作
            </p>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>数据可视化</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              图表和图形的重新渲染
            </p>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>路由切换</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              页面间的导航和内容加载
            </p>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>表单处理</h4>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              复杂表单的验证和提交
            </p>
          </div>
        </div>
      </div>

      {/* 注意事项 */}
      <div className="example-container">
        <h2 className="example-title">⚠️ 注意事项</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li>Transition 中的更新可能被中断，确保代码能处理这种情况</li>
          <li>不要在 transition 中执行副作用操作</li>
          <li>useDeferredValue 只在值实际变化时才会延迟</li>
          <li>过度使用可能导致界面更新延迟</li>
          <li>需要考虑 SEO 和服务端渲染的影响</li>
        </ul>
      </div>
    </div>
  )
}