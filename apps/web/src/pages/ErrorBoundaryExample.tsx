import React, { useState } from 'react'

// 错误边界类组件
class ClassErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="status error" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>❌ 出现错误</h3>
          <p>{this.state.error?.message}</p>
          <button 
            className="btn" 
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 会抛出错误的组件
function BuggyComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('这是一个模拟的组件错误！')
  }
  
  return (
    <div className="example-container">
      <h4>✅ 组件正常运行</h4>
      <p>这个组件现在工作正常，没有错误。</p>
    </div>
  )
}

// 模拟错误的组件
function ComponentWithErrorBoundary() {
  const [count, setCount] = useState(0)
  const [shouldError, setShouldError] = useState(false)

  const handleError = () => {
    // 模拟一个错误
    if (Math.random() < 0.5) {
      setShouldError(true)
    } else {
      setCount(prev => prev + 1)
    }
  }

  if (shouldError) {
    throw new Error('随机错误发生了！')
  }

  return (
    <div className="example-container">
      <h4>错误边界测试组件</h4>
      <p>计数: {count}</p>
      <button onClick={handleError} className="btn">
        随机操作 (可能出错)
      </button>
    </div>
  )
}

export default function ErrorBoundaryExample() {
  const [triggerError, setTriggerError] = useState(false)

  return (
    <div>
      <h1>Error Boundary 示例</h1>
      <p className="example-description">
        React 19 改进了错误边界的功能，提供更好的错误处理和恢复机制。
      </p>

      <div className="code-example">
        <h3>核心用法</h3>
        <pre>{`// 1. 类组件错误边界
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}

// 2. 组件内错误处理
function Component() {
  const [shouldError, setShouldError] = useState(false)
  
  const handleError = () => {
    // 触发错误，让错误边界捕获
    setShouldError(true)
  }
  
  if (shouldError) {
    throw new Error('组件错误')
  }
}`}</pre>
      </div>

      <div className="example-container">
        <h2 className="example-title">基础错误边界示例</h2>
        <button 
          onClick={() => setTriggerError(!triggerError)}
          className="btn"
          style={{ marginBottom: '1rem' }}
        >
          {triggerError ? '修复错误' : '触发错误'}
        </button>

        <ClassErrorBoundary>
          <BuggyComponent shouldError={triggerError} />
        </ClassErrorBoundary>
      </div>

      <ClassErrorBoundary 
        fallback={
          <div className="status error" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3>❌ 组件错误</h3>
            <p>组件中抛出的错误被错误边界捕获</p>
          </div>
        }
      >
        <ComponentWithErrorBoundary />
      </ClassErrorBoundary>

      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>粒度控制:</strong> 在适当的层级设置错误边界</li>
          <li><strong>用户友好:</strong> 提供有意义的错误信息和恢复选项</li>
          <li><strong>错误上报:</strong> 将错误信息发送到监控系统</li>
          <li><strong>降级处理:</strong> 提供备用的 UI 组件</li>
        </ul>
      </div>
    </div>
  )
}