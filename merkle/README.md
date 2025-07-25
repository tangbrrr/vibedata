# Merkle Tree 实现

这是一个完整的 Go 语言 Merkle Tree 实现，提供了树构建、证明生成和验证等核心功能。

## 功能特性

- ✅ **完整的 Merkle Tree 构建**: 支持任意数量的叶子节点
- ✅ **Merkle Proof 生成**: 为任意数据块生成完整性证明
- ✅ **证明验证**: 独立验证 Merkle Proof 的有效性
- ✅ **数据完整性检查**: 验证数据是否存在于树中
- ✅ **树重建**: 支持使用新数据重建树结构
- ✅ **调试工具**: 提供树结构打印功能
- ✅ **高效算法**: 使用 SHA-256 哈希算法
- ✅ **全面测试**: 包含完整的单元测试

## 安装和使用

### 基本用法

```go
package main

import (
    "fmt"
    "log"
    "your-module/merkle"
)

func main() {
    // 准备数据
    data := [][]byte{
        []byte("Transaction 1"),
        []byte("Transaction 2"),
        []byte("Transaction 3"),
        []byte("Transaction 4"),
    }

    // 创建 Merkle Tree
    tree, err := merkle.NewTree(data)
    if err != nil {
        log.Fatal(err)
    }

    // 获取根哈希
    rootHash := tree.GetRoot()
    fmt.Printf("Root Hash: %x\n", rootHash)
}
```

### 生成和验证证明

```go
// 为索引为 1 的数据生成证明
proof, err := tree.GenerateProof(1)
if err != nil {
    log.Fatal(err)
}

// 验证证明
isValid := merkle.VerifyProof(proof)
fmt.Printf("Proof is valid: %t\n", isValid)

// 使用原始数据验证证明
dataValid := tree.VerifyDataWithProof([]byte("Transaction 2"), proof)
fmt.Printf("Data proof is valid: %t\n", dataValid)
```

### 根据数据查找证明

```go
// 直接根据数据获取证明
proof, err := tree.GetProofByData([]byte("Transaction 3"))
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Found data at index: %d\n", proof.LeafIndex)
```

## API 文档

### Tree 结构

```go
type Tree struct {
    Root   *Node    // 根节点
    Leaves []*Node  // 所有叶子节点
    levels [][]*Node // 每一层的节点
}
```

### 主要方法

#### 创建树

```go
func NewTree(data [][]byte) (*Tree, error)
```
使用给定数据创建新的 Merkle Tree。

#### 获取信息

```go
func (t *Tree) GetRoot() []byte                    // 获取根哈希
func (t *Tree) GetLeaf(index int) (*Node, error)  // 获取指定索引的叶子节点
func (t *Tree) GetLeafCount() int                  // 获取叶子节点数量
func (t *Tree) GetDepth() int                      // 获取树的深度
```

#### 数据验证

```go
func (t *Tree) VerifyData(data []byte) bool // 验证数据是否在树中
```

#### 证明相关

```go
func (t *Tree) GenerateProof(leafIndex int) (*Proof, error)        // 生成证明
func (t *Tree) GetProofByData(data []byte) (*Proof, error)         // 根据数据获取证明
func (t *Tree) VerifyDataWithProof(data []byte, proof *Proof) bool // 使用证明验证数据
func VerifyProof(proof *Proof) bool                                 // 独立验证证明
```

#### 工具方法

```go
func (t *Tree) PrintTree()                          // 打印树结构（调试用）
func (t *Tree) RebuildTree(data [][]byte) error     // 重建树
```

### Proof 结构

```go
type Proof struct {
    Path       []ProofNode // 证明路径
    LeafIndex  int         // 叶子节点索引
    LeafHash   []byte      // 叶子节点哈希
    RootHash   []byte      // 根节点哈希
}
```

#### Proof 方法

```go
func (p *Proof) String() string    // 获取证明的字符串表示
func (p *Proof) GetProofSize() int // 获取证明大小（字节）
```

## 使用场景

### 1. 区块链应用

```go
// 区块链中的交易验证
transactions := [][]byte{
    []byte("Alice -> Bob: 10 BTC"),
    []byte("Bob -> Charlie: 5 BTC"),
    []byte("Charlie -> Alice: 2 BTC"),
}

tree, _ := merkle.NewTree(transactions)
rootHash := tree.GetRoot()

// 矿工可以将根哈希包含在区块头中
// 轻客户端只需根哈希即可验证特定交易
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

// 为特定文件生成证明
proof, _ := tree.GetProofByData([]byte("main.go"))

// 在其他地方验证文件完整性
isValid := tree.VerifyDataWithProof([]byte("main.go"), proof)
```

### 3. 数据同步验证

```go
// 分布式系统中的数据同步
dataChunks := [][]byte{
    []byte("chunk1"),
    []byte("chunk2"),
    []byte("chunk3"),
    []byte("chunk4"),
}

tree, _ := merkle.NewTree(dataChunks)

// 节点只需交换根哈希来比较数据状态
// 如果根哈希不同，可以逐层比较找出差异
```

## 算法复杂度

- **构建时间**: O(n)，其中 n 是叶子节点数量
- **空间复杂度**: O(n)
- **证明生成**: O(log n)
- **证明验证**: O(log n)
- **证明大小**: O(log n)

## 运行测试

```bash
# 运行所有测试
go test ./merkle

# 运行测试并显示覆盖率
go test -cover ./merkle

# 运行示例
go test -run Example ./merkle
```

## 性能特点

1. **高效的哈希计算**: 使用 SHA-256 算法
2. **内存友好**: 只存储必要的节点信息
3. **快速验证**: 证明验证只需 O(log n) 时间
4. **紧凑证明**: 证明大小与树的深度成正比

## 注意事项

1. **奇数叶子节点**: 当叶子节点数量为奇数时，最后一个节点会被单独处理
2. **哈希一致性**: 使用标准的 SHA-256 算法确保跨平台一致性
3. **内存使用**: 大型数据集可能需要考虑内存优化
4. **并发安全**: 当前实现不是并发安全的，如需并发访问请添加适当的锁

## 扩展功能

可以基于此实现添加以下功能：

- 持久化存储支持
- 增量更新机制  
- 并发安全访问
- 不同哈希算法支持
- 压缩证明格式
- 批量证明生成

## License

MIT License 