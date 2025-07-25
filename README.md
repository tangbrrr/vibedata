# VibeData - Merkle Tree 完整实现

这是一个用 Go 语言实现的完整 Merkle Tree 项目，包含核心算法库和 Web 可视化工具。同时提供了纯前端版本，无需后端服务器即可使用。

## 🎯 项目概述

本项目提供了三个主要组件：

1. **Merkle Tree 核心库** (`merkle/`) - 生产级别的 Merkle Tree 实现
2. **Web 可视化工具** (`web/`) - Go 后端 + 交互式图形化界面
3. **纯前端版本** (`web/index.html`) - 无需服务器的独立应用

## 📁 项目结构

```
vibedata/
├── merkle/              # Merkle Tree 核心库
│   ├── node.go         # 节点结构定义
│   ├── tree.go         # 树结构和核心方法
│   ├── proof.go        # Merkle Proof 实现
│   ├── tree_test.go    # 单元测试
│   ├── example_test.go # 使用示例
│   └── README.md       # 详细文档
├── web/                # Web 可视化工具
│   ├── main.go         # Go Web 服务器
│   ├── index.html      # 纯前端版本（独立应用）
│   ├── templates/      # HTML 模板
│   ├── static/         # 静态资源
│   ├── start-frontend.sh # 纯前端版启动脚本
│   ├── README.md       # Web 应用文档（Go版）
│   └── README_frontend.md # 纯前端版文档
├── go.mod              # Go 模块定义
├── start-web.sh        # Web 应用启动脚本
└── README.md           # 本文档
```

## 🚀 快速开始

### 方法一：纯前端版本（推荐）

```bash
# 进入 web 目录
cd web

# 使用启动脚本
./start-frontend.sh

# 或直接用浏览器打开
open index.html  # macOS
```

纯前端版本无需安装 Go，直接用浏览器即可运行！

### 方法二：Go 后端版本

```bash
# 使用启动脚本（推荐）
./start-web.sh

# 或手动启动
cd web && go run main.go
```

然后访问：http://localhost:8080

### 方法二：使用核心库

```go
package main

import (
    "fmt"
    "log"
    "github.com/tangbrrr/vibedata/merkle"
)

func main() {
    // 创建数据
    data := [][]byte{
        []byte("Transaction 1"),
        []byte("Transaction 2"),
        []byte("Transaction 3"),
        []byte("Transaction 4"),
    }

    // 构建 Merkle Tree
    tree, err := merkle.NewTree(data)
    if err != nil {
        log.Fatal(err)
    }

    // 获取根哈希
    fmt.Printf("Root Hash: %x\n", tree.GetRoot())

    // 生成证明
    proof, err := tree.GenerateProof(1)
    if err != nil {
        log.Fatal(err)
    }

    // 验证证明
    isValid := merkle.VerifyProof(proof)
    fmt.Printf("Proof Valid: %t\n", isValid)
}
```

## ✨ 功能特性

### 核心库功能
- ✅ 完整的 Merkle Tree 构建
- ✅ Merkle Proof 生成和验证
- ✅ 数据完整性检查
- ✅ 树重建和更新
- ✅ 高效的算法实现（O(log n) 证明）
- ✅ 全面的单元测试（89.9% 覆盖率）

### Web 界面功能
- 🎨 **可视化展示**: 清晰的树结构图形化展示
- 🖱️ **交互操作**: 点击节点生成证明，悬停查看详情
- ➕ **动态管理**: 实时添加数据，自动重建树结构
- 🔐 **证明功能**: 生成和验证 Merkle Proof
- 📊 **实时统计**: 显示树深度、节点数量、根哈希
- 📱 **响应式设计**: 支持桌面和移动设备
- 🎭 **现代化 UI**: 优雅的界面设计和动画效果

## 🧪 运行测试

```bash
# 运行 Merkle Tree 库的测试
go test ./merkle -v

# 查看测试覆盖率
go test ./merkle -cover

# 运行示例
go test -run Example ./merkle
```

## 📖 使用场景

### 1. 区块链应用
```go
// 验证区块中的交易
transactions := [][]byte{
    []byte("Alice -> Bob: 10 BTC"),
    []byte("Bob -> Charlie: 5 BTC"),
}

tree, _ := merkle.NewTree(transactions)
proof, _ := tree.GenerateProof(0)

// 轻客户端只需根哈希即可验证特定交易
isValid := merkle.VerifyProof(proof)
```

### 2. 文件完整性验证
```go
// 文件系统完整性检查
files := [][]byte{
    []byte("config.json"),
    []byte("main.go"),
    []byte("utils.go"),
}

tree, _ := merkle.NewTree(files)
exists := tree.VerifyData([]byte("main.go")) // true
```

### 3. 分布式系统同步
```go
// 比较不同节点的数据状态
tree1, _ := merkle.NewTree(data1)
tree2, _ := merkle.NewTree(data2)

// 如果根哈希不同，数据不一致
if !bytes.Equal(tree1.GetRoot(), tree2.GetRoot()) {
    // 需要同步数据
}
```

## 🎮 Web 界面演示

启动 Web 应用后，您可以：

1. **查看树结构** - 在右侧可视化区域查看完整的 Merkle Tree
2. **添加数据** - 在左侧控制面板输入新数据
3. **生成证明** - 点击叶子节点或输入数据来生成 Merkle Proof
4. **验证数据** - 检查特定数据是否存在于树中
5. **查看日志** - 在底部查看所有操作的详细记录

## 🛠️ 技术细节

### 算法复杂度
- **构建时间**: O(n)
- **空间复杂度**: O(n)
- **证明生成**: O(log n)
- **证明验证**: O(log n)
- **证明大小**: O(log n)

### 核心算法
- **哈希算法**: SHA-256
- **树结构**: 完全二叉树
- **证明机制**: 兄弟节点路径验证

### Web 技术栈
- **后端**: Go + HTTP Server + JSON API
- **前端**: 原生 HTML5/CSS3/JavaScript ES6+
- **可视化**: 自定义 Canvas/DOM 渲染
- **响应式**: CSS Grid + Flexbox

## 📋 系统要求

- **Go**: 1.21 或更高版本
- **浏览器**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **内存**: 最小 256MB
- **磁盘**: 50MB 可用空间

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢 Go 社区提供优秀的开发工具
- 感谢 Merkle Tree 算法的发明者 Ralph Merkle
- 感谢所有为密码学和区块链技术做出贡献的研究者

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 创建 [GitHub Issue](https://github.com/tangbrrr/vibedata/issues)
- 提交 [Pull Request](https://github.com/tangbrrr/vibedata/pulls)

---

**🌟 如果这个项目对您有帮助，请给我们一个 Star！**
