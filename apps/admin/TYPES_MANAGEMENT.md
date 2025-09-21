# 类型文件管理说明

## 📁 类型文件组织结构

```
src/types/
├── index.d.ts           # 类型声明统一入口
├── auto-imports.d.ts    # 自动导入类型声明
├── vite-env.d.ts        # Vite环境变量类型
└── README.md           # 类型管理说明（本文件）
```

## 🔧 配置说明

### 1. TypeScript 配置
在 `tsconfig.app.json` 中已配置包含types目录：
```json
{
  "include": ["src", "src/types"]
}
```

### 2. Vite 配置
自动导入插件配置为在types目录生成类型声明：
```typescript
AutoImport({
  dts: './src/types/auto-imports.d.ts',
  // ...
})
```

### 3. 路径别名
通过 `@` 别名可以轻松引用types目录：
```typescript
import type { SomeType } from '@/types/common'
```

## 📝 类型文件说明

### `index.d.ts`
- 类型声明的统一入口
- 自动引用所有其他类型文件
- 定义全局类型声明
- 环境变量类型定义

### `auto-imports.d.ts`
- 由 `unplugin-auto-import` 自动生成
- 包含所有自动导入的React Hook类型
- 无需手动修改

### `vite-env.d.ts`
- Vite环境变量类型定义
- 定义 `ImportMetaEnv` 接口
- 支持 `import.meta.env` 的类型检查

## 🎯 最佳实践

### 1. 类型文件命名
- 使用 `.d.ts` 后缀
- 文件名使用kebab-case
- 按功能模块分组（如：`api.d.ts`, `components.d.ts`）

### 2. 类型定义规范
```typescript
// ✅ 推荐：导出类型
export interface User {
  id: string;
  name: string;
}

// ✅ 推荐：导出类型别名
export type Status = 'loading' | 'success' | 'error';

// ❌ 避免：全局声明污染
declare global {
  interface Window {
    customProperty: any;
  }
}
```

### 3. 导入方式
```typescript
// ✅ 推荐：使用路径别名
import type { User, Status } from '@/types/common';

// ✅ 推荐：按需导入
import type { ApiResponse } from '@/types/api';

// ❌ 避免：相对路径
import type { User } from '../../../types/common';
```

## 🔄 自动导入功能

### 可用的自动导入Hook
以下React Hook会自动导入，无需手动import：
- `useState`, `useEffect`, `useCallback`, `useMemo`
- `useRef`, `useContext`, `useReducer`
- `useLayoutEffect`, `useImperativeHandle`
- `useDebugValue`, `useId`
- `useSyncExternalStore`, `useTransition`
- `useDeferredValue`, `useInsertionEffect`

### 使用示例
```typescript
// ✅ 直接使用，无需导入
function MyComponent() {
  const [state, setState] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 副作用逻辑
  }, []);
  
  return <div ref={ref}>{state}</div>;
}
```

## 🛠️ 维护说明

### 添加新的类型文件
1. 在 `src/types/` 目录创建新的 `.d.ts` 文件
2. 在 `src/types/index.d.ts` 中添加引用：
   ```typescript
   /// <reference path="./new-types.d.ts" />
   ```

### 更新自动导入配置
修改 `vite.config.ts` 中的 `AutoImport` 配置：
```typescript
AutoImport({
  imports: [
    'react',
    // 添加新的导入源
  ],
  dts: './src/types/auto-imports.d.ts',
})
```

### 环境变量类型
在 `src/types/vite-env.d.ts` 中添加新的环境变量类型：
```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_NEW_VAR: string  // 新增
}
```

## 🚀 优势

1. **集中管理**：所有类型文件统一放在types目录
2. **自动生成**：自动导入类型由插件自动生成和维护
3. **类型安全**：完整的TypeScript类型支持
4. **易于维护**：清晰的文件结构和命名规范
5. **开发体验**：自动导入减少重复代码

## 📚 相关文档

- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 配置文档](https://vitejs.dev/config/)
- [unplugin-auto-import 文档](https://github.com/antfu/unplugin-auto-import)
