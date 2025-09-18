# 推荐插件使用指南

## 🌟 五星级推荐插件

### 1. unplugin-auto-import - 自动引入
自动引入 React、React Router 等常用库的 API，无需手动 import。

```typescript
// 使用前
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 使用后 - 自动引入
const [state, setState] = useState()
const navigate = useNavigate()
```

### 2. vite-plugin-eslint - ESLint 集成
在开发过程中实时显示 ESLint 错误和警告。

### 3. @unocss/vite - 原子化 CSS
高性能的原子化 CSS 引擎，按需生成样式。

### 4. vite-plugin-mock - API Mock
开发环境下的 API 模拟功能。

### 5. vite-plugin-pwa - PWA 支持
渐进式 Web 应用支持。

## 🚀 快速开始

### 基础使用

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { createConfigWithRecommendedPlugins, presets } from '@pkg/vite-config'

export default defineConfig(
  await createConfigWithRecommendedPlugins({
    ...presets.web,
  })
)
```

### 使用预设配置

```typescript
// 推荐插件预设
import { defineConfig } from 'vite'
import { createReactConfigAsync, presets } from '@pkg/vite-config'

export default defineConfig(
  await createReactConfigAsync({
    ...presets.web,
    ...presets.recommended,
  })
)
```

### 自定义插件配置

```typescript
// 自定义配置
import { defineConfig } from 'vite'
import { createViteConfig, presets } from '@pkg/vite-config'

export default defineConfig(
  await createViteConfig({
    ...presets.web,
    recommendedPlugins: {
      autoImport: {
        imports: ['react', 'react-router-dom', 'ahooks'],
        dts: true,
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
          globalsPropValue: true,
        },
      },
      eslint: {
        cache: false,
        include: ['src/**/*.{ts,tsx,js,jsx}'],
        exclude: ['node_modules'],
      },
      unocss: {
        shortcuts: {
          'flex-center': 'flex items-center justify-center',
          'flex-col-center': 'flex flex-col items-center justify-center',
        },
      },
    },
  })
    .react()
    .build()
)
```

### 链式 API 使用

```typescript
import { defineConfig } from 'vite'
import { createViteConfig, presets } from '@pkg/vite-config'

export default defineConfig(
  await createViteConfig(presets.web)
    .react()
    .autoImport({
      imports: ['react', 'react-router-dom'],
      dts: true,
    })
    .eslint()
    .unocss({
      shortcuts: {
        'btn': 'px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600',
      },
    })
    .build()
)
```

## 📦 安装依赖

根据需要安装对应的插件：

```bash
# 自动引入
pnpm add -D unplugin-auto-import

# ESLint 集成
pnpm add -D vite-plugin-eslint

# UnoCSS
pnpm add -D @unocss/vite

# API Mock
pnpm add -D vite-plugin-mock

# PWA 支持
pnpm add -D vite-plugin-pwa
```

## ⚙️ 配置选项

### autoImport 配置

```typescript
{
  autoImport: {
    imports: [
      'react',                    // 导入所有 React exports
      'react-router-dom',         // 导入所有 react-router-dom exports
      {
        'ahooks': ['useRequest', 'useLocalStorageState'], // 只导入指定的 hooks
        'zustand': ['create'],     // 只导入 create 函数
        'lodash-es': [
          ['debounce', 'debounceFn'], // 重命名导入
          'throttle',
        ],
      },
    ],
    dts: true, // 生成类型定义文件
    eslintrc: {
      enabled: true, // 生成 ESLint 配置
      filepath: './.eslintrc-auto-import.json',
      globalsPropValue: true,
    },
  }
}
```

#### 支持的导入格式

1. **全量导入**：`'react'` - 导入库的所有 exports
2. **选择性导入**：`{ 'ahooks': ['useRequest'] }` - 只导入指定的函数
3. **重命名导入**：`{ 'lodash-es': [['debounce', 'debounceFn']] }` - 导入并重命名

### eslint 配置

```typescript
{
  eslint: {
    cache: false, // 是否启用缓存
    include: ['src/**/*.{ts,tsx,js,jsx}'], // 包含的文件
    exclude: ['node_modules'], // 排除的文件
  }
}
```

### unocss 配置

```typescript
{
  unocss: {
    shortcuts: {
      'flex-center': 'flex items-center justify-center',
      'btn': 'px-4 py-2 rounded bg-blue-500 text-white',
    },
    theme: {
      colors: {
        primary: '#3b82f6',
      },
    },
  }
}
```

## 🔧 最佳实践

1. **渐进式采用**: 从基础的 `autoImport` 和 `eslint` 开始
2. **按需配置**: 只启用项目需要的插件
3. **类型安全**: 启用 `dts` 选项生成类型定义
4. **团队协作**: 提交生成的 `.eslintrc-auto-import.json` 文件

## 🚨 注意事项

1. **UnoCSS 冲突**: 如果项目已使用 Tailwind CSS，建议关闭 UnoCSS
2. **ESLint 配置**: 自动引入会生成 ESLint 配置文件，需要在主配置中引入
3. **类型定义**: 自动引入的类型定义文件应该提交到版本控制
4. **构建性能**: 推荐插件会增加构建时间，可根据需要选择性启用

## 📚 更多示例

查看 `examples.ts` 文件获取更多配置示例。