package merkle

import (
	"crypto/sha256"
	"fmt"
)

// Node 表示 Merkle Tree 中的一个节点
type Node struct {
	Hash   []byte // 节点的哈希值
	Left   *Node  // 左子节点
	Right  *Node  // 右子节点
	Data   []byte // 叶子节点的原始数据（只有叶子节点才有）
	IsLeaf bool   // 标识是否为叶子节点
}

// NewLeafNode 创建一个新的叶子节点
func NewLeafNode(data []byte) *Node {
	hash := sha256.Sum256(data)
	return &Node{
		Hash:   hash[:],
		Data:   data,
		IsLeaf: true,
	}
}

// NewInternalNode 创建一个新的内部节点
func NewInternalNode(left, right *Node) *Node {
	var hash []byte
	if left != nil && right != nil {
		// 合并左右子节点的哈希值
		combined := append(left.Hash, right.Hash...)
		hashSum := sha256.Sum256(combined)
		hash = hashSum[:]
	} else if left != nil {
		// 只有左子节点的情况
		hash = left.Hash
	} else if right != nil {
		// 只有右子节点的情况
		hash = right.Hash
	}

	return &Node{
		Hash:   hash,
		Left:   left,
		Right:  right,
		IsLeaf: false,
	}
}

// String 返回节点的字符串表示
func (n *Node) String() string {
	if n.IsLeaf {
		return fmt.Sprintf("Leaf[%x]", n.Hash[:8])
	}
	return fmt.Sprintf("Internal[%x]", n.Hash[:8])
}

// Equal 检查两个节点是否相等
func (n *Node) Equal(other *Node) bool {
	if n == nil && other == nil {
		return true
	}
	if n == nil || other == nil {
		return false
	}

	// 比较哈希值
	if len(n.Hash) != len(other.Hash) {
		return false
	}
	for i := range n.Hash {
		if n.Hash[i] != other.Hash[i] {
			return false
		}
	}

	return true
}
