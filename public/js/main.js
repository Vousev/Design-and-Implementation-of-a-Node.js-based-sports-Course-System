// 配置axios默认设置
axios.defaults.baseURL = '/api';
axios.defaults.timeout = 10000;

// 请求拦截器 - 添加认证token
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理通用错误
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
            // token过期或无效，清除本地存储并跳转到登录
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            app.isLoggedIn = false;
            app.userInfo = {};
            app.$message.error('登录已过期，请重新登录');
        }
        return Promise.reject(error);
    }
);

// Vue应用实例
const app = new Vue({
    el: '#app',
    data() {
        return {
            // 用户状态
            isLoggedIn: false,
            userInfo: {},
            
            // 页面状态
            activeMenu: 'courses',
            
            // 登录相关
            showLoginDialog: false,
            loginLoading: false,
            loginForm: {
                username: '',
                password: ''
            },
            loginRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ]
            },
            
            // 课程相关数据
            courses: [],
            coursesLoading: false,
            categories: [],
            teachers: [],
            venues: [],
            courseFilters: {
                category_id: '',
                teacher_id: '',
                venue_id: '',
                day_of_week: '',
                search: ''
            },
            coursePagination: {
                current_page: 1,
                per_page: 9,
                total: 0,
                total_pages: 0
            },
            
            // 选课相关数据
            mySelections: [],
            selectionsLoading: false,
            selectionTab: 'all',
            
            // 收藏相关数据
            favoriteCourses: [],
            favoritesLoading: false,
            
            // 历史记录数据
            selectionHistory: [],
            historyLoading: false,
            
            // 课程详情
            selectedCourse: null,
            showCourseDetailDialog: false,
            
            // 个人信息相关
            showProfileDialog: false,
            profileLoading: false,
            profileForm: {
                student_id: '',
                username: '',
                real_name: '',
                gender: '',
                email: '',
                phone: '',
                grade: '',
                major: '',
                class_name: '',
                credit_limit: 0,
                total_credits: 0,
                selected_courses_count: 0
            },
            profileRules: {
                real_name: [
                    { required: true, message: '请输入真实姓名', trigger: 'blur' }
                ],
                email: [
                    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
                ],
                phone: [
                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
                ]
            },
            
            // 修改密码相关
            showPasswordDialog: false,
            passwordLoading: false,
            passwordForm: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            passwordRules: {
                oldPassword: [
                    { required: true, message: '请输入旧密码', trigger: 'blur' }
                ],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请再次输入新密码', trigger: 'blur' },
                    { 
                        validator: (rule, value, callback) => {
                            if (value !== this.passwordForm.newPassword) {
                                callback(new Error('两次输入的密码不一致'));
                            } else {
                                callback();
                            }
                        }, 
                        trigger: 'blur' 
                    }
                ]
            }
        };
    },
    
    mounted() {
        this.initApp();
    },
    
    methods: {
        // 初始化应用
        async initApp() {
            // 检查本地存储的登录状态
            const token = localStorage.getItem('token');
            const userInfo = localStorage.getItem('userInfo');
            
            if (token && userInfo) {
                this.isLoggedIn = true;
                this.userInfo = JSON.parse(userInfo);
                
                // 验证token是否有效
                try {
                    await this.getCurrentUser();
                } catch (error) {
                    // token无效，清除登录状态
                    this.logout();
                }
            }
            
            // 加载基础数据
            await this.loadCategories();
            await this.loadTeachers();
            await this.loadVenues();
            await this.loadCourses();
        },
        
        // 菜单选择处理
        handleMenuSelect(key) {
            this.activeMenu = key;
            
            switch (key) {
                case 'courses':
                    this.loadCourses();
                    break;
                case 'my-selections':
                    this.loadMySelections();
                    break;
                case 'favorites':
                    this.loadFavoriteCourses();
                    break;
                case 'history':
                    this.loadSelectionHistory();
                    break;
            }
        },
        
        // 用户下拉菜单处理
        handleUserCommand(command) {
            switch (command) {
                case 'profile':
                    this.showProfile();
                    break;
                case 'password':
                    this.showChangePassword();
                    break;
                case 'logout':
                    this.logout();
                    break;
            }
        },
        
        // 显示个人信息对话框
        async showProfile() {
            try {
                // 获取最新的用户信息
                await this.getCurrentUser();
                
                // 填充表单数据
                this.profileForm = {
                    student_id: this.userInfo.student_id || '',
                    username: this.userInfo.username || '',
                    real_name: this.userInfo.real_name || '',
                    gender: this.userInfo.gender || '',
                    email: this.userInfo.email || '',
                    phone: this.userInfo.phone || '',
                    grade: this.userInfo.grade || '',
                    major: this.userInfo.major || '',
                    class_name: this.userInfo.class_name || '',
                    credit_limit: this.userInfo.credit_limit || 0,
                    total_credits: this.userInfo.total_credits || 0,
                    selected_courses_count: this.userInfo.selected_courses_count || 0
                };
                
                this.showProfileDialog = true;
            } catch (error) {
                console.error('获取个人信息失败:', error);
                this.$message.error('获取个人信息失败');
            }
        },
        
        // 更新个人信息
        async handleUpdateProfile() {
            try {
                await this.$refs.profileForm.validate();
                
                this.profileLoading = true;
                const response = await axios.put('/auth/profile', {
                    real_name: this.profileForm.real_name,
                    gender: this.profileForm.gender,
                    email: this.profileForm.email,
                    phone: this.profileForm.phone
                });
                
                if (response.data.success) {
                    this.$message.success('个人信息更新成功');
                    
                    // 更新本地用户信息
                    await this.getCurrentUser();
                    
                    // 关闭对话框
                    this.showProfileDialog = false;
                } else {
                    this.$message.error(response.data.message || '更新失败');
                }
            } catch (error) {
                if (error.response) {
                    console.error('更新个人信息失败:', error);
                    this.$message.error(error.response?.data?.message || '更新失败');
                }
            } finally {
                this.profileLoading = false;
            }
        },
        
        // 显示修改密码对话框
        showChangePassword() {
            this.passwordForm = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            
            // 重置验证
            if (this.$refs.passwordForm) {
                this.$refs.passwordForm.resetFields();
            }
            
            this.showPasswordDialog = true;
        },
        
        // 修改密码
        async handleChangePassword() {
            try {
                await this.$refs.passwordForm.validate();
                
                this.passwordLoading = true;
                const response = await axios.put('/auth/password', {
                    oldPassword: this.passwordForm.oldPassword,
                    newPassword: this.passwordForm.newPassword
                });
                
                if (response.data.success) {
                    this.$message.success('密码修改成功，请重新登录');
                    
                    // 关闭对话框
                    this.showPasswordDialog = false;
                    
                    // 退出登录
                    setTimeout(() => {
                        this.logout();
                    }, 1500);
                } else {
                    this.$message.error(response.data.message || '修改失败');
                }
            } catch (error) {
                if (error.response) {
                    console.error('修改密码失败:', error);
                    this.$message.error(error.response?.data?.message || '修改失败');
                }
            } finally {
                this.passwordLoading = false;
            }
        },
        
        // 登录处理
        async handleLogin() {
            try {
                await this.$refs.loginForm.validate();
                
                this.loginLoading = true;
                const response = await axios.post('/auth/login', this.loginForm);
                
                if (response.data.success) {
                    const { token, user } = response.data.data;
                    
                    // 保存到本地存储
                    localStorage.setItem('token', token);
                    localStorage.setItem('userInfo', JSON.stringify(user));
                    
                    // 更新应用状态
                    this.isLoggedIn = true;
                    this.userInfo = user;
                    this.showLoginDialog = false;
                    
                    // 重置登录表单
                    this.loginForm = { username: '', password: '' };
                    this.$refs.loginForm.resetFields();
                    
                    this.$message.success('登录成功');
                    
                    // 刷新当前页面数据
                    this.refreshCurrentPageData();
                } else {
                    this.$message.error(response.data.message || '登录失败');
                }
            } catch (error) {
                console.error('登录错误:', error);
                this.$message.error(error.response?.data?.message || '登录失败');
            } finally {
                this.loginLoading = false;
            }
        },
        
        // 退出登录
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            this.isLoggedIn = false;
            this.userInfo = {};
            this.activeMenu = 'courses';
            this.$message.success('已退出登录');
            
            // 跳转到首页登录界面
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        },
        
        // 获取当前用户信息
        async getCurrentUser() {
            try {
                const response = await axios.get('/auth/me');
                if (response.data.success) {
                    this.userInfo = response.data.data;
                    localStorage.setItem('userInfo', JSON.stringify(this.userInfo));
                }
            } catch (error) {
                throw error;
            }
        },
        
        // 加载体育类别
        async loadCategories() {
            try {
                const response = await axios.get('/courses/categories');
                if (response.data.success) {
                    this.categories = response.data.data;
                }
            } catch (error) {
                console.error('加载体育类别失败:', error);
            }
        },
        
        // 加载教师列表
        async loadTeachers() {
            try {
                const response = await axios.get('/courses/meta/teachers');
                if (response.data.success) {
                    this.teachers = response.data.data;
                }
            } catch (error) {
                console.error('加载教师列表失败:', error);
            }
        },
        
        // 加载场地列表
        async loadVenues() {
            try {
                const response = await axios.get('/courses/meta/venues');
                if (response.data.success) {
                    this.venues = response.data.data;
                }
            } catch (error) {
                console.error('加载场地列表失败:', error);
            }
        },
        
        // 加载课程列表
        async loadCourses() {
            try {
                this.coursesLoading = true;
                
                const params = {
                    page: this.coursePagination.current_page,
                    limit: this.coursePagination.per_page,
                    ...this.courseFilters
                };
                
                // 过滤空值
                Object.keys(params).forEach(key => {
                    if (params[key] === '' || params[key] === null || params[key] === undefined) {
                        delete params[key];
                    }
                });
                
                const response = await axios.get('/courses', { params });
                
                if (response.data.success) {
                    this.courses = response.data.data.courses;
                    this.coursePagination = response.data.data.pagination;
                }
            } catch (error) {
                console.error('加载课程列表失败:', error);
                this.$message.error('加载课程列表失败');
            } finally {
                this.coursesLoading = false;
            }
        },
        
        // 搜索课程
        searchCourses() {
            this.coursePagination.current_page = 1;
            this.loadCourses();
        },
        
        // 重置筛选条件
        resetFilters() {
            this.courseFilters = {
                category_id: '',
                teacher_id: '',
                venue_id: '',
                day_of_week: '',
                search: ''
            };
            this.searchCourses();
        },
        
        // 分页大小改变
        handleSizeChange(val) {
            this.coursePagination.per_page = val;
            this.coursePagination.current_page = 1;
            this.loadCourses();
        },
        
        // 当前页改变
        handleCurrentChange(val) {
            this.coursePagination.current_page = val;
            this.loadCourses();
        },
        
        // 显示课程详情
        async showCourseDetail(course) {
            try {
                const response = await axios.get(`/courses/${course.id}`);
                if (response.data.success) {
                    this.selectedCourse = response.data.data;
                    this.showCourseDetailDialog = true;
                }
            } catch (error) {
                console.error('获取课程详情失败:', error);
                this.$message.error('获取课程详情失败');
            }
        },
        
        // 选课操作
        async selectCourse(course) {
            if (!this.isLoggedIn) {
                this.$message.warning('请先登录');
                this.showLoginDialog = true;
                return;
            }
            
            try {
                const response = await axios.post('/selections/select', {
                    course_id: course.id
                });
                
                if (response.data.success) {
                    this.$message.success(response.data.message);
                    
                    // 刷新相关数据
                    this.refreshCurrentPageData();
                    
                    // 关闭课程详情对话框
                    this.showCourseDetailDialog = false;
                } else {
                    this.$message.error(response.data.message);
                }
            } catch (error) {
                console.error('选课失败:', error);
                this.$message.error(error.response?.data?.message || '选课失败');
            }
        },
        
        // 退选操作
        async dropCourse(selection) {
            try {
                await this.$confirm('确定要退选这门课程吗？', '确认退选', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });
                
                const response = await axios.post('/selections/drop', {
                    course_id: selection.course_id
                });
                
                if (response.data.success) {
                    this.$message.success(response.data.message);
                    this.loadMySelections();
                    
                    // 如果当前在课程浏览页面，也要刷新
                    if (this.activeMenu === 'courses') {
                        this.loadCourses();
                    }
                } else {
                    this.$message.error(response.data.message);
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('退选失败:', error);
                    this.$message.error(error.response?.data?.message || '退选失败');
                }
            }
        },
        
        // 切换收藏状态
        async toggleFavorite(course) {
            if (!this.isLoggedIn) {
                this.$message.warning('请先登录');
                this.showLoginDialog = true;
                return;
            }
            
            try {
                if (course.is_favorited) {
                    // 取消收藏
                    const response = await axios.delete(`/selections/favorite?course_id=${course.id}`);
                    
                    if (response.data.success) {
                        this.$message.success('取消收藏成功');
                        course.is_favorited = false;
                        
                        // 如果在收藏页面，从列表中移除该课程
                        if (this.activeMenu === 'favorites') {
                            const index = this.favoriteCourses.findIndex(c => c.id === course.id);
                            if (index !== -1) {
                                this.favoriteCourses.splice(index, 1);
                            }
                        }
                        
                        // 同时更新主课程列表中的收藏状态
                        const mainCourse = this.courses.find(c => c.id === course.id);
                        if (mainCourse) {
                            mainCourse.is_favorited = false;
                        }
                    }
                } else {
                    // 添加收藏
                    const response = await axios.post('/selections/favorite', {
                        course_id: course.id
                    });
                    
                    if (response.data.success) {
                        this.$message.success('收藏成功');
                        course.is_favorited = true;
                        
                        // 同时更新主课程列表中的收藏状态
                        const mainCourse = this.courses.find(c => c.id === course.id);
                        if (mainCourse) {
                            mainCourse.is_favorited = true;
                        }
                    }
                }
            } catch (error) {
                console.error('收藏操作失败:', error);
                this.$message.error(error.response?.data?.message || '操作失败');
            }
        },
        
        // 加载我的选课
        async loadMySelections() {
            if (!this.isLoggedIn) return;
            
            try {
                this.selectionsLoading = true;
                
                const params = {};
                if (this.selectionTab !== 'all') {
                    params.status = this.selectionTab;
                }
                
                const response = await axios.get('/selections/my', { params });
                
                if (response.data.success) {
                    this.mySelections = response.data.data.selections;
                }
            } catch (error) {
                console.error('加载选课列表失败:', error);
                this.$message.error('加载选课列表失败');
            } finally {
                this.selectionsLoading = false;
            }
        },
        
        // 选课标签页点击
        handleSelectionTabClick(tab) {
            this.selectionTab = tab.name;
            this.loadMySelections();
        },
        
        // 加载收藏课程
        async loadFavoriteCourses() {
            if (!this.isLoggedIn) return;
            
            try {
                this.favoritesLoading = true;
                const response = await axios.get('/selections/favorites');
                
                if (response.data.success) {
                    this.favoriteCourses = response.data.data;
                }
            } catch (error) {
                console.error('加载收藏列表失败:', error);
                this.$message.error('加载收藏列表失败');
            } finally {
                this.favoritesLoading = false;
            }
        },
        
        // 加载选课历史
        async loadSelectionHistory() {
            if (!this.isLoggedIn) return;
            
            try {
                this.historyLoading = true;
                const response = await axios.get('/selections/history');
                
                if (response.data.success) {
                    this.selectionHistory = response.data.data;
                }
            } catch (error) {
                console.error('加载选课历史失败:', error);
                this.$message.error('加载选课历史失败');
            } finally {
                this.historyLoading = false;
            }
        },
        
        // 刷新当前页面数据
        refreshCurrentPageData() {
            switch (this.activeMenu) {
                case 'courses':
                    this.loadCourses();
                    break;
                case 'my-selections':
                    this.loadMySelections();
                    break;
                case 'favorites':
                    this.loadFavoriteCourses();
                    break;
                case 'history':
                    this.loadSelectionHistory();
                    break;
            }
        },
        
        // 工具方法：获取星期几文本
        getWeekDayText(dayOfWeek) {
            const weekDays = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            return weekDays[dayOfWeek] || '';
        },
        
        // 工具方法：格式化日期时间
        formatDateTime(dateTime) {
            if (!dateTime) return '';
            const date = new Date(dateTime);
            return date.toLocaleString('zh-CN');
        },
        
        // 工具方法：格式化日期时间（简短版）
        formatDateTimeShort(dateTime) {
            if (!dateTime) return '';
            const date = new Date(dateTime);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        },
        
        // 工具方法：格式化时间（只显示时分）
        formatTime(time) {
            if (!time) return '';
            // 如果是 HH:MM:SS 格式，截取前5位
            if (typeof time === 'string' && time.length >= 5) {
                return time.substring(0, 5);
            }
            return time;
        },
        
        // 工具方法：获取课程状态类型
        getCourseStatusType(status) {
            const statusMap = {
                'available': 'success',
                'full': 'warning',
                'not_started': 'info',
                'ended': 'danger'
            };
            return statusMap[status] || 'info';
        },
        
        // 工具方法：获取课程状态文本
        getCourseStatusText(status) {
            const statusMap = {
                'available': '可选',
                'full': '已满',
                'not_started': '未开始',
                'ended': '已结束'
            };
            return statusMap[status] || '未知';
        },
        
        // 工具方法：获取选课状态类型
        getSelectionStatusType(status) {
            const statusMap = {
                'pending': 'warning',
                'selected': 'success',
                'lottery': 'primary',
                'failed': 'danger',
                'dropped': 'info'
            };
            return statusMap[status] || 'info';
        },
        
        // 工具方法：获取选课状态文本
        getSelectionStatusText(status) {
            const statusMap = {
                'pending': '等待中',
                'selected': '已选中',
                'lottery': '抽签中',
                'failed': '失败',
                'dropped': '已退选'
            };
            return statusMap[status] || '未知';
        },
        
        // 工具方法：获取操作类型
        getActionType(action) {
            const actionMap = {
                'select': 'success',
                'drop': 'warning',
                'lottery_win': 'success',
                'lottery_lose': 'danger'
            };
            return actionMap[action] || 'info';
        },
        
        // 工具方法：获取操作文本
        getActionText(action) {
            const actionMap = {
                'select': '选课',
                'drop': '退选',
                'lottery_win': '抽签成功',
                'lottery_lose': '抽签失败'
            };
            return actionMap[action] || '未知';
        },
        
        // 工具方法：获取容量颜色
        getCapacityColor(enrolled, capacity) {
            const percentage = (enrolled / capacity) * 100;
            if (percentage >= 90) return '#F56C6C';
            if (percentage >= 70) return '#E6A23C';
            return '#67C23A';
        },
        
        // 工具方法：判断是否可以选课
        canSelectCourse(course) {
            if (!course) return false;
            return !course.user_selection_status || 
                   course.user_selection_status === 'failed' || 
                   course.user_selection_status === 'dropped';
        },
        
        // 工具方法：获取选课按钮文本
        getSelectionButtonText(course) {
            if (!course) return '选课';
            
            if (course.selection_status === 'full') {
                return '加入抽签';
            }
            
            return '选课';
        }
    }
});
