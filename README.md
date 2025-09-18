# RA Web Monorepo

这是一个使用 Turbo 和 pnpm 构建的 monorepo 项目。

## 项目结构

```
├── apps/
│   ├── web/          # 主 Web 应用 (React + Vite)
│   └── admin/        # 管理后台应用
├── packages/
│   └── ui/           # 共享 UI 组件库
├── turbo.json        # Turbo 配置
├── pnpm-workspace.yaml # pnpm workspace 配置
└── package.json      # 根 package.json
```

## 技术栈

- **构建工具**: Turbo + pnpm
- **前端框架**: React 19
- **构建器**: Vite
- **类型检查**: TypeScript
- **代码规范**: ESLint

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

启动所有应用的开发服务器：

```bash
pnpm dev
```

启动特定应用：

```bash
# 启动 web 应用
pnpm dev --filter=@ra-web/web

# 启动 admin 应用
pnpm dev --filter=@ra-web/admin
```

### 构建

构建所有应用：

```bash
pnpm build
```

构建特定应用：

```bash
# 构建 web 应用
pnpm build --filter=@ra-web/web

# 构建 UI 组件库
pnpm build --filter=@ra-web/ui
```

### 代码检查

```bash
# 运行 ESLint
pnpm lint

# 类型检查
pnpm type-check
```

### 清理

```bash
pnpm clean
```

## 包管理

### 添加依赖

```bash
# 为特定应用添加依赖
pnpm add <package> --filter=@ra-web/web

# 为所有应用添加依赖
pnpm add <package> -w

# 为共享包添加依赖
pnpm add <package> --filter=@ra-web/ui
```

### 工作区引用

在 `apps/web/package.json` 中引用共享包：

```json
{
  "dependencies": {
    "@ra-web/ui": "workspace:*"
  }
}
```

## 开发指南

### 添加新的应用

1. 在 `apps/` 目录下创建新应用目录
2. 创建 `package.json` 文件
3. 更新 `pnpm-workspace.yaml`（如果需要）
4. 在 `turbo.json` 中配置任务（如果需要）

### 添加新的共享包

1. 在 `packages/` 目录下创建新包目录
2. 创建 `package.json` 文件
3. 配置 TypeScript 和其他工具
4. 在需要的地方引用该包

## 常用命令

```bash
# 查看工作区信息
pnpm list -r

# 查看特定包的依赖
pnpm list --filter=@ra-web/web

# 运行特定包的脚本
pnpm --filter=@ra-web/web dev

# 清理并重新安装
pnpm clean && pnpm install
```

## 注意事项

- 使用 `workspace:*` 来引用本地包
- 确保所有包都有正确的 `package.json` 配置
- 使用 Turbo 的缓存功能来提高构建速度
- 遵循 monorepo 的最佳实践来组织代码