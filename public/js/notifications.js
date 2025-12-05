// 消息通知系统

// 通知类型定义
const NotificationTypes = {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    INFO: 'info',
    SELECTION: 'selection',
    SYSTEM: 'system'
};

// 通知优先级
const NotificationPriority = {
    LOW: 1,
    NORMAL: 2,
    HIGH: 3,
    URGENT: 4
};

// 通知管理器
const NotificationManager = {
    notifications: [],
    maxNotifications: 50,
    autoCloseDelay: 5000,
    
    init() {
        this.createNotificationContainer();
        this.bindEvents();
        this.startPolling();
    },
    
    // 创建通知容器
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    },
    
    // 绑定事件
    bindEvents() {
        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.checkUnreadNotifications();
            }
        });
        
        // 监听窗口焦点
        window.addEventListener('focus', () => {
            this.checkUnreadNotifications();
        });
    },
    
    // 开始轮询检查新通知
    startPolling() {
        setInterval(() => {
            this.fetchNewNotifications();
        }, 30000); // 每30秒检查一次
    },
    
    // 显示通知
    show(notification) {
        const notificationElement = this.createNotificationElement(notification);
        const container = document.getElementById('notification-container');
        
        container.appendChild(notificationElement);
        this.notifications.push(notification);
        
        // 限制通知数量
        if (this.notifications.length > this.maxNotifications) {
            this.removeOldestNotification();
        }
        
        // 自动关闭
        if (notification.autoClose !== false) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.autoCloseDelay || this.autoCloseDelay);
        }
        
        // 播放提示音
        this.playNotificationSound(notification.type);
        
        // 显示桌面通知
        this.showDesktopNotification(notification);
        
        // 更新未读计数
        this.updateUnreadCount();
        
        return notificationElement;
    },
    
    // 创建通知元素
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification notification-${notification.type}`;
        element.dataset.notificationId = notification.id;
        
        const icon = this.getNotificationIcon(notification.type);
        const time = this.formatTime(notification.timestamp);
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-actions">
                        <button class="notification-close" onclick="NotificationManager.remove('${notification.id}')">
                            <i class="el-icon-close"></i>
                        </button>
                    </div>
                </div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-meta">
                    <span class="notification-time">${time}</span>
                    ${notification.priority >= NotificationPriority.HIGH ? '<span class="notification-priority">重要</span>' : ''}
                </div>
            </div>
        `;
        
        // 添加点击事件
        element.addEventListener('click', () => {
            this.handleNotificationClick(notification);
        });
        
        // 添加动画
        element.style.animation = 'slideInRight 0.3s ease-out';
        
        return element;
    },
    
    // 获取通知图标
    getNotificationIcon(type) {
        const icons = {
            [NotificationTypes.SUCCESS]: 'el-icon-success',
            [NotificationTypes.WARNING]: 'el-icon-warning',
            [NotificationTypes.ERROR]: 'el-icon-error',
            [NotificationTypes.INFO]: 'el-icon-info',
            [NotificationTypes.SELECTION]: 'el-icon-s-order',
            [NotificationTypes.SYSTEM]: 'el-icon-setting'
        };
        return icons[type] || 'el-icon-info';
    },
    
    // 格式化时间
    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) { // 1天内
            return Math.floor(diff / 3600000) + '小时前';
        } else {
            return time.toLocaleDateString();
        }
    },
    
    // 移除通知
    remove(notificationId) {
        const element = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (element) {
            element.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                element.remove();
            }, 300);
        }
        
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateUnreadCount();
    },
    
    // 移除最旧的通知
    removeOldestNotification() {
        if (this.notifications.length > 0) {
            const oldest = this.notifications[0];
            this.remove(oldest.id);
        }
    },
    
    // 处理通知点击
    handleNotificationClick(notification) {
        if (notification.action) {
            notification.action();
        }
        
        // 标记为已读
        this.markAsRead(notification.id);
    },
    
    // 标记为已读
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.updateUnreadCount();
        }
    },
    
    // 更新未读计数
    updateUnreadCount() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'block' : 'none';
        }
    },
    
    // 播放提示音
    playNotificationSound(type) {
        if (NotificationManager.isSoundEnabled()) {
            const audio = new Audio(`/sounds/notification-${type}.mp3`);
            audio.volume = 0.3;
            audio.play().catch(() => {
                // 忽略播放失败
            });
        }
    },
    
    // 显示桌面通知
    showDesktopNotification(notification) {
        if (NotificationManager.isDesktopNotificationEnabled() && notification.priority >= NotificationPriority.HIGH) {
            if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.message,
                    icon: '/images/notification-icon.png',
                    tag: notification.id
                });
            }
        }
    },
    
    // 检查未读通知
    checkUnreadNotifications() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        if (unreadCount > 0) {
            this.showUnreadIndicator();
        }
    },
    
    // 显示未读指示器
    showUnreadIndicator() {
        let indicator = document.querySelector('.unread-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'unread-indicator';
            indicator.innerHTML = '<i class="el-icon-bell"></i>';
            document.querySelector('.user-section').appendChild(indicator);
        }
        indicator.style.display = 'block';
    },
    
    // 获取新通知
    async fetchNewNotifications() {
        try {
            const response = await axios.get('/api/notifications/unread');
            if (response.data.success) {
                const notifications = response.data.data;
                notifications.forEach(notification => {
                    this.show(notification);
                });
            }
        } catch (error) {
            console.error('获取通知失败:', error);
        }
    },
    
    // 检查声音设置
    isSoundEnabled() {
        return localStorage.getItem('notificationSound') !== 'false';
    },
    
    // 检查桌面通知设置
    isDesktopNotificationEnabled() {
        return localStorage.getItem('desktopNotification') === 'true';
    },
    
    // 请求桌面通知权限
    async requestDesktopNotificationPermission() {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                localStorage.setItem('desktopNotification', 'true');
                return true;
            }
        }
        return false;
    }
};

