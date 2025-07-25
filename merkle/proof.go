package merkle

import (
	"crypto/sha256"
	"errors"
	"fmt"
)

// ProofNode 表示证明路径中的一个节点
type ProofNode struct {
	Hash     []byte // 节点哈希值
	Position string // 位置: "left" 或 "right"
}

// Proof 表示 Merkle Proof
type Proof struct {
	Path      []ProofNode // 证明路径
	LeafIndex int         // 叶子节点索引
	LeafHash  []byte      // 叶子节点哈希
	RootHash  []byte      // 根节点哈希
}

// GenerateProof 为指定索引的叶子节点生成 Merkle Proof
func (t *Tree) GenerateProof(leafIndex int) (*Proof, error) {
	if leafIndex < 0 || leafIndex >= len(t.Leaves) {
		return nil, errors.New("叶子节点索引超出范围")
	}

	leaf := t.Leaves[leafIndex]
	proof := &Proof{
		LeafIndex: leafIndex,
		LeafHash:  leaf.Hash,
		RootHash:  t.GetRoot(),
		Path:      []ProofNode{},
	}

	// 从叶子节点开始，向上遍历到根节点
	currentIndex := leafIndex

	for level := 0; level < len(t.levels)-1; level++ {
		currentLevel := t.levels[level]

		// 计算兄弟节点的索引
		var siblingIndex int
		var position string

		if currentIndex%2 == 0 {
			// 当前节点是左子节点，兄弟节点在右边
			siblingIndex = currentIndex + 1
			position = "right"
		} else {
			// 当前节点是右子节点，兄弟节点在左边
			siblingIndex = currentIndex - 1
			position = "left"
		}

		// 如果兄弟节点存在，添加到证明路径中
		if siblingIndex < len(currentLevel) {
			sibling := currentLevel[siblingIndex]
			proof.Path = append(proof.Path, ProofNode{
				Hash:     sibling.Hash,
				Position: position,
			})
		}

		// 移动到下一层（父节点层）
		currentIndex = currentIndex / 2
	}

	return proof, nil
}

// VerifyProof 验证 Merkle Proof
func VerifyProof(proof *Proof) bool {
	if proof == nil {
		return false
	}

	// 从叶子节点开始计算哈希
	currentHash := proof.LeafHash

	// 沿着证明路径向上计算哈希
	for _, proofNode := range proof.Path {
		var combined []byte

		if proofNode.Position == "left" {
			// 兄弟节点在左边
			combined = append(proofNode.Hash, currentHash...)
		} else {
			// 兄弟节点在右边
			combined = append(currentHash, proofNode.Hash...)
		}

		hash := sha256.Sum256(combined)
		currentHash = hash[:]
	}

	// 检查计算出的根哈希是否与预期的根哈希匹配
	return equalBytes(currentHash, proof.RootHash)
}

// VerifyDataWithProof 使用 Merkle Proof 验证数据
func (t *Tree) VerifyDataWithProof(data []byte, proof *Proof) bool {
	// 计算数据的哈希
	dataHash := sha256.Sum256(data)

	// 检查叶子哈希是否匹配
	if !equalBytes(dataHash[:], proof.LeafHash) {
		return false
	}

	// 检查根哈希是否匹配
	if !equalBytes(t.GetRoot(), proof.RootHash) {
		return false
	}

	// 验证证明
	return VerifyProof(proof)
}

// GetProofByData 根据数据获取 Merkle Proof
func (t *Tree) GetProofByData(data []byte) (*Proof, error) {
	dataHash := sha256.Sum256(data)

	// 找到数据对应的叶子节点索引
	for i, leaf := range t.Leaves {
		if equalBytes(leaf.Hash, dataHash[:]) {
			return t.GenerateProof(i)
		}
	}

	return nil, errors.New("数据在树中不存在")
}

// String 返回证明的字符串表示
func (p *Proof) String() string {
	result := fmt.Sprintf("Merkle Proof for leaf %d:\n", p.LeafIndex)
	result += fmt.Sprintf("Leaf Hash: %x\n", p.LeafHash)
	result += fmt.Sprintf("Root Hash: %x\n", p.RootHash)
	result += "Proof Path:\n"

	for i, node := range p.Path {
		result += fmt.Sprintf("  %d. %s: %x\n", i+1, node.Position, node.Hash)
	}

	return result
}

// equalBytes 比较两个字节数组是否相等
func equalBytes(a, b []byte) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

// GetProofSize 返回证明的大小（字节数）
func (p *Proof) GetProofSize() int {
	size := len(p.LeafHash) + len(p.RootHash) + 4 // 4 bytes for leaf index
	for _, node := range p.Path {
		size += len(node.Hash) + 1 // 1 byte for position
	}
	return size
}
