// Merkle Tree 可视化组件
class MerkleTreeVisualizer {
    constructor(container) {
        this.container = container;
        this.currentTree = null;
        this.highlightedNodes = new Set();
    }

    // 渲染树结构
    renderTree(treeData) {
        this.currentTree = treeData;
        this.container.innerHTML = '';

        if (!treeData || !treeData.leaves || treeData.leaves.length === 0) {
            this.showEmptyState();
            return;
        }

        // 构建完整的树结构
        const levels = this.buildTreeLevels(treeData);
        
        // 渲染每一层
        levels.forEach((level, levelIndex) => {
            this.renderLevel(level, levelIndex, levels.length);
        });

        // 添加连接线
        this.renderConnections(levels);
    }

    // 构建树的层级结构
    buildTreeLevels(treeData) {
        if (!treeData.treeLevels || treeData.treeLevels.length === 0) {
            return this.buildTreeLevelsFromLeaves(treeData);
        }

        // 使用从 API 获取的树层级信息
        const levels = treeData.treeLevels.map((level, levelIndex) => {
            return level.map((node, nodeIndex) => ({
                id: node.isLeaf ? `leaf-${nodeIndex}` : `internal-${levelIndex}-${nodeIndex}`,
                hash: node.hash,
                fullHash: node.fullHash || node.hash,
                data: node.data || '',
                isLeaf: node.isLeaf,
                isRoot: levelIndex === treeData.treeLevels.length - 1 && nodeIndex === 0,
                index: node.isLeaf ? nodeIndex : undefined,
                position: nodeIndex
            }));
        });

        return levels.reverse(); // 从根节点开始显示
    }

    // 从叶子节点构建树层级（备用方法）
    buildTreeLevelsFromLeaves(treeData) {
        const levels = [];
        
        // 叶子层
        const leafLevel = treeData.leaves.map((leaf, index) => ({
            id: `leaf-${index}`,
            hash: leaf.hash.substring(0, 16),
            fullHash: leaf.hash,
            data: leaf.data,
            isLeaf: true,
            isRoot: false,
            index: index,
            position: index
        }));
        levels.push(leafLevel);

        // 构建内部节点层
        let currentLevel = leafLevel;
        let levelIndex = 1;

        while (currentLevel.length > 1) {
            const nextLevel = [];
            
            for (let i = 0; i < currentLevel.length; i += 2) {
                const left = currentLevel[i];
                const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : null;
                
                // 使用更好的哈希合成方法
                const combinedHash = this.combineHashes(
                    left.fullHash || left.hash, 
                    right ? (right.fullHash || right.hash) : (left.fullHash || left.hash)
                );
                
                nextLevel.push({
                    id: `internal-${levelIndex}-${Math.floor(i / 2)}`,
                    hash: combinedHash.substring(0, 16),
                    fullHash: combinedHash,
                    data: '',
                    isLeaf: false,
                    isRoot: false,
                    leftChild: left,
                    rightChild: right,
                    position: Math.floor(i / 2)
                });
            }
            
            levels.push(nextLevel);
            currentLevel = nextLevel;
            levelIndex++;
        }

        // 标记根节点
        if (levels.length > 0 && levels[levels.length - 1].length > 0) {
            levels[levels.length - 1][0].isRoot = true;
        }

        return levels.reverse(); // 从根节点开始显示
    }

