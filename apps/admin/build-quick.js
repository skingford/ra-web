#!/usr/bin/env node

// 快速构建脚本，跳过类型检查
import { execSync } from 'child_process';

console.log('🚀 快速构建 (跳过类型检查)...');

try {
  // 只运行 vite build，跳过 tsc
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ 构建成功！');
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}