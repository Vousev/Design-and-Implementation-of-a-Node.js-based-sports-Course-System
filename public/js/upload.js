// 文件上传组件

// 文件类型定义
const FileTypes = {
    SYLLABUS: 'syllabus',
    COURSE_MATERIAL: 'course_material',
    ASSIGNMENT: 'assignment',
    GRADE_SHEET: 'grade_sheet',
    AVATAR: 'avatar'
};

// 文件大小限制 (MB)
const FileSizeLimits = {
    [FileTypes.SYLLABUS]: 10,
    [FileTypes.COURSE_MATERIAL]: 50,
    [FileTypes.ASSIGNMENT]: 20,
    [FileTypes.GRADE_SHEET]: 5,
    [FileTypes.AVATAR]: 2
};

// 允许的文件扩展名
const AllowedExtensions = {
    [FileTypes.SYLLABUS]: ['.pdf', '.doc', '.docx', '.txt'],
    [FileTypes.COURSE_MATERIAL]: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.zip', '.rar'],
    [FileTypes.ASSIGNMENT]: ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png'],
    [FileTypes.GRADE_SHEET]: ['.xls', '.xlsx', '.csv'],
    [FileTypes.AVATAR]: ['.jpg', '.jpeg', '.png', '.gif']
};

// 文件上传管理器
const FileUploadManager = {
    uploads: new Map(),
    
    init() {
        this.createUploadContainer();
        this.bindEvents();
    },
    
    // 创建上传容器
    createUploadContainer() {
        const container = document.createElement('div');
        container.id = 'file-upload-container';
        container.className = 'file-upload-container';
        document.body.appendChild(container);
    },
    
    // 绑定事件
    bindEvents() {
        // 监听拖拽事件
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
        document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    },
    
    // 处理拖拽悬停
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.body.classList.add('drag-over');
    },
    
    // 处理拖拽离开
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!e.relatedTarget || !e.relatedTarget.closest('.file-upload-container')) {
            document.body.classList.remove('drag-over');
        }
    },
    
    // 处理文件拖拽
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.body.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            this.showUploadDialog(files);
        }
    },
    
    // 显示上传对话框
    showUploadDialog(files, options = {}) {
        const dialog = this.createUploadDialog(files, options);
        const container = document.getElementById('file-upload-container');
        container.appendChild(dialog);
        
        // 显示对话框
        setTimeout(() => {
            dialog.classList.add('show');
        }, 10);
    },
    
    // 创建上传对话框
    createUploadDialog(files, options) {
        const dialog = document.createElement('div');
        dialog.className = 'file-upload-dialog';
        dialog.innerHTML = `
            <div class="upload-dialog-content">
                <div class="upload-dialog-header">
                    <h3>文件上传</h3>
                    <button class="upload-dialog-close" onclick="this.closest('.file-upload-dialog').remove()">
                        <i class="el-icon-close"></i>
                    </button>
                </div>
                <div class="upload-dialog-body">
                    <div class="upload-file-list">
                        ${files.map(file => this.createFileItem(file)).join('')}
                    </div>
                    <div class="upload-options">
                        <div class="upload-option">
                            <label>文件类型：</label>
                            <select class="upload-file-type">
                                <option value="${FileTypes.SYLLABUS}">教学大纲</option>
                                <option value="${FileTypes.COURSE_MATERIAL}">课程资料</option>
                                <option value="${FileTypes.ASSIGNMENT}">作业文件</option>
                                <option value="${FileTypes.GRADE_SHEET}">成绩单</option>
                                <option value="${FileTypes.AVATAR}">头像</option>
                            </select>
                        </div>
                        <div class="upload-option">
                            <label>关联课程：</label>
                            <select class="upload-course-id">
                                <option value="">请选择课程</option>
                            </select>
                        </div>
                        <div class="upload-option">
                            <label>文件描述：</label>
                            <textarea class="upload-description" placeholder="请输入文件描述（可选）"></textarea>
                        </div>
                    </div>
                </div>
                <div class="upload-dialog-footer">
                    <button class="el-button" onclick="this.closest('.file-upload-dialog').remove()">取消</button>
                    <button class="el-button el-button--primary" onclick="FileUploadManager.startUpload(this)">开始上传</button>
                </div>
            </div>
        `;
        
        // 加载课程列表
        this.loadCourseOptions(dialog);
        
        return dialog;
    },
    
    // 创建文件项
    createFileItem(file) {
        const fileId = 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const fileSize = this.formatFileSize(file.size);
        const isValid = this.validateFile(file);
        
        return `
            <div class="upload-file-item ${isValid ? '' : 'invalid'}" data-file-id="${fileId}">
                <div class="file-icon">
                    <i class="${this.getFileIcon(file.name)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                    ${!isValid ? '<div class="file-error">文件类型或大小不符合要求</div>' : ''}
                </div>
                <div class="file-actions">
                    <button class="file-remove" onclick="FileUploadManager.removeFile('${fileId}')">
                        <i class="el-icon-close"></i>
                    </button>
                </div>
                <div class="file-progress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">0%</div>
                </div>
            </div>
        `;
    },
    
    // 获取文件图标
    getFileIcon(fileName) {
        const ext = fileName.toLowerCase().split('.').pop();
        const iconMap = {
            'pdf': 'el-icon-document',
            'doc': 'el-icon-document',
            'docx': 'el-icon-document',
            'txt': 'el-icon-document',
            'ppt': 'el-icon-present',
            'pptx': 'el-icon-present',
            'xls': 'el-icon-s-grid',
            'xlsx': 'el-icon-s-grid',
            'csv': 'el-icon-s-grid',
            'jpg': 'el-icon-picture',
            'jpeg': 'el-icon-picture',
            'png': 'el-icon-picture',
            'gif': 'el-icon-picture',
            'zip': 'el-icon-folder',
            'rar': 'el-icon-folder'
        };
        return iconMap[ext] || 'el-icon-document';
    },
    
    // 验证文件
    validateFile(file) {
        const ext = '.' + file.name.toLowerCase().split('.').pop();
        const fileType = FileTypes.SYLLABUS; // 默认类型，实际应该根据选择的类型验证
        
        // 检查文件大小
        const maxSize = FileSizeLimits[fileType] * 1024 * 1024;
        if (file.size > maxSize) {
            return false;
        }
        
        // 检查文件扩展名
        const allowedExts = AllowedExtensions[fileType];
        if (!allowedExts.includes(ext)) {
            return false;
        }
        
        return true;
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 加载课程选项
    async loadCourseOptions(dialog) {
        try {
            const response = await axios.get('/api/courses/my');
            const courseSelect = dialog.querySelector('.upload-course-id');
            
            response.data.data.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                courseSelect.appendChild(option);
            });
        } catch (error) {
            console.error('加载课程列表失败:', error);
        }
    },
    
    // 移除文件
    removeFile(fileId) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (fileItem) {
            fileItem.remove();
        }
    },
    
    // 开始上传
    async startUpload(button) {
        const dialog = button.closest('.file-upload-dialog');
        const fileItems = dialog.querySelectorAll('.upload-file-item:not(.invalid)');
        const fileType = dialog.querySelector('.upload-file-type').value;
        const courseId = dialog.querySelector('.upload-course-id').value;
        const description = dialog.querySelector('.upload-description').value;
        
        if (fileItems.length === 0) {
            this.$message.warning('没有有效的文件可以上传');
            return;
        }
        
        if (!courseId && fileType !== FileTypes.AVATAR) {
            this.$message.warning('请选择关联课程');
            return;
        }
        
        button.disabled = true;
        button.textContent = '上传中...';
        
        try {
            for (const fileItem of fileItems) {
                await this.uploadFile(fileItem, fileType, courseId, description);
            }
            
            this.$message.success('文件上传成功');
            dialog.remove();
            
            // 刷新相关页面
            if (window.app && window.app.refreshCurrentPageData) {
                window.app.refreshCurrentPageData();
            }
        } catch (error) {
            this.$message.error('文件上传失败');
            console.error('上传失败:', error);
        } finally {
            button.disabled = false;
            button.textContent = '开始上传';
        }
    },
    
    // 上传单个文件
    async uploadFile(fileItem, fileType, courseId, description) {
        const fileId = fileItem.dataset.fileId;
        const file = this.uploads.get(fileId);
        
        if (!file) {
            throw new Error('文件不存在');
        }
        
        // 显示进度条
        const progressBar = fileItem.querySelector('.file-progress');
        const progressFill = fileItem.querySelector('.progress-fill');
        const progressText = fileItem.querySelector('.progress-text');
        
        progressBar.style.display = 'block';
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);
        formData.append('courseId', courseId);
        formData.append('description', description);
        
        const response = await axios.post('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                progressFill.style.width = percentCompleted + '%';
                progressText.textContent = percentCompleted + '%';
            }
        });
        
        if (response.data.success) {
            fileItem.classList.add('uploaded');
            progressText.textContent = '上传完成';
        } else {
            throw new Error(response.data.message);
        }
    }
};

