#!/bin/bash

# Vite Config 推荐插件安装脚本

echo "🚀 安装 Vite Config 推荐插件..."

# 检查包管理器
if command -v pnpm &> /dev/null; then
    PM="pnpm add -D"
elif command -v yarn &> /dev/null; then
    PM="yarn add -D"
else
    PM="npm install -D"
fi

echo "📦 使用包管理器: $PM"

# 基础推荐插件
echo "安装基础推荐插件..."
$PM unplugin-auto-import vite-plugin-eslint

# 可选插件
read -p "是否安装 UnoCSS? (y/n): " install_unocss
if [[ $install_unocss == "y" || $install_unocss == "Y" ]]; then
    $PM @unocss/vite
fi

read -p "是否安装 Mock 插件? (y/n): " install_mock
if [[ $install_mock == "y" || $install_mock == "Y" ]]; then
    $PM vite-plugin-mock
fi

read -p "是否安装 PWA 插件? (y/n): " install_pwa
if [[ $install_pwa == "y" || $install_pwa == "Y" ]]; then
    $PM vite-plugin-pwa
fi

read -p "是否安装 Vue 组件自动引入? (y/n): " install_components
if [[ $install_components == "y" || $install_components == "Y" ]]; then
    $PM unplugin-vue-components
fi

echo "✅ 插件安装完成!"
echo "📚 查看使用指南: packages/vite-config/RECOMMENDED_PLUGINS.md"