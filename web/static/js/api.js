// 本地 Merkle Tree API 实现
class MerkleTreeAPI {
    constructor() {
        // 初始化默认数据
        this.merkleTree = new MerkleTree([
            'Transaction 1: Alice -> Bob',
            'Transaction 2: Bob -> Charlie', 
            'Transaction 3: Charlie -> David',
            'Transaction 4: David -> Alice'
        ]);
    }

    // 模拟异步操作
    async delay(ms = 100) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 创建标准响应格式
    createResponse(success, message, data = null) {
        return {
            success,
            message,
            data
        };
    }

    // 获取树信息
    async getTreeInfo() {
        await this.delay();
        try {
            const treeInfo = this.merkleTree.getTreeInfo();
            return this.createResponse(true, '获取树信息成功', treeInfo);
        } catch (error) {
            return this.createResponse(false, `获取树信息失败: ${error.message}`);
        }
    }

    // 添加数据
    async addData(data) {
        await this.delay();
        try {
            if (!data || data.trim() === '') {
                throw new Error('数据不能为空');
            }
            
            this.merkleTree.addData(data);
            const treeInfo = this.merkleTree.getTreeInfo();
            return this.createResponse(true, '数据添加成功', treeInfo);
        } catch (error) {
            return this.createResponse(false, `添加数据失败: ${error.message}`);
        }
    }

    // 生成证明
    async generateProof(options) {
        await this.delay();
        try {
            let proof;
            
            if (options.data) {
                // 根据数据生成证明
                proof = this.merkleTree.generateProofByData(options.data);
            } else if (typeof options.index === 'number') {
                // 根据索引生成证明
                proof = this.merkleTree.generateProof(options.index);
            } else {
                throw new Error('需要提供数据或索引');
            }

            // 添加验证状态和证明大小
            const proofInfo = {
                leafIndex: proof.leafIndex,
                leafHash: proof.leafHash,
                rootHash: proof.rootHash,
                path: proof.path,
                isValid: this.merkleTree.verifyProof(proof),
                proofSize: this.merkleTree.calculateProofSize(proof)
            };

            return this.createResponse(true, '生成证明成功', proofInfo);
        } catch (error) {
            return this.createResponse(false, `生成证明失败: ${error.message}`);
        }
    }

    // 验证证明
    async verifyProof(data, proof) {
        await this.delay();
        try {
            const proofValid = this.merkleTree.verifyProof(proof);
            let dataValid = false;
            
            if (data) {
                dataValid = this.merkleTree.verifyDataWithProof(data, proof);
            }

            const result = {
                proofValid,
                dataValid,
                data: data || ''
            };

            return this.createResponse(true, '验证完成', result);
        } catch (error) {
            return this.createResponse(false, `验证失败: ${error.message}`);
        }
    }

    // 重建树
    async rebuildTree(data) {
        await this.delay();
        try {
            if (!data || data.length === 0) {
                throw new Error('数据列表不能为空');
            }

            // 检查数据有效性
            for (let i = 0; i < data.length; i++) {
                if (!data[i] || data[i].trim() === '') {
                    throw new Error(`第 ${i + 1} 项数据不能为空`);
                }
            }

            this.merkleTree.rebuildTree(data);
            const treeInfo = this.merkleTree.getTreeInfo();
            return this.createResponse(true, '重建树成功', treeInfo);
        } catch (error) {
            return this.createResponse(false, `重建树失败: ${error.message}`);
        }
    }

    // 验证数据
    async verifyData(data) {
        await this.delay();
        try {
            if (!data || data.trim() === '') {
                throw new Error('数据不能为空');
            }

            const exists = this.merkleTree.verifyData(data);
            const result = {
                exists,
                data
            };

            return this.createResponse(true, '验证完成', result);
        } catch (error) {
            return this.createResponse(false, `验证失败: ${error.message}`);
        }
    }

    // 获取当前数据列表
    getCurrentData() {
        return this.merkleTree.data.slice();
    }

    // 清空树并重置为默认数据
    async resetToDefault() {
        await this.delay();
        try {
            const defaultData = [
                'Transaction 1: Alice -> Bob',
                'Transaction 2: Bob -> Charlie',
                'Transaction 3: Charlie -> David', 
                'Transaction 4: David -> Alice'
            ];
            
            this.merkleTree.rebuildTree(defaultData);
            const treeInfo = this.merkleTree.getTreeInfo();
            return this.createResponse(true, '重置为默认数据成功', treeInfo);
        } catch (error) {
            return this.createResponse(false, `重置失败: ${error.message}`);
        }
    }
}

// 创建全局 API 实例
window.merkleAPI = new MerkleTreeAPI(); 