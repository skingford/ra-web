import { Button, Card } from '@ra-web/ui'
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="admin-app">
      <Card title="RA Web 管理后台" className="main-card">
        <div className="admin-content">
          <h1>欢迎使用管理后台</h1>
          <p>这是一个使用共享 UI 组件的管理界面示例</p>
          
          <div className="counter-section">
            <p>计数器: {count}</p>
            <div className="button-group">
              <Button 
                variant="primary" 
                onClick={() => setCount(count + 1)}
              >
                增加
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setCount(count - 1)}
              >
                减少
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setCount(0)}
              >
                重置
              </Button>
            </div>
          </div>
          
          <Card title="功能列表" className="feature-card">
            <ul>
              <li>用户管理</li>
              <li>系统设置</li>
              <li>数据分析</li>
              <li>内容管理</li>
            </ul>
          </Card>
        </div>
      </Card>
    </div>
  )
}

export default App
