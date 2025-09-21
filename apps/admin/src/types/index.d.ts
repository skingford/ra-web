// 类型声明文件统一入口
// 这个文件会自动包含所有类型声明

// Vite 环境类型声明
/// <reference types="vite/client" />

// 自动导入类型声明
/// <reference path="./auto-imports.d.ts" />

// 全局类型声明
declare global {
  // 可以在这里添加全局类型声明
  namespace NodeJS {
    interface ProcessEnv {
      readonly VITE_API_URL?: string;
      readonly VITE_APP_TITLE?: string;
      readonly VITE_APP_VERSION?: string;
    }
  }
}

export {};