// 文件预览组件
const FilePreview = {
    // 显示文件预览
    showPreview(file) {
        const preview = this.createPreviewDialog(file);
        document.body.appendChild(preview);
        
        setTimeout(() => {
            preview.classList.add('show');
        }, 10);
    },
    
    // 创建预览对话框
    createPreviewDialog(file) {
        const dialog = document.createElement('div');
        dialog.className = 'file-preview-dialog';
        dialog.innerHTML = `
            <div class="preview-dialog-content">
                <div class="preview-dialog-header">
                    <h3>文件预览</h3>
                    <button class="preview-dialog-close" onclick="this.closest('.file-preview-dialog').remove()">
                        <i class="el-icon-close"></i>
                    </button>
                </div>
                <div class="preview-dialog-body">
                    <div class="preview-content">
                        ${this.getPreviewContent(file)}
                    </div>
                </div>
                <div class="preview-dialog-footer">
                    <button class="el-button" onclick="FilePreview.downloadFile('${file.id}')">下载</button>
                    <button class="el-button el-button--primary" onclick="this.closest('.file-preview-dialog').remove()">关闭</button>
                </div>
            </div>
        `;
        
        return dialog;
    },
    
    // 获取预览内容
    getPreviewContent(file) {
        const ext = file.name.toLowerCase().split('.').pop();
        
        switch (ext) {
            case 'pdf':
                return `<iframe src="${file.url}" width="100%" height="500px"></iframe>`;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return `<img src="${file.url}" style="max-width: 100%; max-height: 500px;">`;
            case 'txt':
                return `<pre style="white-space: pre-wrap; font-family: monospace;">${file.content || '无法预览文本内容'}</pre>`;
            default:
                return `
                    <div class="preview-placeholder">
                        <i class="el-icon-document" style="font-size: 48px; color: #ddd;"></i>
                        <p>此文件类型不支持预览</p>
                        <p>请下载后查看</p>
                    </div>
                `;
        }
    },
    
    // 下载文件
    async downloadFile(fileId) {
        try {
            const response = await axios.get(`/api/files/${fileId}/download`);
            const url = response.data.data.url;
            
            const link = document.createElement('a');
            link.href = url;
            link.download = response.data.data.name;
            link.click();
        } catch (error) {
            this.$message.error('下载失败');
            console.error('下载失败:', error);
        }
    }
};

