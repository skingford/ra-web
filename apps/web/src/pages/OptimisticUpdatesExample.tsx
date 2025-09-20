import { useOptimistic, useState, useTransition } from 'react'

// 模拟数据类型
interface Todo {
  id: number
  text: string
  completed: boolean
  pending?: boolean
}

interface Message {
  id: number
  text: string
  timestamp: Date
  pending?: boolean
}

// 模拟 API 调用
const addTodoAPI = async (text: string): Promise<Todo> => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 模拟随机失败
  if (Math.random() < 0.2) {
    throw new Error('添加待办事项失败')
  }
  
  return {
    id: Date.now(),
    text,
    completed: false
  }
}

const toggleTodoAPI = async (_id: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  if (Math.random() < 0.15) {
    throw new Error('更新待办事项失败')
  }
}

const sendMessageAPI = async (text: string): Promise<Message> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (Math.random() < 0.1) {
    throw new Error('发送消息失败')
  }
  
  return {
    id: Date.now(),
    text,
    timestamp: new Date()
  }
}

// 乐观更新的待办事项列表
function OptimisticTodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: '学习 React 19', completed: false },
    { id: 2, text: '实现乐观更新', completed: true },
    { id: 3, text: '编写示例代码', completed: false }
  ])
  
  // 🎯 关键特性：useOptimistic 管理乐观状态
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: Todo) => [...state, newTodo]
  )
  
  const [optimisticToggleTodos, toggleOptimisticTodo] = useOptimistic(
    optimisticTodos,
    (state, { id, completed }: { id: number; completed: boolean }) =>
      state.map(todo => 
        todo.id === id ? { ...todo, completed, pending: true } : todo
      )
  )
  
  const [isPending, startTransition] = useTransition()
  const [newTodoText, setNewTodoText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleAddTodo = async () => {
    if (!newTodoText.trim()) return
    
    const optimisticTodo: Todo = {
      id: Date.now(),
      text: newTodoText,
      completed: false,
      pending: true
    }
    
    setNewTodoText('')
    setError(null)
    
    startTransition(async () => {
      // 🎯 立即显示乐观更新
      addOptimisticTodo(optimisticTodo)
      
      try {
        const newTodo = await addTodoAPI(newTodoText)
        setTodos(prev => [...prev, newTodo])
      } catch (err) {
        setError(err instanceof Error ? err.message : '添加失败')
        // 乐观更新会自动回滚
      }
    })
  }

  const handleToggleTodo = (id: number, completed: boolean) => {
    setError(null)
    
    startTransition(async () => {
      // 🎯 立即显示乐观更新
      toggleOptimisticTodo({ id, completed: !completed })
      
      try {
        await toggleTodoAPI(id)
        setTodos(prev => 
          prev.map(todo => 
            todo.id === id ? { ...todo, completed: !completed } : todo
          )
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : '更新失败')
        // 乐观更新会自动回滚
      }
    })
  }

  return (
    <div className="example-container">
      <h3 className="example-title">乐观更新待办事项</h3>
      <p className="example-description">
        添加和切换待办事项时立即显示更新，提供流畅的用户体验
      </p>
      
      {/* 添加新待办事项 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="输入新的待办事项..."
          className="input"
          style={{ flex: 1 }}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
        />
        <button 
          onClick={handleAddTodo}
          disabled={isPending || !newTodoText.trim()}
          className="btn"
        >
          添加
        </button>
      </div>
      
      {/* 错误显示 */}
      {error && (
        <div className="status error" style={{ marginBottom: '1rem' }}>
          ❌ {error}
        </div>
      )}
      
      {/* 待办事项列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {optimisticToggleTodos.map((todo) => (
          <div 
            key={todo.id}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              opacity: todo.pending ? 0.6 : 1,
              background: todo.pending ? '#f8fafc' : 'white'
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo.id, todo.completed)}
              disabled={todo.pending}
            />
            <span 
              style={{ 
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#64748b' : '#1e293b'
              }}
            >
              {todo.text}
            </span>
            {todo.pending && (
              <span className="status loading" style={{ fontSize: '0.625rem' }}>
                处理中
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 乐观更新的消息发送
function OptimisticMessageSender() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '欢迎使用乐观更新示例！', timestamp: new Date(Date.now() - 60000) },
    { id: 2, text: '发送消息时会立即显示', timestamp: new Date(Date.now() - 30000) }
  ])
  
  // 🎯 关键特性：useOptimistic 用于消息列表
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  )
  
  const [isPending, startTransition] = useTransition()
  const [messageText, setMessageText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    
    const optimisticMessage: Message = {
      id: Date.now(),
      text: messageText,
      timestamp: new Date(),
      pending: true
    }
    
    setMessageText('')
    setError(null)
    
    startTransition(async () => {
      // 🎯 立即显示乐观更新
      addOptimisticMessage(optimisticMessage)
      
      try {
        const newMessage = await sendMessageAPI(messageText)
        setMessages(prev => [...prev, newMessage])
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送失败')
        // 乐观更新会自动回滚
      }
    })
  }

  return (
    <div className="example-container">
      <h3 className="example-title">乐观更新消息发送</h3>
      <p className="example-description">
        发送消息时立即显示在列表中，网络请求完成后确认或回滚
      </p>
      
      {/* 消息列表 */}
      <div 
        style={{ 
          height: '200px', 
          overflowY: 'auto', 
          border: '1px solid #e2e8f0', 
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1rem',
          background: '#fafafa'
        }}
      >
        {optimisticMessages.map((message) => (
          <div 
            key={message.id}
            style={{ 
              marginBottom: '0.75rem',
              padding: '0.5rem',
              background: message.pending ? '#fef3c7' : 'white',
              borderRadius: '4px',
              border: message.pending ? '1px dashed #f59e0b' : '1px solid #e2e8f0'
            }}
          >
            <div style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
              {message.text}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
              <span>{message.timestamp.toLocaleTimeString()}</span>
              {message.pending && (
                <span className="status loading" style={{ fontSize: '0.625rem' }}>
                  发送中
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* 错误显示 */}
      {error && (
        <div className="status error" style={{ marginBottom: '1rem' }}>
          ❌ {error}
        </div>
      )}
      
      {/* 消息输入 */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="输入消息..."
          className="input"
          style={{ flex: 1 }}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          onClick={handleSendMessage}
          disabled={isPending || !messageText.trim()}
          className="btn"
        >
          发送
        </button>
      </div>
    </div>
  )
}

export default function OptimisticUpdatesExample() {
  return (
    <div>
      <h1>Optimistic Updates 示例</h1>
      <p className="example-description">
        乐观更新允许在网络请求完成之前立即显示预期的结果，
        提供更流畅的用户体验。如果请求失败，UI 会自动回滚到之前的状态。
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
        }}>{`// 1. 基础乐观更新
const [optimisticState, addOptimistic] = useOptimistic(
  currentState,
  (state, optimisticValue) => {
    // 返回新的乐观状态
    return [...state, optimisticValue]
  }
)

// 2. 配合 useTransition 使用
const [isPending, startTransition] = useTransition()

startTransition(async () => {
  // 立即应用乐观更新
  addOptimistic(newValue)
  
  try {
    // 执行实际的网络请求
    await api.update(newValue)
    // 更新真实状态
    setState(newState)
  } catch (error) {
    // 乐观更新自动回滚
    handleError(error)
  }
})`}</pre>
      </div>

      {/* 实际示例 */}
      <OptimisticTodoList />
      <OptimisticMessageSender />

      {/* 最佳实践 */}
      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>视觉反馈:</strong> 为乐观更新的项目提供视觉指示（如透明度、边框）</li>
          <li><strong>错误处理:</strong> 提供清晰的错误信息和重试机制</li>
          <li><strong>状态管理:</strong> 配合 useTransition 管理过渡状态</li>
          <li><strong>回滚策略:</strong> 确保失败时能正确回滚到之前状态</li>
          <li><strong>用户体验:</strong> 避免频繁的状态变化造成界面闪烁</li>
          <li><strong>数据一致性:</strong> 确保乐观更新与服务端数据保持一致</li>
        </ul>
      </div>

      {/* 适用场景 */}
      <div className="example-container">
        <h2 className="example-title">🎯 适用场景</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#10b981' }}>✅ 适合使用</h4>
            <ul style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              <li>点赞、收藏等简单操作</li>
              <li>添加评论或消息</li>
              <li>切换开关状态</li>
              <li>简单的 CRUD 操作</li>
              <li>用户交互频繁的场景</li>
            </ul>
          </div>
          
          <div style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 0.5rem', color: '#ef4444' }}>❌ 不适合使用</h4>
            <ul style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
              <li>支付等关键操作</li>
              <li>复杂的数据验证</li>
              <li>需要服务端确认的操作</li>
              <li>涉及多个系统的操作</li>
              <li>不可逆的重要操作</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 注意事项 */}
      <div className="example-container">
        <h2 className="example-title">⚠️ 注意事项</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li>乐观更新只是 UI 层面的优化，不能替代错误处理</li>
          <li>需要考虑网络失败时的用户体验</li>
          <li>避免在关键业务操作中使用乐观更新</li>
          <li>确保乐观更新的逻辑与服务端逻辑一致</li>
          <li>考虑并发操作可能带来的状态冲突</li>
        </ul>
      </div>
    </div>
  )
}