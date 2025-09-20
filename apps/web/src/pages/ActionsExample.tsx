import { useActionState, useTransition } from 'react'

// 模拟 API 调用
const submitUserData = async (formData: FormData): Promise<{ success: boolean; message: string; data?: any }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  
  // 模拟验证失败
  if (!name || name.length < 2) {
    throw new Error('姓名至少需要2个字符')
  }
  
  if (!email || !email.includes('@')) {
    throw new Error('请输入有效的邮箱地址')
  }
  
  // 模拟随机失败
  if (Math.random() < 0.3) {
    throw new Error('服务器错误，请稍后重试')
  }
  
  return {
    success: true,
    message: '用户信息提交成功！',
    data: { name, email, id: Date.now() }
  }
}

// 提交按钮组件（使用 props 传递状态）
function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button 
      type="submit" 
      className="btn" 
      disabled={pending}
      style={{ 
        opacity: pending ? 0.6 : 1,
        cursor: pending ? 'not-allowed' : 'pointer'
      }}
    >
      {pending ? '提交中...' : '提交'}
    </button>
  )
}

// 基础 Action 表单示例
function BasicActionForm() {
  const [isPending, startTransition] = useTransition()
  
  // 🎯 关键特性：useActionState 管理 Action 状态
  const [state, formAction] = useActionState(
    async (_prevState: any, formData: FormData) => {
      try {
        const result = await submitUserData(formData)
        return { 
          success: true, 
          message: result.message,
          data: result.data,
          error: '' 
        }
      } catch (error) {
        return { 
          success: false, 
          message: '',
          data: null,
          error: error instanceof Error ? error.message : '未知错误' 
        }
      }
    },
    { success: false, message: '', data: null, error: '' }
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="example-container">
      <h3 className="example-title">基础 Action 表单</h3>
      <p className="example-description">
        使用 useActionState 和 useTransition 实现自动状态管理的表单
      </p>
      
      <form 
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}
      >
        <div>
          <label htmlFor="name">姓名:</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            className="input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email">邮箱:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            className="input"
            required
          />
        </div>
        
        <SubmitButton pending={isPending} />
      </form>
      
      {/* 状态显示 */}
      {state.error && (
        <div className="status error" style={{ marginTop: '1rem' }}>
          ❌ {state.error}
        </div>
      )}
      
      {state.success && state.message && (
        <div className="status success" style={{ marginTop: '1rem' }}>
          ✅ {state.message}
        </div>
      )}
      
      {state.data && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '6px' }}>
          <h4>提交的数据:</h4>
          <pre>{JSON.stringify(state.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

// 定义状态类型
interface FormState {
  success: boolean
  message: string
  data: any
  error: string
  fieldErrors: {
    name?: string
    email?: string
    age?: string
  }
}

// 高级 Action 示例：带有客户端验证
function AdvancedActionForm() {
  const [isPending, startTransition] = useTransition()
  
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_prevState: FormState, formData: FormData): Promise<FormState> => {
      // 客户端验证
      const errors: { name?: string; email?: string; age?: string } = {}
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const age = formData.get('age') as string
      
      if (!name || name.length < 2) {
        errors.name = '姓名至少需要2个字符'
      }
      
      if (!email || !email.includes('@')) {
        errors.email = '请输入有效的邮箱地址'
      }
      
      if (!age || isNaN(Number(age)) || Number(age) < 18) {
        errors.age = '年龄必须是18岁以上的数字'
      }
      
      if (Object.keys(errors).length > 0) {
        return { 
          success: false, 
          message: '',
          data: null,
          error: '',
          fieldErrors: errors
        }
      }
      
      try {
        const result = await submitUserData(formData)
        return { 
          success: true, 
          message: result.message,
          data: { ...result.data, age: Number(age) },
          error: '',
          fieldErrors: {}
        }
      } catch (error) {
        return { 
          success: false, 
          message: '',
          data: null,
          error: error instanceof Error ? error.message : '未知错误',
          fieldErrors: {}
        }
      }
    },
    { success: false, message: '', data: null, error: '', fieldErrors: {} }
  )

  const handleAdvancedSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <div className="example-container">
      <h3 className="example-title">高级 Action 表单</h3>
      <p className="example-description">
        包含客户端验证、字段级错误处理和更复杂的状态管理
      </p>
      
      <form 
        onSubmit={handleAdvancedSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}
      >
        <div>
          <label htmlFor="adv-name">姓名:</label>
          <input 
            type="text" 
            id="adv-name" 
            name="name" 
            className="input"
            style={{ borderColor: state.fieldErrors.name ? '#ef4444' : undefined }}
          />
          {state.fieldErrors.name && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {state.fieldErrors.name}
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="adv-email">邮箱:</label>
          <input 
            type="email" 
            id="adv-email" 
            name="email" 
            className="input"
            style={{ borderColor: state.fieldErrors.email ? '#ef4444' : undefined }}
          />
          {state.fieldErrors.email && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {state.fieldErrors.email}
            </div>
          )}
        </div>
        
        <div>
          <label htmlFor="adv-age">年龄:</label>
          <input 
            type="number" 
            id="adv-age" 
            name="age" 
            className="input"
            style={{ borderColor: state.fieldErrors.age ? '#ef4444' : undefined }}
          />
          {state.fieldErrors.age && (
            <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {state.fieldErrors.age}
            </div>
          )}
        </div>
        
        <SubmitButton pending={isPending} />
      </form>
      
      {/* 状态显示 */}
      {state.error && (
        <div className="status error" style={{ marginTop: '1rem' }}>
          ❌ {state.error}
        </div>
      )}
      
      {state.success && state.message && (
        <div className="status success" style={{ marginTop: '1rem' }}>
          ✅ {state.message}
        </div>
      )}
      
      {state.data && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '6px' }}>
          <h4>提交的数据:</h4>
          <pre>{JSON.stringify(state.data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default function ActionsExample() {
  return (
    <div>
      <h1>Actions 示例</h1>
      <p className="example-description">
        React 19 的 Actions 功能提供了声明式的表单处理方式，
        自动管理提交状态、错误处理和用户反馈，大大简化了表单开发。
      </p>

      {/* 代码示例 */}
      <div className="code-example">
        <h3>核心 API</h3>
        <pre style={{ 
          background: '#1e293b', 
          color: '#e2e8f0', 
          padding: '1.5rem', 
          borderRadius: '8px',
          fontSize: '0.875rem',
          lineHeight: '1.5',
          overflow: 'auto'
        }}>{`// 1. useActionState - 管理 Action 状态
const [state, formAction] = useActionState(actionFn, initialState)

// 2. useTransition - 管理提交状态
const [isPending, startTransition] = useTransition()

// 3. 表单 Action 函数
async function submitAction(prevState, formData) {
  try {
    const result = await api.submit(formData)
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// 4. 处理表单提交
const handleSubmit = (formData) => {
  startTransition(() => {
    formAction(formData)
  })
}`}</pre>
      </div>

      {/* 实际示例 */}
      <BasicActionForm />
      <AdvancedActionForm />

      {/* 最佳实践 */}
      <div className="example-container">
        <h2 className="example-title">🎯 最佳实践</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li><strong>状态管理:</strong> 使用 useActionState 统一管理表单状态</li>
          <li><strong>用户反馈:</strong> 利用 useTransition 提供实时的提交状态</li>
          <li><strong>错误处理:</strong> 区分客户端验证和服务端错误</li>
          <li><strong>字段验证:</strong> 提供字段级别的错误信息</li>
          <li><strong>无障碍性:</strong> 确保错误信息与表单字段正确关联</li>
          <li><strong>渐进增强:</strong> 即使 JavaScript 禁用也能正常工作</li>
        </ul>
      </div>

      {/* 与传统方式对比 */}
      <div className="example-container">
        <h2 className="example-title">🔄 与传统方式对比</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <h4 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>传统方式</h4>
            <pre style={{ 
              fontSize: '0.8rem', 
              background: '#1e293b', 
              color: '#e2e8f0',
              padding: '1.25rem', 
              borderRadius: '8px',
              lineHeight: '1.4',
              overflow: 'auto',
              border: '2px solid #ef4444',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>{`const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [data, setData] = useState(null)

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  
  try {
    const result = await api.submit(formData)
    setData(result)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}`}</pre>
          </div>
          
          <div>
            <h4 style={{ color: '#10b981', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>React 19 Actions</h4>
            <pre style={{ 
              fontSize: '0.8rem', 
              background: '#1e293b', 
              color: '#e2e8f0',
              padding: '1.25rem', 
              borderRadius: '8px',
              lineHeight: '1.4',
              overflow: 'auto',
              border: '2px solid #10b981',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>{`const [isPending, startTransition] = useTransition()
const [state, formAction] = useActionState(
  async (prevState, formData) => {
    try {
      const result = await api.submit(formData)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
  { success: false, data: null, error: null }
)

const handleSubmit = (formData) => {
  startTransition(() => formAction(formData))
}

// 在 JSX 中
<form action={handleSubmit}>
  {/* 表单字段 */}
  <button disabled={isPending}>
    {isPending ? '提交中...' : '提交'}
  </button>
</form>`}</pre>
          </div>
        </div>
      </div>

      {/* 注意事项 */}
      <div className="example-container">
        <h2 className="example-title">⚠️ 注意事项</h2>
        <ul style={{ lineHeight: '1.6', color: '#64748b' }}>
          <li>使用 useTransition 管理异步表单提交状态</li>
          <li>Action 函数应该是纯函数，避免副作用</li>
          <li>表单数据通过 FormData API 传递</li>
          <li>需要考虑服务端渲染的兼容性</li>
          <li>错误边界可以捕获 Action 中的未处理错误</li>
        </ul>
      </div>
    </div>
  )
}