// 文件管理组件
const FileManager = {
    // 显示文件列表
    async showFileList(courseId) {
        try {
            const response = await axios.get(`/api/files?courseId=${courseId}`);
            const files = response.data.data;
            
            this.renderFileList(files);
        } catch (error) {
            console.error('获取文件列表失败:', error);
        }
    },
    
    // 渲染文件列表
    renderFileList(files) {
        const container = document.getElementById('file-list-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="file-list-header">
                <h3>文件列表</h3>
                <button class="el-button el-button--primary" onclick="FileUploadManager.showUploadDialog([])">
                    <i class="el-icon-upload"></i> 上传文件
                </button>
            </div>
            <div class="file-list-content">
                ${files.map(file => this.createFileListItem(file)).join('')}
            </div>
        `;
    },
    
    // 创建文件列表项
    createFileListItem(file) {
        return `
            <div class="file-list-item">
                <div class="file-icon">
                    <i class="${this.getFileIcon(file.name)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                        <span class="file-date">${this.formatDate(file.created_at)}</span>
                        <span class="file-type">${file.type}</span>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="el-button el-button--text" onclick="FilePreview.showPreview(${JSON.stringify(file).replace(/"/g, '&quot;')})">
                        <i class="el-icon-view"></i> 预览
                    </button>
                    <button class="el-button el-button--text" onclick="FilePreview.downloadFile('${file.id}')">
                        <i class="el-icon-download"></i> 下载
                    </button>
                    <button class="el-button el-button--text el-button--danger" onclick="FileManager.deleteFile('${file.id}')">
                        <i class="el-icon-delete"></i> 删除
                    </button>
                </div>
            </div>
        `;
    },
    
    // 删除文件
    async deleteFile(fileId) {
        try {
            await this.$confirm('确定要删除这个文件吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            });
            
            await axios.delete(`/api/files/${fileId}`);
            this.$message.success('文件删除成功');
            
            // 刷新文件列表
            this.showFileList();
        } catch (error) {
            if (error !== 'cancel') {
                this.$message.error('删除失败');
                console.error('删除失败:', error);
            }
        }
    },
    
    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 获取文件图标
    getFileIcon(fileName) {
        const ext = fileName.toLowerCase().split('.').pop();
        const iconMap = {
            'pdf': 'el-icon-document',
            'doc': 'el-icon-document',
            'docx': 'el-icon-document',
            'txt': 'el-icon-document',
            'ppt': 'el-icon-present',
            'pptx': 'el-icon-present',
            'xls': 'el-icon-s-grid',
            'xlsx': 'el-icon-s-grid',
            'csv': 'el-icon-s-grid',
            'jpg': 'el-icon-picture',
            'jpeg': 'el-icon-picture',
            'png': 'el-icon-picture',
            'gif': 'el-icon-picture',
            'zip': 'el-icon-folder',
            'rar': 'el-icon-folder'
        };
        return iconMap[ext] || 'el-icon-document';
    }
};

// 初始化文件上传系统
document.addEventListener('DOMContentLoaded', function() {
    FileUploadManager.init();
});

// 导出文件上传工具
window.FileUploadManager = FileUploadManager;
window.FilePreview = FilePreview;
window.FileManager = FileManager;
window.FileTypes = FileTypes;
