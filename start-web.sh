#!/bin/bash

echo "🌐 启动 Merkle Tree Web 可视化工具..."
echo ""

# 检查 Go 是否安装
if ! command -v go &> /dev/null; then
    echo "❌ 错误: 未找到 Go 环境"
    echo "请先安装 Go: https://golang.org/dl/"
    exit 1
fi

# 检查 merkle 包是否存在
if [ ! -d "merkle" ]; then
    echo "❌ 错误: 未找到 merkle 目录"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

# 检查 web 目录是否存在
if [ ! -d "web" ]; then
    echo "❌ 错误: 未找到 web 目录"
    echo "请确保在项目根目录运行此脚本"
    exit 1
fi

echo "✅ 环境检查完成"
echo "📦 启动 Web 服务器..."
echo ""

# 启动 Web 服务器
cd web && go run main.go 