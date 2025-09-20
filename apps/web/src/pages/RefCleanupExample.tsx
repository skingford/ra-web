import { useState } from 'react'

// 使用 ref 清理函数的示例
function RefCleanupExample() {
  const [isVisible, setIsVisible] = useState(true)

  return (
    <div>
      <h1>Ref Cleanup 示例</h1>
      <p className="example-description">
        React 19 允许 ref 回调函数返回清理函数，简化资源管理。
      </p>

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
        }}>{`// React 19 新特性：ref 清理函数
const ref = useRef((node) => {
  if (node) {
    // 设置逻辑
    const observer = new IntersectionObserver(callback)
    observer.observe(node)
    
    // 返回清理函数
    return () => {
      observer.disconnect()
    }
  }
})`}</pre>
      </div>

      <div className="example-container">
        <h2 className="example-title">基础示例</h2>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="btn"
          style={{ marginBottom: '1rem' }}
        >
          {isVisible ? '隐藏组件' : '显示组件'}
        </button>

        {isVisible && (
          <div 
            ref={(node) => {
              if (node) {
                console.log('元素挂载:', node)
                node.style.background = '#f0f9ff'
                
                // 返回清理函数
                return () => {
                  console.log('元素卸载清理')
                }
              }
            }}
            style={{ padding: '1rem', border: '1px solid #3b82f6', borderRadius: '6px' }}
          >
            这个元素有 ref 清理函数
          </div>
        )}
      </div>

      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>资源清理:</strong> 清理事件监听器、定时器等</li>
          <li><strong>观察器清理:</strong> 断开 IntersectionObserver、MutationObserver</li>
          <li><strong>动画清理:</strong> 取消进行中的动画</li>
          <li><strong>网络请求:</strong> 取消未完成的请求</li>
        </ul>
      </div>
    </div>
  )
}

export default RefCleanupExample