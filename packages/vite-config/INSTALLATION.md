# 安装指南

## 📦 基础安装

```bash
# 安装核心包
pnpm add @pkg/vite-config --filter=your-app

# 安装必需的 peer dependencies
pnpm add -D @vitejs/plugin-react vite --filter=your-app
```

## 🌟 推荐插件安装

### 自动安装脚本

```bash
# 运行自动安装脚本
./packages/vite-config/install-plugins.sh
```

### 手动安装

#### 基础推荐插件（强烈推荐）

```bash
# 自动引入插件
pnpm add -D unplugin-auto-import

# ESLint 集成
pnpm add -D vite-plugin-eslint
```

#### 可选插件

```bash
# UnoCSS（原子化 CSS）
pnpm add -D @unocss/vite

# API Mock
pnpm add -D vite-plugin-mock

# PWA 支持
pnpm add -D vite-plugin-pwa

# Vue 组件自动引入（如果使用 Vue）
pnpm add -D unplugin-vue-components
```

## 🚀 快速配置

### 1. 创建 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import { createConfigWithRecommendedPlugins, presets } from '@pkg/vite-config'

export default defineConfig(async () => {
  return await createConfigWithRecommendedPlugins({
    ...presets.web,
  })
})
```

### 2. 更新 package.json

确保你的 `package.json` 包含以下脚本：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3. 配置 ESLint（可选）

如果启用了自动引入，需要在 `.eslintrc.js` 中添加：

```javascript
module.exports = {
  extends: [
    // ... 其他配置
    './.eslintrc-auto-import.json', // 自动引入的 ESLint 配置
  ],
}
```

## 🔧 环境配置

### TypeScript 配置

确保 `tsconfig.json` 包含：

```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  },
  "include": [
    "src",
    "auto-imports.d.ts" // 如果使用自动引入
  ]
}
```

### Git 配置

添加到 `.gitignore`：

```gitignore
# Vite
dist/
*.local

# 自动引入生成的文件
auto-imports.d.ts
.eslintrc-auto-import.json
```

## 🎯 验证安装

运行以下命令验证安装：

```bash
# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm type-check
```

## 🚨 常见问题

### 1. 插件未找到错误

如果看到 "Plugin xxx is not installed" 警告，说明对应插件未安装。这是正常的，插件会被跳过。

### 2. 自动引入不生效

确保：
- 安装了 `unplugin-auto-import`
- 重启开发服务器
- 检查生成的 `auto-imports.d.ts` 文件

### 3. ESLint 报错

如果 ESLint 报告未定义的变量错误：
- 确保引入了 `.eslintrc-auto-import.json`
- 重启 ESLint 服务

## 📚 下一步

- 查看 [推荐插件使用指南](./RECOMMENDED_PLUGINS.md)
- 查看 [配置示例](./vite.config.example.ts)
- 查看 [实际使用示例](./vite.config.real-example.ts)