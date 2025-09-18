# @pkg/vite-config

一个优雅、类型安全的 Vite 配置包，专为 monorepo 项目设计。

## ✨ 特性

- 🎯 **类型安全**: 完整的 TypeScript 类型支持
- 🔧 **链式 API**: 支持方法链式调用
- 📦 **模块化设计**: 清晰的代码组织结构
- ⚡ **智能默认值**: 减少必要配置
- 🎨 **预设配置**: 开箱即用的常用配置
- 🔄 **高度可扩展**: 支持自定义配置和插件

## 📁 项目结构

```
src/
├── index.ts      # 主入口文件，负责导出
├── types.ts      # 类型定义
├── builder.ts    # 构建器类
├── presets.ts    # 预设配置
├── constants.ts  # 常量定义
├── utils.ts      # 工具函数
└── examples.ts   # 配置示例
```

## 🚀 快速开始

### 安装

```bash
pnpm add @pkg/vite-config --filter=your-app
```

### 基础用法

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@pkg/vite-config'

export default defineConfig(
  createReactConfig({
    ...presets.web,
  })
)
```

## 📖 API 文档

### 核心函数

#### `createViteConfig(options?)`
创建 Vite 配置构建器实例。

```typescript
import { createViteConfig } from '@pkg/vite-config'

const config = createViteConfig({
  port: 3000,
  app: 'web'
})
```

#### `createReactConfig(options?)`
快速创建 React 应用配置。

```typescript
import { createReactConfig } from '@pkg/vite-config'

const config = createReactConfig({
  ...presets.web
})
```

### 构建器方法

#### 链式配置

```typescript
import { createViteConfig } from '@pkg/vite-config'

const config = createViteConfig()
  .react()           // 添加 React 支持
  .port(8080)        // 设置端口
  .host(true)        // 启用主机访问
  .open(true)        // 自动打开浏览器
  .cors(true)        // 启用 CORS
  .plugin(myPlugin)  // 添加插件
  .build()           // 构建配置
```

### 预设配置

```typescript
import { presets } from '@pkg/vite-config'

// 应用预设
presets.web      // Web 应用 (端口 5173)
presets.admin    // Admin 应用 (端口 5174)
presets.api      // API 应用 (端口 3000)

// 环境预设
presets.development  // 开发环境
presets.production   // 生产环境
```

### 类型定义

```typescript
import type { 
  ViteConfigOptions, 
  AppType, 
  EnvType 
} from '@pkg/vite-config'

const options: ViteConfigOptions = {
  app: 'web',
  env: 'development',
  port: 3000,
  host: true,
  open: true,
  cors: true,
}
```

## 🎯 使用场景

### 1. 基础 React 应用

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@pkg/vite-config'

export default defineConfig(
  createReactConfig({
    ...presets.web,
  })
)
```

### 2. 管理后台应用

```typescript
// apps/admin/vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@pkg/vite-config'

export default defineConfig(
  createReactConfig({
    ...presets.admin,
  })
)
```

### 3. 自定义配置

```typescript
// apps/custom/vite.config.ts
import { defineConfig } from 'vite'
import { createViteConfig } from '@pkg/vite-config'

export default defineConfig(
  createViteConfig({
    app: 'api',
    port: 8080,
    host: true,
  })
    .react()
    .plugin(myCustomPlugin)
    .build()
)
```

### 4. 开发环境配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@pkg/vite-config'

export default defineConfig(
  createReactConfig({
    ...presets.web,
    ...presets.development,
  })
)
```

### 5. 生产环境配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createReactConfig, presets } from '@pkg/vite-config'

export default defineConfig(
  createReactConfig({
    ...presets.web,
    ...presets.production,
  })
)
```

## 🔧 高级用法

### 自定义插件

```typescript
import { createViteConfig } from '@pkg/vite-config'
import myPlugin from './my-plugin'

const config = createViteConfig()
  .react()
  .plugin(myPlugin)
  .build()
```

### 配置合并

```typescript
import { createViteConfig, mergeConfigs } from '@pkg/vite-config'

const baseConfig = createViteConfig().react().build()
const customConfig = {
  build: {
    rollupOptions: {
      // 自定义构建选项
    }
  }
}

const finalConfig = mergeConfigs(baseConfig, customConfig)
```

### 验证配置

```typescript
import { validateOptions } from '@pkg/vite-config'

const options = {
  port: 8080,
  app: 'web'
}

validateOptions(options) // 验证配置选项
```

## 📋 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `port` | `number` | `5173` | 服务器端口 |
| `host` | `boolean \| string` | `false` | 主机地址 |
| `open` | `boolean` | `false` | 自动打开浏览器 |
| `cors` | `boolean` | `true` | 启用 CORS |
| `app` | `'web' \| 'admin' \| 'api'` | - | 应用类型 |
| `env` | `'development' \| 'production'` | `'development'` | 环境类型 |
| `plugins` | `any[]` | `[]` | 自定义插件 |
| `extra` | `Partial<UserConfig>` | `{}` | 额外配置 |

## 🛠️ 开发

```bash
# 构建
pnpm build

# 开发模式
pnpm dev

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 📄 许可证

MIT