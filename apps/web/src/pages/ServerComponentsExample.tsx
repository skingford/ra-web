export default function ServerComponentsExample() {
  return (
    <div>
      <h1>Server Components 示例</h1>
      <p className="example-description">
        React 19 对服务端组件提供了更好的支持。由于这是客户端应用，
        这里展示服务端组件的概念和最佳实践。
      </p>

      <div className="code-example">
        <h3>服务端组件示例</h3>
        <pre>{`// 服务端组件 (在服务器上运行)
async function ServerComponent() {
  // 可以直接在组件中进行数据获取
  const data = await fetch('https://api.example.com/data')
  const posts = await data.json()
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  )
}

// 客户端组件 (在浏览器中运行)
'use client'
function ClientComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}`}</pre>
      </div>

      <div className="example-container">
        <h2 className="example-title">🎯 服务端组件优势</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#10b981' }}>⚡ 性能优势</h4>
            <ul style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              <li>减少客户端 JavaScript 包大小</li>
              <li>服务器端数据获取更快</li>
              <li>更好的首屏加载性能</li>
            </ul>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>🔒 安全性</h4>
            <ul style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              <li>敏感数据不暴露给客户端</li>
              <li>API 密钥安全存储</li>
              <li>服务器端验证</li>
            </ul>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#8b5cf6' }}>🎯 SEO 友好</h4>
            <ul style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              <li>服务器端渲染内容</li>
              <li>更好的搜索引擎索引</li>
              <li>社交媒体分享优化</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>组件分离:</strong> 明确区分服务端和客户端组件</li>
          <li><strong>数据获取:</strong> 在服务端组件中进行数据获取</li>
          <li><strong>交互逻辑:</strong> 将交互逻辑放在客户端组件中</li>
          <li><strong>边界清晰:</strong> 使用 'use client' 指令标记客户端组件</li>
          <li><strong>性能考虑:</strong> 避免不必要的客户端 JavaScript</li>
        </ul>
      </div>

      <div className="example-container">
        <h2 className="example-title">⚠️ 注意事项</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li>服务端组件不能使用浏览器 API</li>
          <li>不能使用状态和事件处理器</li>
          <li>需要支持服务端组件的框架 (如 Next.js)</li>
          <li>客户端组件不能导入服务端组件</li>
        </ul>
      </div>
    </div>
  )
}