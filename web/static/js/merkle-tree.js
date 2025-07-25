// Merkle Tree 纯前端实现
class MerkleTree {
    constructor(data = []) {
        this.data = data.slice(); // 复制数据
        this.leaves = [];
        this.levels = [];
        this.buildTree();
    }

    // SHA-256 哈希函数（简化版，使用 Web Crypto API）
    async hash(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 同步哈希函数（用于简化实现）
    hashSync(data) {
        // 简单的哈希函数模拟
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(16).padStart(16, '0');
    }

    // 构建树
    buildTree() {
        if (this.data.length === 0) {
            this.leaves = [];
            this.levels = [];
            return;
        }

        // 生成叶子节点
        this.leaves = this.data.map((item, index) => ({
            index,
            data: item,
            hash: this.hashSync(item),
            isLeaf: true
        }));

        // 构建树的层级
        this.levels = [this.leaves.slice()];
        let currentLevel = this.leaves.slice();

        while (currentLevel.length > 1) {
            const nextLevel = [];
            
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
                
                const combinedHash = this.hashSync(left.hash + right.hash);
                
                nextLevel.push({
                    hash: combinedHash,
                    left,
                    right,
                    isLeaf: false
                });
            }
            
            this.levels.push(nextLevel);
            currentLevel = nextLevel;
        }
    }

    // 获取根哈希
    getRootHash() {
        if (this.levels.length === 0) return null;
        const rootLevel = this.levels[this.levels.length - 1];
        return rootLevel.length > 0 ? rootLevel[0].hash : null;
    }

    // 获取树深度
    getDepth() {
        return this.levels.length;
    }

    // 获取叶子节点数量
    getLeafCount() {
        return this.leaves.length;
    }

    // 获取叶子节点
    getLeaf(index) {
        return this.leaves[index] || null;
    }

    // 添加数据
    addData(newData) {
        this.data.push(newData);
        this.buildTree();
    }

    // 重建树
    rebuildTree(newData) {
        this.data = newData.slice();
        this.buildTree();
    }

    // 生成证明
    generateProof(leafIndex) {
        if (leafIndex < 0 || leafIndex >= this.leaves.length) {
            throw new Error('无效的叶子索引');
        }

        const proof = {
            leafIndex,
            leafHash: this.leaves[leafIndex].hash,
            rootHash: this.getRootHash(),
            path: []
        };

        let currentIndex = leafIndex;
        
        // 从叶子层向上遍历到根节点
        for (let level = 0; level < this.levels.length - 1; level++) {
            const currentLevel = this.levels[level];
            const siblingIndex = this.getSiblingIndex(currentIndex);
            
            if (siblingIndex < currentLevel.length) {
                const sibling = currentLevel[siblingIndex];
                proof.path.push({
                    hash: sibling.hash,
                    position: siblingIndex < currentIndex ? 'left' : 'right'
                });
            }
            
            currentIndex = Math.floor(currentIndex / 2);
        }

        return proof;
    }

    // 根据数据生成证明
    generateProofByData(data) {
        const index = this.data.indexOf(data);
        if (index === -1) {
            throw new Error('数据不存在于树中');
        }
        return this.generateProof(index);
    }

    // 获取兄弟节点索引
    getSiblingIndex(index) {
        return index % 2 === 0 ? index + 1 : index - 1;
    }

    // 验证证明
    verifyProof(proof) {
        if (!proof || !proof.leafHash || !proof.rootHash) {
            return false;
        }

        let computedHash = proof.leafHash;
        
        for (const step of proof.path) {
            if (step.position === 'left') {
                computedHash = this.hashSync(step.hash + computedHash);
            } else {
                computedHash = this.hashSync(computedHash + step.hash);
            }
        }

        return computedHash === proof.rootHash;
    }

    // 验证数据是否存在
    verifyData(data) {
        return this.data.includes(data);
    }

    // 验证数据和证明
    verifyDataWithProof(data, proof) {
        const dataHash = this.hashSync(data);
        return dataHash === proof.leafHash && this.verifyProof(proof);
    }

    // 获取树信息
    getTreeInfo() {
        return {
            rootHash: this.getRootHash(),
            leafCount: this.getLeafCount(),
            depth: this.getDepth(),
            leaves: this.leaves.map((leaf, index) => ({
                index,
                data: leaf.data,
                hash: leaf.hash
            })),
            treeLevels: this.buildTreeLevels()
        };
    }

    // 构建树层级信息（用于可视化）
    buildTreeLevels() {
        return this.levels.map((level, levelIndex) => {
            return level.map((node, nodeIndex) => ({
                hash: node.hash.substring(0, 16),
                isLeaf: node.isLeaf,
                data: node.data || '',
                position: nodeIndex,
                fullHash: node.hash
            }));
        });
    }

    // 计算证明大小
    calculateProofSize(proof) {
        if (!proof || !proof.path) return 0;
        
        // 估算证明大小（字节）
        let size = 32; // leafHash
        size += 32; // rootHash
        size += 4; // leafIndex
        size += proof.path.length * (32 + 1); // 每个路径步骤的哈希和位置
        
        return size;
    }
}

// 导出到全局作用域
window.MerkleTree = MerkleTree; 