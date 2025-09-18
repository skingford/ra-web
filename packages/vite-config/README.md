# @ra-web/vite-config

共享的 Vite 配置包，用于统一管理 monorepo 中各个应用的构建配置。

## 特性

- 🚀 **统一配置**: 所有应用使用相同的构建配置
- ⚡ **预设配置**: 提供常用应用的预设配置
- 🔧 **类型安全**: 完整的 TypeScript 类型支持
- 📦 **模块化**: 支持按需导入不同的配置

## 安装

```bash
pnpm add @ra-web/vite-config --filter=your-app
```

## 使用方法

### 基础用法

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@ra-web/vite-config/react'

export default defineConfig(createReactConfig({
  ...presets.web,  // 使用 web 应用预设
}))
```

### 自定义配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig } from '@ra-web/vite-config/react'

export default defineConfig(createReactConfig({
  port: 3000,
  host: true,
  open: true,
  cors: true,
}))
```

### 使用预设配置

```typescript
import { presets } from '@ra-web/vite-config/react'

// 可用的预设配置
presets.web          // Web 应用 (端口 5173)
presets.admin        // Admin 应用 (端口 5174)
presets.development  // 开发环境配置
presets.production   // 生产环境配置
```

## API 参考

### `createReactConfig(options?)`

创建 React 应用的 Vite 配置。

**参数:**
- `options` (可选): `ReactConfigOptions` 配置对象

**返回值:**
- `UserConfig`: Vite 配置对象

### `ReactConfigOptions`

```typescript
interface ReactConfigOptions {
  port?: number           // 端口号，默认 5173
  host?: boolean | string // 主机地址，默认 false
  open?: boolean         // 是否自动打开浏览器，默认 false
  cors?: boolean         // 是否启用 CORS，默认 true
}
```

### `presets`

预设配置对象，包含常用应用的配置。

## 配置特性

### 基础配置
- **服务器配置**: 端口、主机、CORS 等
- **构建优化**: 代码分割、压缩、源码映射
- **依赖优化**: 预构建常用依赖

### React 特定配置
- **JSX 支持**: 自动 JSX 转换
- **React 插件**: 自动配置 @vitejs/plugin-react
- **开发环境变量**: 自动注入 `__DEV__` 变量

## 示例

### Web 应用配置
```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@ra-web/vite-config/react'

export default defineConfig(createReactConfig({
  ...presets.web,
}))
```

### Admin 应用配置
```typescript
// apps/admin/vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@ra-web/vite-config/react'

export default defineConfig(createReactConfig({
  ...presets.admin,
}))
```

### 自定义应用配置
```typescript
// apps/custom/vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig } from '@ra-web/vite-config/react'

export default defineConfig(createReactConfig({
  port: 8080,
  host: true,
  open: true,
}))
```

## 开发

```bash
# 构建
pnpm build

# 开发模式
pnpm dev

# 类型检查
pnpm type-check
```

## 更新日志

### 0.0.0
- 初始版本
- 支持 React 应用配置
- 提供预设配置
- 完整的 TypeScript 支持
