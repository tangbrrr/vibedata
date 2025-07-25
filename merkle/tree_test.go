package merkle

import (
	"testing"
)

func TestNewTree(t *testing.T) {
	// 测试正常情况
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
		[]byte("data3"),
		[]byte("data4"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	if tree.Root == nil {
		t.Fatal("根节点不应该为空")
	}

	if len(tree.Leaves) != 4 {
		t.Fatalf("期望4个叶子节点，实际得到%d个", len(tree.Leaves))
	}

	// 测试空数据
	_, err = NewTree([][]byte{})
	if err == nil {
		t.Fatal("空数据应该返回错误")
	}
}

func TestTreeWithOddNumberOfLeaves(t *testing.T) {
	// 测试奇数个叶子节点
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
		[]byte("data3"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	if tree.Root == nil {
		t.Fatal("根节点不应该为空")
	}

	if len(tree.Leaves) != 3 {
		t.Fatalf("期望3个叶子节点，实际得到%d个", len(tree.Leaves))
	}
}

func TestTreeWithSingleLeaf(t *testing.T) {
	// 测试单个叶子节点
	data := [][]byte{[]byte("single data")}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	if tree.Root == nil {
		t.Fatal("根节点不应该为空")
	}

	if len(tree.Leaves) != 1 {
		t.Fatalf("期望1个叶子节点，实际得到%d个", len(tree.Leaves))
	}

	// 单个叶子节点的情况下，根节点应该就是叶子节点
	if !tree.Root.Equal(tree.Leaves[0]) {
		t.Fatal("单个叶子节点时，根节点应该等于叶子节点")
	}
}

func TestGetLeaf(t *testing.T) {
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
		[]byte("data3"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	// 测试有效索引
	leaf, err := tree.GetLeaf(1)
	if err != nil {
		t.Fatalf("获取叶子节点失败: %v", err)
	}
	if leaf != tree.Leaves[1] {
		t.Fatal("返回的叶子节点不正确")
	}

	// 测试无效索引
	_, err = tree.GetLeaf(-1)
	if err == nil {
		t.Fatal("负索引应该返回错误")
	}

	_, err = tree.GetLeaf(3)
	if err == nil {
		t.Fatal("超出范围的索引应该返回错误")
	}
}

func TestVerifyData(t *testing.T) {
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
		[]byte("data3"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	// 测试存在的数据
	if !tree.VerifyData([]byte("data2")) {
		t.Fatal("应该能验证存在的数据")
	}

	// 测试不存在的数据
	if tree.VerifyData([]byte("data4")) {
		t.Fatal("不应该验证不存在的数据")
	}
}

func TestGenerateProof(t *testing.T) {
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
		[]byte("data3"),
		[]byte("data4"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	// 为每个叶子节点生成证明
	for i := 0; i < len(data); i++ {
		proof, err := tree.GenerateProof(i)
		if err != nil {
			t.Fatalf("为索引%d生成证明失败: %v", i, err)
		}

		if proof.LeafIndex != i {
			t.Fatalf("证明的叶子索引不正确，期望%d，得到%d", i, proof.LeafIndex)
		}

		if len(proof.Path) == 0 {
			t.Fatal("证明路径不应该为空")
		}
	}

	// 测试无效索引
	_, err = tree.GenerateProof(-1)
	if err == nil {
		t.Fatal("负索引应该返回错误")
	}

	_, err = tree.GenerateProof(4)
	if err == nil {
		t.Fatal("超出范围的索引应该返回错误")
	}
}

func TestVerifyProof(t *testing.T) {
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
		[]byte("data3"),
		[]byte("data4"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	// 为每个叶子节点生成并验证证明
	for i := 0; i < len(data); i++ {
		proof, err := tree.GenerateProof(i)
		if err != nil {
			t.Fatalf("为索引%d生成证明失败: %v", i, err)
		}

		if !VerifyProof(proof) {
			t.Fatalf("索引%d的证明验证失败", i)
		}
	}

	// 测试空证明
	if VerifyProof(nil) {
		t.Fatal("空证明应该验证失败")
	}
}

func TestVerifyDataWithProof(t *testing.T) {
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
		[]byte("data3"),
		[]byte("data4"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	// 测试正确的数据和证明
	proof, err := tree.GenerateProof(1)
	if err != nil {
		t.Fatalf("生成证明失败: %v", err)
	}

	if !tree.VerifyDataWithProof([]byte("data2"), proof) {
		t.Fatal("应该能验证正确的数据和证明")
	}

	// 测试错误的数据
	if tree.VerifyDataWithProof([]byte("wrong data"), proof) {
		t.Fatal("不应该验证错误的数据")
	}
}

func TestGetProofByData(t *testing.T) {
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
		[]byte("data3"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	// 测试存在的数据
	proof, err := tree.GetProofByData([]byte("data2"))
	if err != nil {
		t.Fatalf("根据数据获取证明失败: %v", err)
	}

	if proof.LeafIndex != 1 {
		t.Fatalf("证明的叶子索引不正确，期望1，得到%d", proof.LeafIndex)
	}

	// 验证生成的证明
	if !VerifyProof(proof) {
		t.Fatal("生成的证明验证失败")
	}

	// 测试不存在的数据
	_, err = tree.GetProofByData([]byte("nonexistent"))
	if err == nil {
		t.Fatal("不存在的数据应该返回错误")
	}
}

func TestRebuildTree(t *testing.T) {
	data := [][]byte{
		[]byte("data1"),
		[]byte("data2"),
	}

	tree, err := NewTree(data)
	if err != nil {
		t.Fatalf("创建树失败: %v", err)
	}

	originalRoot := tree.GetRoot()

	// 重建树
	newData := [][]byte{
		[]byte("newdata1"),
		[]byte("newdata2"),
		[]byte("newdata3"),
	}

	err = tree.RebuildTree(newData)
	if err != nil {
		t.Fatalf("重建树失败: %v", err)
	}

	// 检查树的结构是否正确更新
	if len(tree.Leaves) != 3 {
		t.Fatalf("重建后期望3个叶子节点，实际得到%d个", len(tree.Leaves))
	}

	newRoot := tree.GetRoot()
	if equalBytes(originalRoot, newRoot) {
		t.Fatal("重建后根哈希应该不同")
	}

	// 验证新数据存在
	if !tree.VerifyData([]byte("newdata3")) {
		t.Fatal("重建后应该能验证新数据")
	}

	// 验证旧数据不存在
	if tree.VerifyData([]byte("data1")) {
		t.Fatal("重建后不应该验证旧数据")
	}
}

func TestGetDepth(t *testing.T) {
	// 测试不同大小的树的深度
	testCases := []struct {
		dataCount     int
		expectedDepth int
	}{
		{1, 1}, // 单个节点
		{2, 2}, // 两个叶子节点
		{3, 3}, // 三个叶子节点
		{4, 3}, // 四个叶子节点
		{5, 4}, // 五个叶子节点
		{8, 4}, // 八个叶子节点
	}

	for _, tc := range testCases {
		data := make([][]byte, tc.dataCount)
		for i := 0; i < tc.dataCount; i++ {
			data[i] = []byte(string(rune('A' + i)))
		}

		tree, err := NewTree(data)
		if err != nil {
			t.Fatalf("创建树失败: %v", err)
		}

		depth := tree.GetDepth()
		if depth != tc.expectedDepth {
			t.Fatalf("数据量%d的树深度期望%d，实际得到%d", tc.dataCount, tc.expectedDepth, depth)
		}
	}
}

func TestNodeEqual(t *testing.T) {
	node1 := NewLeafNode([]byte("test"))
	node2 := NewLeafNode([]byte("test"))
	node3 := NewLeafNode([]byte("different"))

	// 测试相同数据的节点
	if !node1.Equal(node2) {
		t.Fatal("相同数据的节点应该相等")
	}

	// 测试不同数据的节点
	if node1.Equal(node3) {
		t.Fatal("不同数据的节点不应该相等")
	}

	// 测试nil节点
	if !(*Node)(nil).Equal(nil) {
		t.Fatal("两个nil节点应该相等")
	}

	if node1.Equal(nil) {
		t.Fatal("节点与nil不应该相等")
	}
}
