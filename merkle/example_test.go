package merkle

import (
	"fmt"
	"log"
)

func ExampleNewTree() {
	// 准备一些数据
	data := [][]byte{
		[]byte("Transaction 1"),
		[]byte("Transaction 2"),
		[]byte("Transaction 3"),
		[]byte("Transaction 4"),
	}

	// 创建 Merkle Tree
	tree, err := NewTree(data)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("根哈希: %x\n", tree.GetRoot()[:8])
	fmt.Printf("叶子节点数量: %d\n", tree.GetLeafCount())
	fmt.Printf("树的深度: %d\n", tree.GetDepth())

	// Output:
	// 根哈希: fdf76ad58a4424e7
	// 叶子节点数量: 4
	// 树的深度: 3
}

func ExampleTree_GenerateProof() {
	// 创建 Merkle Tree
	data := [][]byte{
		[]byte("Block A"),
		[]byte("Block B"),
		[]byte("Block C"),
		[]byte("Block D"),
	}

	tree, err := NewTree(data)
	if err != nil {
		log.Fatal(err)
	}

	// 为第二个数据块生成证明
	proof, err := tree.GenerateProof(1)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("叶子索引: %d\n", proof.LeafIndex)
	fmt.Printf("证明路径长度: %d\n", len(proof.Path))
	fmt.Printf("证明大小: %d 字节\n", proof.GetProofSize())

	// Output:
	// 叶子索引: 1
	// 证明路径长度: 2
	// 证明大小: 134 字节
}

func ExampleVerifyProof() {
	// 创建 Merkle Tree
	data := [][]byte{
		[]byte("File 1"),
		[]byte("File 2"),
		[]byte("File 3"),
		[]byte("File 4"),
	}

	tree, err := NewTree(data)
	if err != nil {
		log.Fatal(err)
	}

	// 生成证明
	proof, err := tree.GenerateProof(2)
	if err != nil {
		log.Fatal(err)
	}

	// 验证证明
	isValid := VerifyProof(proof)
	fmt.Printf("证明有效性: %t\n", isValid)

	// 使用数据验证证明
	isDataValid := tree.VerifyDataWithProof([]byte("File 3"), proof)
	fmt.Printf("数据验证: %t\n", isDataValid)

	// Output:
	// 证明有效性: true
	// 数据验证: true
}

func ExampleTree_VerifyData() {
	// 创建包含一些文档的 Merkle Tree
	documents := [][]byte{
		[]byte("Contract v1.0"),
		[]byte("Invoice #123"),
		[]byte("Receipt #456"),
	}

	tree, err := NewTree(documents)
	if err != nil {
		log.Fatal(err)
	}

	// 验证文档是否在树中
	exists := tree.VerifyData([]byte("Invoice #123"))
	fmt.Printf("Invoice #123 存在: %t\n", exists)

	notExists := tree.VerifyData([]byte("Invoice #124"))
	fmt.Printf("Invoice #124 存在: %t\n", notExists)

	// Output:
	// Invoice #123 存在: true
	// Invoice #124 存在: false
}

func ExampleTree_GetProofByData() {
	// 创建 Merkle Tree
	data := [][]byte{
		[]byte("Record A"),
		[]byte("Record B"),
		[]byte("Record C"),
	}

	tree, err := NewTree(data)
	if err != nil {
		log.Fatal(err)
	}

	// 根据数据获取证明
	proof, err := tree.GetProofByData([]byte("Record B"))
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("找到数据的索引: %d\n", proof.LeafIndex)
	fmt.Printf("证明路径: %d 步\n", len(proof.Path))

	// Output:
	// 找到数据的索引: 1
	// 证明路径: 2 步
}

func ExampleTree_PrintTree() {
	// 创建一个小的 Merkle Tree 用于演示
	data := [][]byte{
		[]byte("A"),
		[]byte("B"),
		[]byte("C"),
	}

	tree, err := NewTree(data)
	if err != nil {
		log.Fatal(err)
	}

	// 打印树的结构
	tree.PrintTree()

	// Output:
	// Merkle Tree Structure:
	// Level 0: Leaf[559aead08264d579] | Leaf[df7e70e5021544f4] | Leaf[6b23c0d5f35d1b11]
	// Level 1: Internal[63956f0ce48edc48] | Internal[6b23c0d5f35d1b11]
	// Level 2: Internal[dbe11e36aa89a963]
	// Root Hash: dbe11e36aa89a963103de7f8ad09c1100c06ccd5c5ad424ca741efb0689dc427
}

func ExampleTree_RebuildTree() {
	// 创建初始 Merkle Tree
	originalData := [][]byte{
		[]byte("Version 1.0"),
		[]byte("Version 1.1"),
	}

	tree, err := NewTree(originalData)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("原始根哈希: %x\n", tree.GetRoot()[:8])

	// 使用新数据重建树
	newData := [][]byte{
		[]byte("Version 2.0"),
		[]byte("Version 2.1"),
		[]byte("Version 2.2"),
	}

	err = tree.RebuildTree(newData)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("新根哈希: %x\n", tree.GetRoot()[:8])
	fmt.Printf("新叶子节点数量: %d\n", tree.GetLeafCount())

	// Output:
	// 原始根哈希: 7620ea4cbb1c034d
	// 新根哈希: a49faafdd24f8aaf
	// 新叶子节点数量: 3
}

// 完整的用例演示：文件完整性验证系统
func Example_completeWorkflow() {
	fmt.Println("=== 文件完整性验证系统演示 ===")

	// 1. 准备文件数据
	files := [][]byte{
		[]byte("config.json"),
		[]byte("index.html"),
		[]byte("main.js"),
		[]byte("style.css"),
	}

	// 2. 创建 Merkle Tree
	tree, err := NewTree(files)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("文件系统根哈希: %x\n", tree.GetRoot()[:16])

	// 3. 为特定文件生成完整性证明
	targetFile := []byte("main.js")
	proof, err := tree.GetProofByData(targetFile)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("为文件 'main.js' 生成的证明包含 %d 个节点\n", len(proof.Path))

	// 4. 在另一个系统中验证文件
	isFileValid := tree.VerifyDataWithProof(targetFile, proof)
	fmt.Printf("文件 'main.js' 完整性验证: %s\n",
		map[bool]string{true: "通过", false: "失败"}[isFileValid])

	// 5. 检测被篡改的文件
	tamperedFile := []byte("main.js.malicious")
	isTamperedValid := tree.VerifyDataWithProof(tamperedFile, proof)
	fmt.Printf("被篡改文件的验证: %s\n",
		map[bool]string{true: "通过", false: "失败"}[isTamperedValid])

	// Output:
	// === 文件完整性验证系统演示 ===
	// 文件系统根哈希: 49a43aadbca51e06c3a84ed4ccd8f4dd
	// 为文件 'main.js' 生成的证明包含 2 个节点
	// 文件 'main.js' 完整性验证: 通过
	// 被篡改文件的验证: 失败
}
