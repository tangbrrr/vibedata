// 主应用程序
class MerkleTreeApp {
    constructor() {
        this.currentProof = null;
        this.init();
    }

    // 初始化应用
    async init() {
        this.initializeVisualizer();
        this.bindEvents();
        this.initializeLogger();
        await this.loadTreeData();
        this.log('应用初始化完成', 'info');
    }

    // 初始化可视化组件
    initializeVisualizer() {
        const container = document.getElementById('treeVisualization');
        window.visualizer = new MerkleTreeVisualizer(container);
    }

    // 绑定事件监听器
    bindEvents() {
        // 添加数据
        document.getElementById('addDataBtn').addEventListener('click', () => {
            this.addData();
        });

        // 回车键添加数据
        document.getElementById('newDataInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addData();
            }
        });

        // 生成证明
        document.getElementById('generateProofBtn').addEventListener('click', () => {
            this.generateProof();
        });

        // 回车键生成证明
        document.getElementById('proofDataInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateProof();
            }
        });

        // 验证数据
        document.getElementById('verifyDataBtn').addEventListener('click', () => {
            this.verifyData();
        });

        // 回车键验证数据
        document.getElementById('verifyDataInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifyData();
            }
        });

        // 刷新树
        document.getElementById('refreshTreeBtn').addEventListener('click', () => {
            this.refreshTree();
        });

        // 清空重建
        document.getElementById('clearTreeBtn').addEventListener('click', () => {
            this.clearTree();
        });

        // 关闭证明详情
        document.getElementById('closeProofBtn').addEventListener('click', () => {
            this.hideProofDetails();
        });

        // 清空日志
        document.getElementById('clearLogBtn').addEventListener('click', () => {
            this.clearLog();
        });
    }

    // 初始化日志器
    initializeLogger() {
        this.logContainer = document.getElementById('logContainer');
    }

    // 加载树数据
    async loadTreeData() {
        try {
            this.showLoading(true);
            const response = await window.merkleAPI.getTreeInfo();
            
            if (!response.success) {
                throw new Error(response.message);
            }
            
            this.updateVisualization(response.data);
            this.updateDataList(response.data.leaves);
            this.log('树数据加载成功', 'success');
        } catch (error) {
            this.log(`加载树数据失败: ${error.message}`, 'error');
            this.showNotification('加载失败', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 添加数据
    async addData() {
        const input = document.getElementById('newDataInput');
        const data = input.value.trim();

        if (!data) {
            this.showNotification('请输入数据', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const response = await window.merkleAPI.addData(data);
            
            if (!response.success) {
                throw new Error(response.message);
            }
            
            this.updateVisualization(response.data);
            this.updateDataList(response.data.leaves);
            input.value = '';
            this.log(`添加数据成功: ${data}`, 'success');
            this.showNotification('数据添加成功', 'success');
            
            // 添加动画效果
            setTimeout(() => {
                window.visualizer.animateTreeConstruction();
            }, 100);
        } catch (error) {
            this.log(`添加数据失败: ${error.message}`, 'error');
            this.showNotification(`添加失败: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 生成证明
    async generateProof() {
        const input = document.getElementById('proofDataInput');
        const data = input.value.trim();

        if (!data) {
            this.showNotification('请输入要证明的数据', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const response = await window.merkleAPI.generateProof({ data });
            
            if (!response.success) {
                throw new Error(response.message);
            }
            
            this.currentProof = response.data;
            this.showProofDetails(response.data);
            this.log(`生成证明成功: ${data}`, 'success');
            this.showNotification('证明生成成功', 'success');
        } catch (error) {
            this.log(`生成证明失败: ${error.message}`, 'error');
            this.showNotification(`生成证明失败: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 为节点生成证明（从可视化组件调用）
    async generateProofForNode(node) {
        if (!node.isLeaf) return;

        try {
            this.showLoading(true);
            const response = await window.merkleAPI.generateProof({ index: node.index });
            
            if (!response.success) {
                throw new Error(response.message);
            }
            
            this.currentProof = response.data;
            this.showProofDetails(response.data);
            this.log(`为节点 ${node.index} 生成证明成功`, 'success');
            this.showNotification('证明生成成功', 'success');
        } catch (error) {
            this.log(`生成证明失败: ${error.message}`, 'error');
            this.showNotification(`生成证明失败: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 验证数据
    async verifyData() {
        const input = document.getElementById('verifyDataInput');
        const data = input.value.trim();

        if (!data) {
            this.showNotification('请输入要验证的数据', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            const response = await window.merkleAPI.verifyData(data);
            
            if (!response.success) {
                throw new Error(response.message);
            }
            
            const exists = response.data.exists;
            
            this.log(`数据验证结果: ${data} - ${exists ? '存在' : '不存在'}`, exists ? 'success' : 'warning');
            this.showNotification(
                `数据 ${exists ? '存在于' : '不存在于'} 树中`, 
                exists ? 'success' : 'warning'
            );
        } catch (error) {
            this.log(`验证数据失败: ${error.message}`, 'error');
            this.showNotification(`验证失败: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 刷新树
    async refreshTree() {
        this.log('刷新树数据...', 'info');
        await this.loadTreeData();
    }

    // 清空树
    async clearTree() {
        if (!confirm('确定要重置为默认数据吗？这将删除所有当前数据。')) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await window.merkleAPI.resetToDefault();
            
            if (!response.success) {
                throw new Error(response.message);
            }
            
            this.updateVisualization(response.data);
            this.updateDataList(response.data.leaves);
            this.hideProofDetails();
            this.log('树已重置为默认数据', 'info');
            this.showNotification('树已重置', 'info');
        } catch (error) {
            this.log(`重置树失败: ${error.message}`, 'error');
            this.showNotification(`操作失败: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 更新可视化
    updateVisualization(treeData) {
        if (window.visualizer) {
            window.visualizer.renderTree(treeData);
            window.visualizer.updateTreeInfo(treeData);
        }
    }

    // 更新数据列表
    updateDataList(leaves) {
        const container = document.getElementById('dataList');
        
        if (!leaves || leaves.length === 0) {
            container.innerHTML = '<div style="color: #6b7280; text-align: center; padding: 20px;">暂无数据</div>';
            return;
        }

        container.innerHTML = leaves.map((leaf, index) => `
            <div class="data-item" data-index="${index}">
                <div style="display: flex; align-items: center;">
                    <span class="data-index">${index}</span>
                    <span class="data-text">${this.escapeHtml(leaf.data)}</span>
                </div>
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 12px;" 
                        onclick="app.generateProofForIndex(${index})">
                    <i class="fas fa-key"></i>
                </button>
            </div>
        `).join('');
    }

    // 为指定索引生成证明
    async generateProofForIndex(index) {
        try {
            this.showLoading(true);
            const response = await window.merkleAPI.generateProof({ index });
            
            if (!response.success) {
                throw new Error(response.message);
            }
            
            this.currentProof = response.data;
            this.showProofDetails(response.data);
            this.log(`为索引 ${index} 生成证明成功`, 'success');
            this.showNotification('证明生成成功', 'success');
        } catch (error) {
            this.log(`生成证明失败: ${error.message}`, 'error');
            this.showNotification(`生成证明失败: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // 显示证明详情
    showProofDetails(proof) {
        const proofArea = document.querySelector('.proof-area');
        proofArea.style.display = 'block';

        // 更新证明信息
        document.getElementById('proofLeafIndex').textContent = proof.leafIndex;
        document.getElementById('proofLeafHash').textContent = proof.leafHash;
        document.getElementById('proofRootHash').textContent = proof.rootHash;
        document.getElementById('proofSize').textContent = proof.proofSize;
        
        const statusElement = document.getElementById('proofStatus');
        statusElement.textContent = proof.isValid ? 'Valid' : 'Invalid';
        statusElement.className = `status-badge ${proof.isValid ? 'valid' : 'invalid'}`;

        // 更新证明路径
        const pathContainer = document.getElementById('proofPathSteps');
        if (proof.path && proof.path.length > 0) {
            pathContainer.innerHTML = proof.path.map((step, index) => `
                <div class="proof-step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-position">${step.position}</div>
                    <div class="step-hash">${step.hash}</div>
                </div>
            `).join('');
        } else {
            pathContainer.innerHTML = '<div style="text-align: center; color: #6b7280;">无证明路径</div>';
        }

        // 滚动到证明区域
        proofArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 隐藏证明详情
    hideProofDetails() {
        const proofArea = document.querySelector('.proof-area');
        proofArea.style.display = 'none';
        this.currentProof = null;
        
        // 清除可视化高亮
        if (window.visualizer) {
            window.visualizer.clearHighlights();
        }
    }

    // 显示/隐藏加载指示器
    showLoading(show) {
        const indicator = document.getElementById('loadingIndicator');
        indicator.style.display = show ? 'flex' : 'none';
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;

        container.appendChild(notification);

        // 自动移除通知
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 获取通知图标
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'times-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    // 记录日志
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">[${timestamp}]</span>
            <span class="log-message">${this.escapeHtml(message)}</span>
        `;

        this.logContainer.insertBefore(logEntry, this.logContainer.firstChild);

        // 限制日志条数
        while (this.logContainer.children.length > 100) {
            this.logContainer.removeChild(this.logContainer.lastChild);
        }

        // 滚动到最新日志
        this.logContainer.scrollTop = 0;
    }

    // 清空日志
    clearLog() {
        this.logContainer.innerHTML = '';
        this.log('日志已清空', 'info');
    }

    // HTML 转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MerkleTreeApp();
}); 