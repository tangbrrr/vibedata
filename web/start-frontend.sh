#!/bin/bash

# Merkle Tree 可视化工具 - 纯前端版启动脚本

echo "🌐 启动 Merkle Tree 可视化工具 - 纯前端版"
echo "📋 项目地址: https://github.com/your-repo/merkle-tree-visualizer"
echo ""

if command -v node &> /dev/null && command -v npx &> /dev/null; then
    echo "✅ 使用 Node.js serve 启动本地服务器..."
    echo "🔗 访问地址: http://localhost:3000"
    echo "⏹️  停止服务器: Ctrl+C"
    echo ""
    npx serve . -p 3000
else
    echo "❌ 未找到 Python 或 Node.js"
    echo ""
    echo "请安装以下任一工具："
    echo "  • Python 3: https://python.org"
    echo "  • Node.js: https://nodejs.org"
    echo ""
    echo "或者直接用浏览器打开 index.html 文件"
    echo "文件路径: $(pwd)/index.html"
    
    # 尝试直接打开文件
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo ""
        echo "🚀 正在尝试直接打开文件..."
        open index.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo ""
        echo "🚀 正在尝试直接打开文件..."
        xdg-open index.html
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo ""
        echo "🚀 正在尝试直接打开文件..."
        start index.html
    fi
fi 