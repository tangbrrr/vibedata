package merkle

import (
	"errors"
	"fmt"
)

// Tree 表示 Merkle Tree
type Tree struct {
	Root   *Node     // 根节点
	Leaves []*Node   // 所有叶子节点
	levels [][]*Node // 每一层的节点（用于构建和调试）
}

// NewTree 创建一个新的 Merkle Tree
func NewTree(data [][]byte) (*Tree, error) {
	if len(data) == 0 {
		return nil, errors.New("数据不能为空")
	}

	tree := &Tree{}

	// 创建叶子节点
	leaves := make([]*Node, len(data))
	for i, d := range data {
		leaves[i] = NewLeafNode(d)
	}
	tree.Leaves = leaves
	tree.levels = append(tree.levels, leaves)

	// 构建树
	tree.buildTree()

	return tree, nil
}

// buildTree 构建 Merkle Tree
func (t *Tree) buildTree() {
	currentLevel := t.Leaves

	// 从底层向上构建，直到只剩一个根节点
	for len(currentLevel) > 1 {
		nextLevel := []*Node{}

		// 两两配对创建父节点
		for i := 0; i < len(currentLevel); i += 2 {
			var left, right *Node
			left = currentLevel[i]

			if i+1 < len(currentLevel) {
				right = currentLevel[i+1]
			}

			parent := NewInternalNode(left, right)
			nextLevel = append(nextLevel, parent)
		}

		t.levels = append(t.levels, nextLevel)
		currentLevel = nextLevel
	}

	// 设置根节点
	if len(currentLevel) > 0 {
		t.Root = currentLevel[0]
	}
}

// GetRoot 返回根节点的哈希值
func (t *Tree) GetRoot() []byte {
	if t.Root == nil {
		return nil
	}
	return t.Root.Hash
}

// GetLeaf 根据索引获取叶子节点
func (t *Tree) GetLeaf(index int) (*Node, error) {
	if index < 0 || index >= len(t.Leaves) {
		return nil, errors.New("索引超出范围")
	}
	return t.Leaves[index], nil
}

// GetLeafCount 返回叶子节点的数量
func (t *Tree) GetLeafCount() int {
	return len(t.Leaves)
}

// VerifyData 验证给定的数据是否在树中
func (t *Tree) VerifyData(data []byte) bool {
	targetHash := NewLeafNode(data).Hash

	for _, leaf := range t.Leaves {
		if leaf.Equal(&Node{Hash: targetHash}) {
			return true
		}
	}
	return false
}

// GetDepth 返回树的深度
func (t *Tree) GetDepth() int {
	return len(t.levels)
}

// PrintTree 打印树的结构（用于调试）
func (t *Tree) PrintTree() {
	fmt.Println("Merkle Tree Structure:")
	for level, nodes := range t.levels {
		fmt.Printf("Level %d: ", level)
		for i, node := range nodes {
			if i > 0 {
				fmt.Print(" | ")
			}
			fmt.Print(node.String())
		}
		fmt.Println()
	}
	fmt.Printf("Root Hash: %x\n", t.GetRoot())
}

// RebuildTree 使用新数据重建树
func (t *Tree) RebuildTree(data [][]byte) error {
	if len(data) == 0 {
		return errors.New("数据不能为空")
	}

	// 清空现有数据
	t.levels = nil

	// 创建新的叶子节点
	leaves := make([]*Node, len(data))
	for i, d := range data {
		leaves[i] = NewLeafNode(d)
	}
	t.Leaves = leaves
	t.levels = append(t.levels, leaves)

	// 重新构建树
	t.buildTree()

	return nil
}
