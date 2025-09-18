# 自动引入配置示例

## 🎯 常用配置

### React 项目基础配置

```typescript
{
  autoImport: {
    imports: [
      'react',
      'react-router-dom',
    ],
    dts: true,
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true,
    },
  }
}
```

### React + 常用库配置

```typescript
{
  autoImport: {
    imports: [
      'react',
      'react-router-dom',
      {
        'ahooks': [
          'useRequest',
          'useLocalStorageState',
          'useSessionStorageState',
          'useToggle',
          'useBoolean',
        ],
        'zustand': ['create'],
        'react-query': ['useQuery', 'useMutation', 'useQueryClient'],
        'react-hook-form': ['useForm', 'useController'],
        'lodash-es': [
          'debounce',
          'throttle',
          'cloneDeep',
          'isEqual',
        ],
      },
    ],
    dts: true,
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true,
    },
  }
}
```

### 企业级项目配置

```typescript
{
  autoImport: {
    imports: [
      'react',
      'react-router-dom',
      {
        // 状态管理
        'zustand': ['create'],
        'jotai': ['atom', 'useAtom', 'useAtomValue', 'useSetAtom'],
        
        // 数据请求
        'react-query': [
          'useQuery',
          'useMutation',
          'useQueryClient',
          'useInfiniteQuery',
        ],
        'swr': ['useSWR', 'mutate'],
        
        // 表单处理
        'react-hook-form': [
          'useForm',
          'useController',
          'useFormContext',
          'useWatch',
        ],
        
        // 工具库
        'ahooks': [
          'useRequest',
          'useLocalStorageState',
          'useSessionStorageState',
          'useToggle',
          'useBoolean',
          'useCounter',
          'useDebounce',
          'useThrottle',
        ],
        'lodash-es': [
          'debounce',
          'throttle',
          'cloneDeep',
          'isEqual',
          'merge',
          'pick',
          'omit',
        ],
        
        // UI 库
        'antd': [
          'message',
          'notification',
          'Modal',
        ],
        
        // 日期处理
        'dayjs': [['default', 'dayjs']],
      },
    ],
    dts: true,
    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true,
    },
  }
}
```

## 📝 使用效果

### 使用前

```typescript
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useRequest } from 'ahooks'
import { debounce } from 'lodash-es'
import { useQuery } from 'react-query'

function MyComponent() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()
  const { id } = useParams()
  
  // ... 组件逻辑
}
```

### 使用后

```typescript
// 无需任何 import 语句！
function MyComponent() {
  const [count, setCount] = useState(0)  // 自动引入 useState
  const navigate = useNavigate()         // 自动引入 useNavigate
  const { id } = useParams()             // 自动引入 useParams
  
  const debouncedFn = debounce(() => {   // 自动引入 debounce
    // ...
  }, 300)
  
  const { data } = useQuery(/* ... */)   // 自动引入 useQuery
  
  // ... 组件逻辑
}
```

## ⚙️ 高级配置

### 自定义导入路径

```typescript
{
  autoImport: {
    imports: [
      {
        '@/utils': ['formatDate', 'formatCurrency'],
        '@/hooks': ['useAuth', 'usePermission'],
        '@/constants': ['API_BASE_URL', 'ROUTES'],
      },
    ],
  }
}
```

### 条件导入

```typescript
{
  autoImport: {
    imports: [
      'react',
      // 根据环境条件导入
      ...(process.env.NODE_ENV === 'development' ? ['react-query/devtools'] : []),
    ],
  }
}
```

## 🚨 注意事项

1. **类型定义**：启用 `dts: true` 生成类型定义文件
2. **ESLint 配置**：启用 `eslintrc.enabled` 避免 ESLint 报错
3. **构建优化**：自动引入不会影响 tree-shaking
4. **调试友好**：生成的类型文件便于 IDE 智能提示

## 🔧 故障排除

### 自动引入不生效

1. 确保重启了开发服务器
2. 检查 `auto-imports.d.ts` 文件是否生成
3. 确保 TypeScript 配置包含了生成的类型文件

### ESLint 报错

1. 确保 `.eslintrc-auto-import.json` 被正确引入
2. 重启 ESLint 服务
3. 检查 ESLint 配置文件语法