    // 合成哈希（与 MerkleTree 类保持一致）
    combineHashes(leftHash, rightHash) {
        const combined = leftHash + rightHash;
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash).toString(16).padStart(16, '0');
    }

    // 渲染单个层级
    renderLevel(level, levelIndex, totalLevels) {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'tree-level';
        levelDiv.style.zIndex = totalLevels - levelIndex;

        level.forEach((node, nodeIndex) => {
            const nodeElement = this.createNodeElement(node, levelIndex, nodeIndex);
            levelDiv.appendChild(nodeElement);
        });

        this.container.appendChild(levelDiv);
    }

    // 创建节点元素
    createNodeElement(node, levelIndex, nodeIndex) {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        nodeDiv.id = node.id;
        
        // 设置节点类型样式
        if (node.isRoot) {
            nodeDiv.classList.add('root');
        } else if (node.isLeaf) {
            nodeDiv.classList.add('leaf');
        } else {
            nodeDiv.classList.add('internal');
        }

        // 创建哈希显示
        const hashDiv = document.createElement('div');
        hashDiv.className = 'node-hash';
        hashDiv.textContent = node.hash;
        nodeDiv.appendChild(hashDiv);

        // 如果是叶子节点，显示数据
        if (node.isLeaf && node.data) {
            const dataDiv = document.createElement('div');
            dataDiv.className = 'node-data';
            dataDiv.textContent = node.data.length > 8 ? node.data.substring(0, 8) + '...' : node.data;
            dataDiv.title = node.data; // 完整数据作为 tooltip
            nodeDiv.appendChild(dataDiv);
        }

        // 添加点击事件
        nodeDiv.addEventListener('click', () => {
            this.onNodeClick(node);
        });

        // 添加悬停事件
        nodeDiv.addEventListener('mouseenter', () => {
            this.onNodeHover(node, nodeDiv);
        });

        nodeDiv.addEventListener('mouseleave', () => {
            this.onNodeLeave(node, nodeDiv);
        });

        return nodeDiv;
    }

    // 渲染连接线
    renderConnections(levels) {
        for (let levelIndex = 0; levelIndex < levels.length - 1; levelIndex++) {
            const currentLevel = levels[levelIndex];
            const nextLevel = levels[levelIndex + 1];

            nextLevel.forEach((node, nodeIndex) => {
                if (node.leftChild) {
                    this.createConnection(node.id, node.leftChild.id);
                }
                if (node.rightChild) {
                    this.createConnection(node.id, node.rightChild.id);
                }
            });
        }
    }

    // 创建连接线（简化版本，使用 CSS 实现）
    createConnection(parentId, childId) {
        // 这里可以使用 SVG 或 Canvas 来绘制更精确的连接线
        // 当前简化实现，依赖 CSS 伪元素
    }

    // 节点点击事件
    onNodeClick(node) {
        this.clearHighlights();
        
        if (node.isLeaf) {
            // 叶子节点点击：生成证明
            this.highlightProofPath(node);
            window.app && window.app.generateProofForNode(node);
        } else {
            // 内部节点点击：高亮子树
            this.highlightSubtree(node);
        }
    }

    // 节点悬停事件
    onNodeHover(node, element) {
        element.style.transform = 'scale(1.1)';
        this.showNodeTooltip(node, element);
    }

    // 节点离开事件
    onNodeLeave(node, element) {
        element.style.transform = 'scale(1)';
        this.hideNodeTooltip();
    }

    // 显示节点详情
    showNodeTooltip(node, element) {
        // 创建或更新 tooltip
        let tooltip = document.getElementById('node-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'node-tooltip';
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 10px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 1000;
                max-width: 300px;
                word-break: break-all;
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);
        }

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.right + 10 + 'px';
        tooltip.style.top = rect.top + 'px';
        
        tooltip.innerHTML = `
            <div><strong>类型:</strong> ${node.isRoot ? '根节点' : node.isLeaf ? '叶子节点' : '内部节点'}</div>
            <div><strong>哈希:</strong> ${node.fullHash || node.hash}</div>
            ${node.data ? `<div><strong>数据:</strong> ${node.data}</div>` : ''}
            ${node.index !== undefined ? `<div><strong>索引:</strong> ${node.index}</div>` : ''}
        `;
        
        tooltip.style.display = 'block';
    }

    // 隐藏节点详情
    hideNodeTooltip() {
        const tooltip = document.getElementById('node-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    // 高亮证明路径
    highlightProofPath(leafNode) {
        this.clearHighlights();
        
        // 高亮叶子节点
        this.highlightNode(leafNode.id, 'highlighted');
        
        // 这里应该根据实际的证明路径来高亮相关节点
        // 简化实现：高亮从叶子到根的路径
        this.highlightPathToRoot(leafNode);
    }

    // 高亮到根节点的路径
    highlightPathToRoot(node) {
        // 简化实现：递归高亮父节点
        if (node.parent) {
            this.highlightNode(node.parent.id, 'highlighted');
            this.highlightPathToRoot(node.parent);
        }
    }

    // 高亮子树
    highlightSubtree(node) {
        this.highlightNode(node.id, 'highlighted');
        
        if (node.leftChild) {
            this.highlightSubtree(node.leftChild);
        }
        if (node.rightChild) {
            this.highlightSubtree(node.rightChild);
        }
    }

    // 高亮单个节点
    highlightNode(nodeId, className = 'highlighted') {
        const element = document.getElementById(nodeId);
        if (element) {
            element.classList.add(className);
            this.highlightedNodes.add(nodeId);
        }
    }

    // 清除所有高亮
    clearHighlights() {
        this.highlightedNodes.forEach(nodeId => {
            const element = document.getElementById(nodeId);
            if (element) {
                element.classList.remove('highlighted');
            }
        });
        this.highlightedNodes.clear();
    }

    // 显示空状态
    showEmptyState() {
        this.container.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 300px;
                color: #6b7280;
                font-size: 16px;
            ">
                <i class="fas fa-tree" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                <div>还没有数据</div>
                <div style="font-size: 14px; margin-top: 8px;">添加一些数据来构建 Merkle Tree</div>
            </div>
        `;
    }

    // 添加动画效果
    animateTreeConstruction() {
        const nodes = this.container.querySelectorAll('.tree-node');
        nodes.forEach((node, index) => {
            node.style.opacity = '0';
            node.style.transform = 'scale(0.5)';
            
            setTimeout(() => {
                node.style.transition = 'all 0.5s ease-out';
                node.style.opacity = '1';
                node.style.transform = 'scale(1)';
            }, index * 100);
        });
    }

    // 更新树信息显示
    updateTreeInfo(treeData) {
        if (!treeData) return;

        const depthElement = document.getElementById('treeDepth');
        const leafCountElement = document.getElementById('leafCount');
        const rootHashElement = document.getElementById('rootHash');

        if (depthElement) {
            depthElement.textContent = treeData.depth || '-';
        }
        
        if (leafCountElement) {
            leafCountElement.textContent = treeData.leafCount || '-';
        }
        
        if (rootHashElement) {
            const hash = treeData.rootHash || '-';
            rootHashElement.textContent = hash.length > 16 ? hash.substring(0, 16) + '...' : hash;
            rootHashElement.title = hash;
        }
    }
}

// 创建全局可视化实例
window.visualizer = null; 