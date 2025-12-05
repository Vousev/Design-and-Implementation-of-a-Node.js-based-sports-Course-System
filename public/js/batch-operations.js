// 批量操作组件

// 批量操作类型
const BatchOperationTypes = {
    SELECT_COURSES: 'select_courses',
    DROP_COURSES: 'drop_courses',
    DELETE_COURSES: 'delete_courses',
    PUBLISH_COURSES: 'publish_courses',
    CLOSE_COURSES: 'close_courses',
    DELETE_STUDENTS: 'delete_students',
    RESET_PASSWORDS: 'reset_passwords',
    SEND_NOTIFICATIONS: 'send_notifications',
    EXPORT_DATA: 'export_data',
    IMPORT_DATA: 'import_data'
};

// 批量操作管理器
const BatchOperationManager = {
    selectedItems: new Set(),
    operationType: null,
    isProcessing: false,
    
    init() {
        this.createBatchOperationUI();
        this.bindEvents();
    },
    
    // 创建批量操作UI
    createBatchOperationUI() {
        const container = document.createElement('div');
        container.id = 'batch-operation-container';
        container.className = 'batch-operation-container';
        container.innerHTML = `
            <div class="batch-operation-panel">
                <div class="batch-operation-header">
                    <div class="selected-count">
                        <i class="el-icon-check"></i>
                        <span class="count-text">已选择 0 项</span>
                    </div>
                    <div class="batch-actions">
                        <button class="batch-action-btn" data-action="select-all">
                            <i class="el-icon-check"></i> 全选
                        </button>
                        <button class="batch-action-btn" data-action="clear-selection">
                            <i class="el-icon-close"></i> 清空
                        </button>
                    </div>
                </div>
                <div class="batch-operation-content">
                    <div class="operation-buttons">
                        <button class="operation-btn" data-operation="select-courses" style="display: none;">
                            <i class="el-icon-plus"></i> 批量选课
                        </button>
                        <button class="operation-btn" data-operation="drop-courses" style="display: none;">
                            <i class="el-icon-minus"></i> 批量退课
                        </button>
                        <button class="operation-btn" data-operation="delete-courses" style="display: none;">
                            <i class="el-icon-delete"></i> 批量删除
                        </button>
                        <button class="operation-btn" data-operation="publish-courses" style="display: none;">
                            <i class="el-icon-upload"></i> 批量发布
                        </button>
                        <button class="operation-btn" data-operation="close-courses" style="display: none;">
                            <i class="el-icon-lock"></i> 批量关闭
                        </button>
                        <button class="operation-btn" data-operation="export-data" style="display: none;">
                            <i class="el-icon-download"></i> 批量导出
                        </button>
                        <button class="operation-btn" data-operation="send-notifications" style="display: none;">
                            <i class="el-icon-message"></i> 批量通知
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
    },
    
    // 绑定事件
    bindEvents() {
        // 全选/清空按钮
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="select-all"]')) {
                this.selectAll();
            } else if (e.target.closest('[data-action="clear-selection"]')) {
                this.clearSelection();
            } else if (e.target.closest('[data-operation]')) {
                const operation = e.target.closest('[data-operation]').dataset.operation;
                this.executeBatchOperation(operation);
            }
        });
        
        // 监听选择变化
        document.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.classList.contains('batch-checkbox')) {
                this.handleItemSelection(e.target);
            }
        });
    },
    
    // 显示批量操作面板
    show(operationType, context = {}) {
        this.operationType = operationType;
        this.context = context;
        
        const container = document.getElementById('batch-operation-container');
        const panel = container.querySelector('.batch-operation-panel');
        
        // 显示相关操作按钮
        this.showRelevantButtons(operationType);
        
        // 显示面板
        panel.classList.add('show');
        
        // 更新选择计数
        this.updateSelectionCount();
    },
    
    // 隐藏批量操作面板
    hide() {
        const container = document.getElementById('batch-operation-container');
        const panel = container.querySelector('.batch-operation-panel');
        panel.classList.remove('show');
        
        this.clearSelection();
    },
    
    // 显示相关操作按钮
    showRelevantButtons(operationType) {
        const buttons = document.querySelectorAll('.operation-btn');
        buttons.forEach(btn => btn.style.display = 'none');
        
        const relevantButtons = this.getRelevantButtons(operationType);
        relevantButtons.forEach(operation => {
            const btn = document.querySelector(`[data-operation="${operation}"]`);
            if (btn) btn.style.display = 'inline-flex';
        });
    },
    
    // 获取相关操作按钮
    getRelevantButtons(operationType) {
        const buttonMap = {
            'courses': ['select-courses', 'drop-courses', 'delete-courses', 'publish-courses', 'close-courses', 'export-data'],
            'students': ['delete-students', 'reset-passwords', 'send-notifications', 'export-data'],
            'teachers': ['delete-teachers', 'reset-passwords', 'send-notifications', 'export-data'],
            'selections': ['drop-courses', 'export-data'],
            'notifications': ['send-notifications', 'export-data']
        };
        
        return buttonMap[operationType] || [];
    },
    
    // 处理项目选择
    handleItemSelection(checkbox) {
        const itemId = checkbox.dataset.itemId;
        
        if (checkbox.checked) {
            this.selectedItems.add(itemId);
        } else {
            this.selectedItems.delete(itemId);
        }
        
        this.updateSelectionCount();
        this.updateBatchCheckbox();
    },
    
    // 全选
    selectAll() {
        const checkboxes = document.querySelectorAll('.batch-checkbox:not(:checked)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedItems.add(checkbox.dataset.itemId);
        });
        
        this.updateSelectionCount();
        this.updateBatchCheckbox();
    },
    
    // 清空选择
    clearSelection() {
        const checkboxes = document.querySelectorAll('.batch-checkbox:checked');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.selectedItems.clear();
        this.updateSelectionCount();
        this.updateBatchCheckbox();
    },
    
    // 更新选择计数
    updateSelectionCount() {
        const countText = document.querySelector('.count-text');
        if (countText) {
            countText.textContent = `已选择 ${this.selectedItems.size} 项`;
        }
    },
    
    // 更新批量复选框状态
    updateBatchCheckbox() {
        const batchCheckbox = document.querySelector('.batch-select-all');
        if (batchCheckbox) {
            const totalItems = document.querySelectorAll('.batch-checkbox').length;
            const selectedCount = this.selectedItems.size;
            
            if (selectedCount === 0) {
                batchCheckbox.indeterminate = false;
                batchCheckbox.checked = false;
            } else if (selectedCount === totalItems) {
                batchCheckbox.indeterminate = false;
                batchCheckbox.checked = true;
            } else {
                batchCheckbox.indeterminate = true;
                batchCheckbox.checked = false;
            }
        }
    },
    
    // 执行批量操作
    async executeBatchOperation(operation) {
        if (this.selectedItems.size === 0) {
            this.$message.warning('请先选择要操作的项目');
            return;
        }
        
        if (this.isProcessing) {
            this.$message.warning('正在处理中，请稍候');
            return;
        }
        
        try {
            this.isProcessing = true;
            
            switch (operation) {
                case 'select-courses':
                    await this.batchSelectCourses();
                    break;
                case 'drop-courses':
                    await this.batchDropCourses();
                    break;
                case 'delete-courses':
                    await this.batchDeleteCourses();
                    break;
                case 'publish-courses':
                    await this.batchPublishCourses();
                    break;
                case 'close-courses':
                    await this.batchCloseCourses();
                    break;
                case 'export-data':
                    await this.batchExportData();
                    break;
                case 'send-notifications':
                    await this.batchSendNotifications();
                    break;
                default:
                    this.$message.error('不支持的操作类型');
            }
        } catch (error) {
            this.$message.error('批量操作失败：' + error.message);
            console.error('批量操作失败:', error);
        } finally {
            this.isProcessing = false;
        }
    },
    
    // 批量选课
    async batchSelectCourses() {
        const courseIds = Array.from(this.selectedItems);
        
        const result = await this.$confirm(
            `确定要选择这 ${courseIds.length} 门课程吗？`,
            '批量选课确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );
        
        if (result) {
            const response = await axios.post('/api/batch/select-courses', {
                courseIds: courseIds
            });
            
            if (response.data.success) {
                this.$message.success(`成功选择 ${response.data.data.successCount} 门课程`);
                this.clearSelection();
                this.refreshCurrentPage();
            } else {
                this.$message.error(response.data.message);
            }
        }
    },
    
    // 批量退课
    async batchDropCourses() {
        const selectionIds = Array.from(this.selectedItems);
        
        const result = await this.$confirm(
            `确定要退选这 ${selectionIds.length} 门课程吗？`,
            '批量退课确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );
        
        if (result) {
            const response = await axios.post('/api/batch/drop-courses', {
                selectionIds: selectionIds
            });
            
            if (response.data.success) {
                this.$message.success(`成功退选 ${response.data.data.successCount} 门课程`);
                this.clearSelection();
                this.refreshCurrentPage();
            } else {
                this.$message.error(response.data.message);
            }
        }
    },
    
    // 批量删除课程
    async batchDeleteCourses() {
        const courseIds = Array.from(this.selectedItems);
        
        const result = await this.$confirm(
            `确定要删除这 ${courseIds.length} 门课程吗？此操作不可恢复！`,
            '批量删除确认',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'error'
            }
        );
        
        if (result) {
            const response = await axios.post('/api/batch/delete-courses', {
                courseIds: courseIds
            });
            
            if (response.data.success) {
                this.$message.success(`成功删除 ${response.data.data.successCount} 门课程`);
                this.clearSelection();
                this.refreshCurrentPage();
            } else {
                this.$message.error(response.data.message);
            }
        }
    },
    
    // 批量发布课程
    async batchPublishCourses() {
        const courseIds = Array.from(this.selectedItems);
        
        const response = await axios.post('/api/batch/publish-courses', {
            courseIds: courseIds
        });
        
        if (response.data.success) {
            this.$message.success(`成功发布 ${response.data.data.successCount} 门课程`);
            this.clearSelection();
            this.refreshCurrentPage();
        } else {
            this.$message.error(response.data.message);
        }
    },
    
    // 批量关闭课程
    async batchCloseCourses() {
        const courseIds = Array.from(this.selectedItems);
        
        const response = await axios.post('/api/batch/close-courses', {
            courseIds: courseIds
        });
        
        if (response.data.success) {
            this.$message.success(`成功关闭 ${response.data.data.successCount} 门课程`);
            this.clearSelection();
            this.refreshCurrentPage();
        } else {
            this.$message.error(response.data.message);
        }
    },
    
    // 批量导出数据
    async batchExportData() {
        const itemIds = Array.from(this.selectedItems);
        
        const response = await axios.post('/api/batch/export-data', {
            itemIds: itemIds,
            type: this.operationType
        }, {
            responseType: 'blob'
        });
        
        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = `批量导出_${this.operationType}_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.$message.success('数据导出成功');
    },
    
    // 批量发送通知
    async batchSendNotifications() {
        const itemIds = Array.from(this.selectedItems);
        
        // 显示通知编辑对话框
        this.showNotificationDialog(itemIds);
    },
    
    // 显示通知对话框
    showNotificationDialog(itemIds) {
        const dialog = document.createElement('div');
        dialog.className = 'notification-dialog';
        dialog.innerHTML = `
            <div class="notification-dialog-content">
                <div class="notification-dialog-header">
                    <h3>批量发送通知</h3>
                    <button class="notification-dialog-close" onclick="this.closest('.notification-dialog').remove()">
                        <i class="el-icon-close"></i>
                    </button>
                </div>
                <div class="notification-dialog-body">
                    <div class="form-group">
                        <label>通知标题：</label>
                        <input type="text" class="notification-title" placeholder="请输入通知标题">
                    </div>
                    <div class="form-group">
                        <label>通知内容：</label>
                        <textarea class="notification-content" placeholder="请输入通知内容" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label>通知类型：</label>
                        <select class="notification-type">
                            <option value="info">信息通知</option>
                            <option value="warning">警告通知</option>
                            <option value="error">错误通知</option>
                            <option value="success">成功通知</option>
                        </select>
                    </div>
                </div>
                <div class="notification-dialog-footer">
                    <button class="el-button" onclick="this.closest('.notification-dialog').remove()">取消</button>
                    <button class="el-button el-button--primary" onclick="BatchOperationManager.sendBatchNotifications(this)">发送</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 存储itemIds
        dialog.dataset.itemIds = JSON.stringify(itemIds);
    },
    
    // 发送批量通知
    async sendBatchNotifications(button) {
        const dialog = button.closest('.notification-dialog');
        const itemIds = JSON.parse(dialog.dataset.itemIds);
        const title = dialog.querySelector('.notification-title').value;
        const content = dialog.querySelector('.notification-content').value;
        const type = dialog.querySelector('.notification-type').value;
        
        if (!title || !content) {
            this.$message.warning('请填写通知标题和内容');
            return;
        }
        
        try {
            const response = await axios.post('/api/batch/send-notifications', {
                itemIds: itemIds,
                title: title,
                content: content,
                type: type
            });
            
            if (response.data.success) {
                this.$message.success(`成功发送 ${response.data.data.successCount} 条通知`);
                dialog.remove();
                this.clearSelection();
            } else {
                this.$message.error(response.data.message);
            }
        } catch (error) {
            this.$message.error('发送通知失败');
            console.error('发送通知失败:', error);
        }
    },
    
    // 刷新当前页面
    refreshCurrentPage() {
        if (window.app && window.app.refreshCurrentPageData) {
            window.app.refreshCurrentPageData();
        }
    }
};

// 表格批量操作组件
const TableBatchOperations = {
    // 为表格添加批量操作功能
    enhanceTable(tableId, operationType) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        // 添加全选复选框到表头
        this.addSelectAllCheckbox(table);
        
        // 为每行添加复选框
        this.addRowCheckboxes(table);
        
        // 显示批量操作面板
        BatchOperationManager.show(operationType);
    },
    
    // 添加全选复选框
    addSelectAllCheckbox(table) {
        const thead = table.querySelector('thead tr');
        if (!thead) return;
        
        const th = document.createElement('th');
        th.innerHTML = `
            <input type="checkbox" class="batch-select-all" onchange="TableBatchOperations.handleSelectAll(this)">
        `;
        th.style.width = '50px';
        thead.insertBefore(th, thead.firstChild);
    },
    
    // 添加行复选框
    addRowCheckboxes(table) {
        const tbody = table.querySelector('tbody');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const td = document.createElement('td');
            const itemId = this.getItemId(row);
            td.innerHTML = `
                <input type="checkbox" class="batch-checkbox" data-item-id="${itemId}" onchange="BatchOperationManager.handleItemSelection(this)">
            `;
            td.style.width = '50px';
            row.insertBefore(td, row.firstChild);
        });
    },
    
    // 获取行项目ID
    getItemId(row) {
        // 尝试从data-id属性获取
        if (row.dataset.id) {
            return row.dataset.id;
        }
        
        // 尝试从第一个单元格的data-id获取
        const firstCell = row.querySelector('td[data-id]');
        if (firstCell) {
            return firstCell.dataset.id;
        }
        
        // 生成唯一ID
        return 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },
    
    // 处理全选
    handleSelectAll(checkbox) {
        const checkboxes = document.querySelectorAll('.batch-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = checkbox.checked;
            if (checkbox.checked) {
                BatchOperationManager.selectedItems.add(cb.dataset.itemId);
            } else {
                BatchOperationManager.selectedItems.delete(cb.dataset.itemId);
            }
        });
        
        BatchOperationManager.updateSelectionCount();
    }
};

// 卡片批量操作组件
const CardBatchOperations = {
    // 为卡片列表添加批量操作功能
    enhanceCardList(containerId, operationType) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 为每个卡片添加复选框
        this.addCardCheckboxes(container);
        
        // 显示批量操作面板
        BatchOperationManager.show(operationType);
    },
    
    // 添加卡片复选框
    addCardCheckboxes(container) {
        const cards = container.querySelectorAll('.course-card, .student-card, .teacher-card');
        cards.forEach(card => {
            const checkbox = document.createElement('div');
            checkbox.className = 'card-checkbox';
            checkbox.innerHTML = `
                <input type="checkbox" class="batch-checkbox" data-item-id="${this.getCardId(card)}" onchange="BatchOperationManager.handleItemSelection(this)">
            `;
            card.style.position = 'relative';
            card.appendChild(checkbox);
        });
    },
    
    // 获取卡片ID
    getCardId(card) {
        if (card.dataset.id) {
            return card.dataset.id;
        }
        
        const title = card.querySelector('.course-title, .student-name, .teacher-name');
        if (title) {
            return title.textContent.trim().replace(/\s+/g, '-').toLowerCase();
        }
        
        return 'card-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
};

// 初始化批量操作系统
document.addEventListener('DOMContentLoaded', function() {
    BatchOperationManager.init();
});

// 导出批量操作工具
window.BatchOperationManager = BatchOperationManager;
window.TableBatchOperations = TableBatchOperations;
window.CardBatchOperations = CardBatchOperations;
window.BatchOperationTypes = BatchOperationTypes;
