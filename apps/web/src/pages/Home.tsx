export default function Home() {
  return (
    <div>
      <h1>React 19 API 示例集合</h1>
      <p className="example-description">
        欢迎来到 React 19 API 示例集合！这里包含了 React 19 中所有主要新特性的完整使用示例。
        每个示例都包含详细的代码说明、实际应用场景和最佳实践。
      </p>

      <div className="example-container">
        <h2 className="example-title">🎯 主要特性概览</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>🪝 use Hook</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              全新的 use Hook，用于读取 Promise 和 Context，简化异步数据处理
            </p>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>⚡ Actions</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              表单 Actions 和自动状态管理，简化表单提交和错误处理
            </p>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>🚀 Optimistic Updates</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              乐观更新机制，提供更流畅的用户体验
            </p>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>🔄 Transitions</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              增强的过渡状态管理，更好的用户交互体验
            </p>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>🖥️ Server Components</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              服务端组件支持，提升性能和 SEO
            </p>
          </div>

          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 0.5rem', color: '#3b82f6' }}>⏳ Enhanced Suspense</h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              增强的 Suspense，更好的加载状态管理
            </p>
          </div>
        </div>
      </div>

      <div className="example-container">
        <h2 className="example-title">📚 如何使用这些示例</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li>点击左侧导航栏选择要查看的 API 示例</li>
          <li>每个示例页面包含完整的代码实现和详细说明</li>
          <li>代码示例都可以直接复制使用</li>
          <li>注释说明了关键概念和最佳实践</li>
          <li>包含实际应用场景和常见问题解决方案</li>
        </ul>
      </div>

      <div className="example-container">
        <h2 className="example-title">🔧 技术栈</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <span className="status success">React 19.1.1</span>
          <span className="status success">TypeScript</span>
          <span className="status success">Vite</span>
          <span className="status success">React Router</span>
        </div>
      </div>
    </div>
  )
}