// 通知创建器
const NotificationBuilder = {
    // 创建选课成功通知
    createSelectionSuccess(courseName) {
        return {
            id: 'selection-' + Date.now(),
            type: NotificationTypes.SUCCESS,
            title: '选课成功',
            message: `您已成功选择课程：${courseName}`,
            priority: NotificationPriority.NORMAL,
            timestamp: new Date(),
            action: () => {
                // 跳转到我的选课页面
                if (window.app) {
                    window.app.activeMenu = 'my-selections';
                }
            }
        };
    },
    
    // 创建选课失败通知
    createSelectionFailed(courseName, reason) {
        return {
            id: 'selection-failed-' + Date.now(),
            type: NotificationTypes.ERROR,
            title: '选课失败',
            message: `选择课程"${courseName}"失败：${reason}`,
            priority: NotificationPriority.NORMAL,
            timestamp: new Date(),
            action: () => {
                // 跳转到课程浏览页面
                if (window.app) {
                    window.app.activeMenu = 'courses';
                }
            }
        };
    },
    
    // 创建系统维护通知
    createSystemMaintenance(message, startTime, endTime) {
        return {
            id: 'maintenance-' + Date.now(),
            type: NotificationTypes.SYSTEM,
            title: '系统维护通知',
            message: message,
            priority: NotificationPriority.HIGH,
            timestamp: new Date(),
            autoClose: false,
            action: () => {
                // 显示维护详情
                this.$message.info(`维护时间：${startTime} - ${endTime}`);
            }
        };
    },
    
    // 创建选课时间提醒
    createSelectionReminder(timeLeft) {
        return {
            id: 'reminder-' + Date.now(),
            type: NotificationTypes.WARNING,
            title: '选课时间提醒',
            message: `选课还有 ${timeLeft} 结束，请及时完成选课`,
            priority: NotificationPriority.HIGH,
            timestamp: new Date(),
            action: () => {
                // 跳转到选课页面
                if (window.app) {
                    window.app.activeMenu = 'courses';
                }
            }
        };
    },
    
    // 创建成绩发布通知
    createGradePublished(courseName, grade) {
        return {
            id: 'grade-' + Date.now(),
            type: NotificationTypes.INFO,
            title: '成绩发布',
            message: `课程"${courseName}"的成绩已发布，您的成绩：${grade}`,
            priority: NotificationPriority.NORMAL,
            timestamp: new Date(),
            action: () => {
                // 跳转到成绩查看页面
                if (window.app) {
                    window.app.activeMenu = 'grades';
                }
            }
        };
    }
};

// 通知设置管理
const NotificationSettings = {
    // 保存设置
    saveSettings(settings) {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    },
    
    // 获取设置
    getSettings() {
        const defaultSettings = {
            sound: true,
            desktop: false,
            email: false,
            sms: false,
            types: {
                [NotificationTypes.SUCCESS]: true,
                [NotificationTypes.WARNING]: true,
                [NotificationTypes.ERROR]: true,
                [NotificationTypes.INFO]: true,
                [NotificationTypes.SELECTION]: true,
                [NotificationTypes.SYSTEM]: true
            }
        };
        
        const saved = localStorage.getItem('notificationSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    },
    
    // 更新设置
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
    }
};

// 通知历史管理
const NotificationHistory = {
    // 获取通知历史
    async getHistory(page = 1, limit = 20) {
        try {
            const response = await axios.get('/api/notifications/history', {
                params: { page, limit }
            });
            return response.data.data;
        } catch (error) {
            console.error('获取通知历史失败:', error);
            return { notifications: [], total: 0 };
        }
    },
    
    // 标记所有为已读
    async markAllAsRead() {
        try {
            await axios.post('/api/notifications/mark-all-read');
            NotificationManager.notifications.forEach(n => n.read = true);
            NotificationManager.updateUnreadCount();
        } catch (error) {
            console.error('标记所有通知为已读失败:', error);
        }
    },
    
    // 删除通知
    async deleteNotification(notificationId) {
        try {
            await axios.delete(`/api/notifications/${notificationId}`);
            NotificationManager.remove(notificationId);
        } catch (error) {
            console.error('删除通知失败:', error);
        }
    }
};

// 初始化通知系统
document.addEventListener('DOMContentLoaded', function() {
    NotificationManager.init();
    
    // 请求桌面通知权限
    if (Notification.permission === 'default') {
        NotificationManager.requestDesktopNotificationPermission();
    }
});

// 导出通知工具
window.NotificationManager = NotificationManager;
window.NotificationBuilder = NotificationBuilder;
window.NotificationSettings = NotificationSettings;
window.NotificationHistory = NotificationHistory;
window.NotificationTypes = NotificationTypes;
window.NotificationPriority = NotificationPriority;
