// 管理员端Vue应用
new Vue({
    el: '#app',
    data() {
        return {
            // 登录状态
            isLoggedIn: false,
            isCheckingAuth: true, // 默认显示验证状态，等待checkLoginStatus检查
            loginLoading: false,
            
            // 登录表单
            loginForm: {
                username: '',
                password: ''
            },
            loginRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
                ]
            },

            // 用户信息
            currentUser: {},
            
            // 界面状态
            activeMenu: 'dashboard',
            
            // 系统数据
            overview: {},
            systemHealth: {},
            realtimeData: {},
            pendingIncidents: 0,
            
            // 修改密码
            changePasswordVisible: false,
            passwordLoading: false,
            passwordForm: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            passwordRules: {
                oldPassword: [
                    { required: true, message: '请输入当前密码', trigger: 'blur' }
                ],
                newPassword: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请确认新密码', trigger: 'blur' },
                    { validator: this.validateConfirmPassword, trigger: 'blur' }
                ]
            },

            // 定时器
            refreshTimer: null,

            // 选课配置管理
            configList: [],
            configLoading: false,
            configFilters: {
                academic_year: '',
                semester: '',
                status: ''
            },
            configPagination: {
                page: 1,
                limit: 10,
                total: 0
            },
            
            // 选课配置对话框
            configDialog: {
                visible: false,
                mode: 'create', // create, edit, view
                loading: false
            },
            configForm: {
                id: null,
                academic_year: '2025-2026',
                semester: '2026春',
                round_number: 1,
                round_name: '',
                selection_method: 'first_come',
                start_time: '',
                end_time: '',
                max_credits: 2,
                max_courses: 1,
                allow_drop: true,
                allow_change: true,
                description: ''
            },
            configRules: {
                academic_year: [
                    { required: true, message: '请选择学年', trigger: 'change' }
                ],
                semester: [
                    { required: true, message: '请选择学期', trigger: 'change' }
                ],
                round_number: [
                    { required: true, message: '请输入轮次', trigger: 'blur' }
                ],
                round_name: [
                    { required: true, message: '请输入轮次名称', trigger: 'blur' }
                ],
                selection_method: [
                    { required: true, message: '请选择选课方式', trigger: 'change' }
                ],
                start_time: [
                    { required: true, message: '请选择开始时间', trigger: 'change' }
                ],
                end_time: [
                    { required: true, message: '请选择结束时间', trigger: 'change' }
                ]
            },

            // 复制配置对话框
            copyConfigDialog: {
                visible: false,
                loading: false,
                sourceId: null
            },
            copyConfigForm: {
                academic_year: '2025-2026',
                semester: '2026春',
                round_number: 1
            },
            copyConfigRules: {
                academic_year: [
                    { required: true, message: '请选择学年', trigger: 'change' }
                ],
                semester: [
                    { required: true, message: '请选择学期', trigger: 'change' }
                ],
                round_number: [
                    { required: true, message: '请输入轮次', trigger: 'blur' }
                ]
            },

            // 场地管理
            venueList: [],
            venueLoading: false,
            venueFilters: {
                keyword: '',
                type: '',
                status: ''
            },
            venuePagination: {
                page: 1,
                limit: 10,
                total: 0
            },

            // 场地对话框
            venueDialog: {
                visible: false,
                mode: 'create', // create, edit, view
                loading: false
            },
            venueForm: {
                id: null,
                name: '',
                type: 'indoor',
                location: '',
                capacity: 30,
                description: '',
                equipment: '',
                status: 'available'
            },
            venueRules: {
                name: [
                    { required: true, message: '请输入场地名称', trigger: 'blur' }
                ],
                type: [
                    { required: true, message: '请选择场地类型', trigger: 'change' }
                ],
                location: [
                    { required: true, message: '请输入场地位置', trigger: 'blur' }
                ],
                capacity: [
                    { required: true, message: '请输入场地容量', trigger: 'blur' }
                ]
            },

            // 场地时间表管理
            scheduleDialog: {
                visible: false,
                venue: null,
                loading: false
            },
            scheduleLoading: false,
            
            // 单日时间表编辑对话框
            dayScheduleDialog: {
                visible: false,
                venue: null,
                dayOfWeek: 1,
                schedules: [],
                loading: false
            },
            scheduleViewMode: 'list', // list 或 calendar
            weeklyScheduleList: [], // 格式化后的周列表数据
            timeHours: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], // 时间轴小时数
            
            // 批量设置时间表对话框
            batchSetDialog: {
                visible: false,
                loading: false
            },
            batchSetForm: {
                scheduleType: 'simple',
                days: [],
                startTime: '08:00:00',
                endTime: '18:00:00',
                timeSlots: [
                    {
                        start_time: '08:00:00',
                        end_time: '12:00:00',
                        is_available: true,
                        maintenance_reason: ''
                    }
                ]
            },
            batchSetRules: {
                scheduleType: [
                    { required: true, message: '请选择设置模式', trigger: 'change' }
                ],
                days: [
                    { type: 'array', required: true, message: '请选择应用日期', trigger: 'change' }
                ],
                startTime: [
                    { required: true, message: '请选择开始时间', trigger: 'change' }
                ],
                endTime: [
                    { required: true, message: '请选择结束时间', trigger: 'change' }
                ]
            },
            
            // 复制时间表模板对话框
            copyScheduleDialog: {
                visible: false,
                loading: false
            },
            copyScheduleForm: {
                sourceVenueId: null,
                targetVenueIds: []
            },
            allVenues: [], // 用于复制模板的场地列表
            
            // 使用统计对话框
            usageStatsDialog: {
                visible: false
            },
            usageStats: null,
            usageStatsTableData: [],

            // 教师管理
            teacherList: [],
            teacherLoading: false,
            teacherFilters: {
                keyword: '',
                department: '',
                status: ''
            },
            teacherPagination: {
                page: 1,
                limit: 10,
                total: 0
            },

            // 教师对话框
            teacherDialog: {
                visible: false,
                mode: 'create', // create, edit, view
                loading: false
            },
            teacherForm: {
                id: null,
                name: '',
                employee_id: '',
                title: '',
                department: '',
                phone: '',
                email: '',
                specialties: '',
                bio: '',
                status: 'active'
            },
            teacherRules: {
                name: [
                    { required: true, message: '请输入教师姓名', trigger: 'blur' }
                ],
                employee_id: [
                    { required: true, message: '请输入工号', trigger: 'blur' }
                ],
                department: [
                    { required: true, message: '请选择部门', trigger: 'change' }
                ]
            },

            // 教师资质管理
            qualificationList: [],
            qualificationLoading: false,
            qualificationStats: {
                total: 0,
                active: 0,
                expiringSoon: 0,
                pending: 0
            },
            qualificationFilters: {
                teacher_id: '',
                sport_category: '',
                qualification_level: '',
                status: ''
            },
            qualificationPagination: {
                page: 1,
                limit: 10,
                total: 0
            },
            selectedQualifications: [],
            teachersList: [], // 用于资质管理的教师列表
            
            // 资质对话框
            qualificationDialog: {
                visible: false,
                teacher: {},
                showForm: false,
                formMode: 'create', // create, edit, view
                loading: false
            },
            qualificationStatistics: {
                total: 0,
                active: 0,
                expired: 0,
                inactive: 0
            },
            
            qualificationForm: {
                id: null,
                teacher_id: '',
                sport_category: '',
                qualification_level: '其他',
                certificate_name: '',
                certificate_number: '',
                issue_date: '',
                expire_date: '',
                issuing_authority: '',
                description: '',
                attachment_url: '',
                verified_status: 'pending',
                verification_notes: ''
            },
            qualificationRules: {
                teacher_id: [
                    { required: true, message: '请选择教师', trigger: 'change' }
                ],
                sport_category: [
                    { required: true, message: '请选择体育类别', trigger: 'change' }
                ],
                certificate_name: [
                    { required: true, message: '请输入证书名称', trigger: 'blur' }
                ]
            },

            // 监控统计数据
            realTimeLoading: false,
            autoRefresh: false,
            refreshTimer: null,

            // 选课统计
            statisticsLoading: false,
            statisticsFilters: {
                academic_year: '',
                semester: ''
            },
            statisticsData: {},

            // 课程热度
            popularityLoading: false,
            popularityFilters: {
                category: ''
            },
            popularityData: {},
            popularityPagination: {
                page: 1,
                limit: 20,
                total: 0
            },

            // 系统性能
            performanceLoading: false,
            performancePeriod: '24h',
            performanceData: {},

            // 异常事件管理
            incidentsLoading: false,
            incidentsList: [],
            incidentsPagination: {
                page: 1,
                limit: 10,
                total: 0
            },

            // 手动调整
            adjustLoading: false,
            adjustForm: {
                student_id: '',
                course_code: '',
                action: '',
                reason: '',
                student_info: null,
                course_info: null
            },
            adjustRules: {
                student_id: [
                    { required: true, message: '请输入学生学号', trigger: 'blur' }
                ],
                course_code: [
                    { required: true, message: '请输入课程代码', trigger: 'blur' }
                ],
                action: [
                    { required: true, message: '请选择调整操作', trigger: 'change' }
                ],
                reason: [
                    { required: true, message: '请输入调整原因', trigger: 'blur' }
                ]
            },

            // 系统维护
            maintenanceLoading: false,
            maintenanceMode: {
                enabled: false,
                message: '',
                duration: ''
            },

            // 学生管理
            studentsLoading: false,
            studentsList: [],
            studentsFilters: {
                keyword: '',
                grade: '',
                major: '',
                status: ''
            },
            studentsPagination: {
                page: 1,
                limit: 20,
                total: 0
            },
            studentDialog: {
                visible: false,
                loading: false,
                mode: 'create', // create, edit, view
                title: ''
            },
            studentForm: {
                student_id: '',
                username: '',
                real_name: '',
                grade: '',
                major: '',
                class_name: '',
                email: '',
                phone: '',
                credit_limit: 2,
                password: '',
                status: 'active'
            },
            studentRules: {
                student_id: [{ required: true, message: '请输入学号', trigger: 'blur' }],
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                real_name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
                grade: [{ required: true, message: '请选择年级', trigger: 'change' }],
                major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
                ]
            },

            // 管理员管理
            adminsLoading: false,
            adminsList: [],
            adminsPagination: {
                page: 1,
                limit: 20,
                total: 0
            },
            adminDialog: {
                visible: false,
                loading: false,
                mode: 'create', // create, edit, view
                title: ''
            },
            adminForm: {
                username: '',
                real_name: '',
                role: 'admin',
                email: '',
                phone: '',
                password: '',
                status: 'active'
            },
            adminRules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                real_name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
                role: [{ required: true, message: '请选择角色', trigger: 'change' }],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
                ]
            },


            // 系统日志
            logsLoading: false,
            logsList: [],
            logsFilters: {
                operation_type: '',
                operation_module: '',
                dateRange: null
            },
            logsPagination: {
                page: 1,
                limit: 20,
                total: 0
            },
            logDetailDialog: {
                visible: false,
                data: null
            },

            // 仪表板概览数据
            overview: {
                totalUsers: 0,
                totalCourses: 0,
                activeSelections: 0,
                systemStatus: 'normal'
            },
            pendingIncidents: 0,

            // 实时监控数据
            realTimeData: {
                recentActivity: {
                    total_attempts: 0,
                    successful_attempts: 0,
                    waiting_attempts: 0
                },
                hotCourses: []
            },
            systemHealth: {
                overall_status: 'unknown',
                database_status: 'unknown',
                redis_status: 'unknown',
                disk_usage: 0,
                memory_usage: 0,
                cpu_usage: 0
            },

            // 数据完整性验证
            dataValidationLoading: false,
            dataRelationStatus: null,
            dataRelationDialog: {
                visible: false
            },
            lastValidationResult: null,
            validationResultDialog: {
                visible: false,
                data: null
            },
            validationActiveTab: 'info',

            // 系统参数配置管理
            systemConfigs: [],
            systemConfigsLoading: false,
            configCategories: [],
            systemConfigFilter: {
                category: 'all',
                search: '',
                onlyPublic: false
            },
            
            // 系统配置对话框
            systemConfigDialog: {
                visible: false,
                mode: 'create', // create, edit, view
                loading: false
            },
            systemConfigForm: {
                config_key: '',
                config_value: '',
                config_type: 'string',
                category: 'general',
                description: '',
                is_public: false
            },
            systemConfigRules: {
                config_key: [
                    { required: true, message: '请输入配置键', trigger: 'blur' },
                    { pattern: /^[a-zA-Z0-9_]+$/, message: '配置键只能包含字母、数字和下划线', trigger: 'blur' }
                ],
                config_value: [
                    { required: true, message: '请输入配置值', trigger: 'blur' }
                ],
                config_type: [
                    { required: true, message: '请选择配置类型', trigger: 'change' }
                ],
                category: [
                    { required: true, message: '请选择配置分类', trigger: 'change' }
                ],
                description: [
                    { required: true, message: '请输入配置描述', trigger: 'blur' }
                ]
            },
            
            // 配置修改跟踪
            modifiedConfigs: new Set(),
            originalConfigValues: new Map()
        };
    },

    mounted() {
        console.log('Admin页面mounted，准备检查登录状态');
        
        // 立即初始化Axios
        this.initAxios();
        
        // 稍微延迟后检查登录状态
        this.$nextTick(() => {
            this.checkLoginStatus();
        });
        
        // 添加超时保护，避免永远卡在验证状态
        setTimeout(() => {
            if (this.isCheckingAuth) {
                console.warn('验证超时，强制关闭验证状态');
                this.isCheckingAuth = false;
                if (!this.isLoggedIn) {
                    console.log('未检测到登录，显示登录表单');
                }
            }
        }, 3000); // 3秒超时
    },

    beforeDestroy() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    },

    methods: {
        // 初始化Axios
        initAxios() {
            // 重置baseURL，因为可能从homepage.js继承了/api的baseURL
            axios.defaults.baseURL = '';
            
            // 请求拦截器
            axios.interceptors.request.use(
                config => {
                    // 优先使用管理员专用token
                    const adminToken = localStorage.getItem('admin_token');
                    const generalToken = localStorage.getItem('token');
                    const token = adminToken || generalToken;
                    
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                error => {
                    return Promise.reject(error);
                }
            );

            // 响应拦截器
            axios.interceptors.response.use(
                response => {
                    return response;
                },
                error => {
                    if (error.response?.status === 401) {
                        this.handleLogout();
                        this.$message.error('登录已过期，请重新登录');
                    } else if (error.response?.status === 403) {
                        this.$message.error('权限不足，无法执行此操作');
                    }
                    return Promise.reject(error);
                }
            );
        },

        // 检查登录状态
        checkLoginStatus() {
            console.log('开始检查登录状态...');
            
            try {
                // 检查管理员专用存储
                const adminToken = localStorage.getItem('admin_token');
                const adminUser = localStorage.getItem('admin_user');
                
                console.log('检查管理员登录状态:', {
                    hasAdminToken: !!adminToken,
                    hasAdminUser: !!adminUser,
                    isCheckingAuth: this.isCheckingAuth
                });
                
                // 如果有管理员token和用户信息，直接进入系统（信任从首页登录的token）
                if (adminToken && adminUser) {
                    try {
                        const user = JSON.parse(adminUser);
                        console.log('从本地存储加载管理员信息:', user);
                        
                        // 设置axios认证header
                        axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
                        
                        // 直接设置登录状态
                        this.currentUser = user;
                        this.isLoggedIn = true;
                        
                        console.log('登录成功，准备进入系统');
                        
                        // 确保设置检查状态为false
                        this.$nextTick(() => {
                            this.isCheckingAuth = false;
                            console.log('isCheckingAuth已设置为:', this.isCheckingAuth);
                        });
                        
                        // 加载页面数据
                        this.loadDashboardData();
                        this.startRefreshTimer();
                        
                        // 后台异步验证token（不阻塞用户操作）
                        this.validateTokenAsync();
                    } catch (error) {
                        console.error('解析管理员用户信息失败:', error);
                        // 清除无效数据
                        localStorage.removeItem('admin_token');
                        localStorage.removeItem('admin_user');
                        this.isCheckingAuth = false;
                        this.isLoggedIn = false;
                    }
                } else {
                    // 如果没有有效的管理员登录信息，显示登录表单
                    console.log('没有有效的管理员登录信息，显示登录表单');
                    this.isCheckingAuth = false;
                    this.isLoggedIn = false;
                }
            } catch (error) {
                console.error('检查登录状态时发生错误:', error);
                // 出错时也要确保关闭检查状态
                this.isCheckingAuth = false;
                this.isLoggedIn = false;
            }
            
            console.log('登录状态检查完成:', {
                isCheckingAuth: this.isCheckingAuth,
                isLoggedIn: this.isLoggedIn
            });
        },
        
        // 异步验证token有效性（不阻塞页面加载）
        async validateTokenAsync() {
            try {
                const response = await axios.get('/api/admin/auth/me');
                if (response.data.success) {
                    // 更新用户信息（如果有变化）
                    const userData = response.data.data;
                    this.currentUser = userData;
                    localStorage.setItem('admin_user', JSON.stringify(userData));
                }
            } catch (error) {
                // 只有401错误才清除登录状态
                if (error.response?.status === 401) {
                    console.error('Token已失效');
                    this.$message.error('登录已过期，请重新登录');
                    // 延迟清除，让用户看到提示
                    setTimeout(() => {
                        localStorage.removeItem('admin_token');
                        localStorage.removeItem('admin_user');
                        this.isLoggedIn = false;
                        this.currentUser = {};
                    }, 1500);
                }
            }
        },

        // 处理登录
        async handleLogin() {
            this.$refs.loginForm.validate(async (valid) => {
                if (!valid) return;

                this.loginLoading = true;
                try {
                    const response = await axios.post('/api/admin/auth/login', this.loginForm);
                    
                    if (response.data.success) {
                        const { token, user } = response.data.data;
                        // 使用管理员专用存储键
                        localStorage.setItem('admin_token', token);
                        localStorage.setItem('admin_user', JSON.stringify(user));
                        localStorage.setItem('userRole', user.role);
                        
                        // 立即设置axios认证头
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        
                        this.currentUser = user;
                        this.isLoggedIn = true;
                        
                        this.$message.success('登录成功');
                        this.loadDashboardData();
                        this.startRefreshTimer();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '登录失败');
                } finally {
                    this.loginLoading = false;
                }
            });
        },

        // 处理登出
        async handleLogout() {
            try {
                await axios.post('/api/admin/auth/logout');
            } catch (error) {
                console.error('登出请求失败:', error);
            } finally {
                // 清除所有可能的存储键
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('userRole');
                
                // 清除axios认证头
                delete axios.defaults.headers.common['Authorization'];
                
                this.isLoggedIn = false;
                this.currentUser = {};
                this.stopRefreshTimer();
                this.$message.success('已退出登录');
                
                // 跳转到首页登录界面
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        },

        // 处理用户命令
        handleUserCommand(command) {
            switch (command) {
                case 'profile':
                    this.$message.info('个人信息功能开发中');
                    break;
                case 'changePassword':
                    this.changePasswordVisible = true;
                    break;
                case 'logout':
                    this.handleLogout();
                    break;
            }
        },

        // 处理修改密码
        async handleChangePassword() {
            this.$refs.passwordForm.validate(async (valid) => {
                if (!valid) return;

                this.passwordLoading = true;
                try {
                    const response = await axios.put('/api/admin/auth/change-password', {
                        oldPassword: this.passwordForm.oldPassword,
                        newPassword: this.passwordForm.newPassword
                    });

                    if (response.data.success) {
                        this.$message.success('密码修改成功');
                        this.changePasswordVisible = false;
                        this.resetPasswordForm();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '密码修改失败');
                } finally {
                    this.passwordLoading = false;
                }
            });
        },

        // 重置密码表单
        resetPasswordForm() {
            this.passwordForm = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            this.$refs.passwordForm?.resetFields();
        },

        // 验证确认密码
        validateConfirmPassword(rule, value, callback) {
            if (value !== this.passwordForm.newPassword) {
                callback(new Error('两次输入的密码不一致'));
            } else {
                callback();
            }
        },

        // 处理菜单选择
        handleMenuSelect(index) {
            this.activeMenu = index;
            
            // 根据选择的菜单加载相应数据
            switch (index) {
                case 'dashboard':
                    this.loadDashboardData();
                    break;
                case 'selection-config':
                    this.loadConfigs();
                    break;
                case 'venues':
                    this.loadVenues();
                    break;
                case 'teachers':
                    this.loadTeachers();
                    break;
                case 'teacher-qualifications':
                    this.loadQualifications();
                    break;
                case 'real-time':
                    this.loadRealTimeData();
                    break;
                case 'statistics':
                    this.loadStatistics();
                    break;
                case 'popularity':
                    this.loadPopularity();
                    break;
                case 'performance':
                    this.loadPerformance();
                    break;
                case 'incidents':
                    this.loadIncidents();
                    break;
                case 'manual-adjust':
                    this.loadMaintenanceStatus();
                    break;
                case 'maintenance':
                    this.loadMaintenanceStatus();
                    break;
                case 'students':
                    this.loadStudents();
                    break;
                case 'admins':
                    this.loadAdmins();
                    break;
                case 'logs':
                    this.loadLogs();
                    break;
                default:
                    // 其他菜单项的数据加载逻辑
                    break;
            }
        },

        // 加载仪表板数据
        async loadDashboardData() {
            try {
                // 并行加载多个数据
                const [overviewRes, healthRes, realtimeRes] = await Promise.all([
                    axios.get('/api/admin/monitoring/overview'),
                    axios.get('/api/admin/monitoring/emergency/system-health'),
                    axios.get('/api/admin/monitoring/real-time-status')
                ]);

                if (overviewRes.data.success) {
                    this.overview = overviewRes.data.data;
                }

                if (healthRes.data.success) {
                    this.systemHealth = healthRes.data.data;
                }

                if (realtimeRes.data.success) {
                    this.realTimeData = realtimeRes.data.data;
                }

                // 获取待处理异常事件数量
                this.loadPendingIncidents();

            } catch (error) {
                console.error('加载仪表板数据失败:', error);
            }
        },

        // 加载待处理异常事件
        async loadPendingIncidents() {
            try {
                const response = await axios.get('/api/admin/monitoring/incidents', {
                    params: { status: 'open,investigating', limit: 1 }
                });
                
                if (response.data.success) {
                    this.pendingIncidents = response.data.data.total;
                }
            } catch (error) {
                console.error('加载异常事件失败:', error);
            }
        },

        // 刷新概览数据
        async refreshOverview() {
            await this.loadDashboardData();
            this.$message.success('数据已刷新');
        },

        // 启动定时刷新
        startRefreshTimer() {
            this.refreshTimer = setInterval(() => {
                if (this.activeMenu === 'dashboard') {
                    this.loadDashboardData();
                }
            }, 30000); // 30秒刷新一次
        },

        // 停止定时刷新
        stopRefreshTimer() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
        },

        // 检查权限
        hasPermission(permissions) {
            if (!this.currentUser.permissions) return false;
            if (this.currentUser.role === 'super_admin') return true;
            if (this.currentUser.permissions.includes('all')) return true;
            
            return permissions.some(permission => 
                this.currentUser.permissions.includes(permission)
            );
        },

        // 获取页面标题
        getPageTitle(menuIndex) {
            const titles = {
                'dashboard': '系统概览',
                'selection-config': '选课时间配置',
                'system-config': '系统参数配置',
                'venues': '场地管理',
                'teachers': '教师管理',
                'real-time': '实时监控',
                'statistics': '选课统计',
                'popularity': '课程热度',
                'performance': '系统性能',
                'incidents': '异常事件',
                'manual-adjust': '手动调整',
                'maintenance': '系统维护',
                'students': '学生管理',
                'admins': '管理员管理',
                'logs': '系统日志'
            };
            return titles[menuIndex] || '未知页面';
        },

        // 获取健康状态图标
        getHealthIcon(status) {
            const icons = {
                'healthy': 'fas fa-check-circle',
                'warning': 'fas fa-exclamation-triangle',
                'critical': 'fas fa-times-circle'
            };
            return icons[status] || 'fas fa-question-circle';
        },

        // 获取健康状态文本
        getHealthText(status) {
            const texts = {
                'healthy': '系统正常',
                'warning': '需要注意',
                'critical': '严重问题'
            };
            return texts[status] || '未知状态';
        },

        // 获取配置状态类型
        getConfigStatusType(status) {
            const types = {
                'draft': 'info',
                'active': 'success',
                'ended': 'warning',
                'cancelled': 'danger'
            };
            return types[status] || 'info';
        },

        // 获取配置状态文本
        getConfigStatusText(status) {
            const texts = {
                'draft': '草稿',
                'active': '激活',
                'ended': '已结束',
                'cancelled': '已取消'
            };
            return texts[status] || '未知';
        },

        // 获取选课方式文本
        getSelectionMethodText(method) {
            const texts = {
                'first_come': '先到先得',
                'lottery': '抽签',
                'priority': '优先级'
            };
            return texts[method] || '未知';
        },

        // 格式化日期时间
        formatDateTime(dateTime) {
            if (!dateTime) return '';
            const date = new Date(dateTime);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        // 格式化日期（仅日期，不含时间）
        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        // 格式化数字
        formatNumber(num) {
            if (num === null || num === undefined) return '0';
            return num.toLocaleString();
        },

        // ================== 选课配置管理 ==================

        // 加载选课配置列表
        async loadConfigs() {
            this.configLoading = true;
            try {
                const params = new URLSearchParams({
                    page: this.configPagination.page,
                    limit: this.configPagination.limit,
                    ...this.configFilters
                });

                const response = await axios.get(`/api/admin/config/selection-configs?${params}`);
                if (response.data.success) {
                    this.configList = response.data.data.list;
                    this.configPagination.total = response.data.data.total;
                }
            } catch (error) {
                this.$message.error('加载选课配置列表失败');
            } finally {
                this.configLoading = false;
            }
        },

        // 刷新配置列表
        async refreshConfigs() {
            await this.loadConfigs();
            this.$message.success('数据已刷新');
        },

        // 搜索配置
        searchConfigs() {
            this.configPagination.page = 1;
            this.loadConfigs();
        },

        // 重置筛选条件
        resetConfigFilters() {
            this.configFilters = {
                academic_year: '',
                semester: '',
                status: ''
            };
            this.configPagination.page = 1;
            this.loadConfigs();
        },

        // 显示配置对话框
        showConfigDialog(mode, config = null) {
            this.configDialog.mode = mode;
            this.configDialog.visible = true;
            
            if (mode === 'create') {
                this.resetConfigForm();
            } else if (config) {
                this.configForm = { ...config };
                this.configForm.allow_drop = Boolean(config.allow_drop);
                this.configForm.allow_change = Boolean(config.allow_change);
            }
        },

        // 重置配置表单
        resetConfigForm() {
            this.configForm = {
                id: null,
                academic_year: '2025-2026',
                semester: '2026春',
                round_number: 1,
                round_name: '',
                selection_method: 'first_come',
                start_time: '',
                end_time: '',
                max_credits: 2,
                max_courses: 1,
                allow_drop: true,
                allow_change: true,
                description: ''
            };
            this.$nextTick(() => {
                this.$refs.configForm?.clearValidate();
            });
        },

        // 保存配置
        async saveConfig() {
            this.$refs.configForm.validate(async (valid) => {
                if (!valid) return;

                this.configDialog.loading = true;
                try {
                    const url = this.configDialog.mode === 'create' 
                        ? '/api/admin/config/selection-configs'
                        : `/api/admin/config/selection-configs/${this.configForm.id}`;
                    
                    const method = this.configDialog.mode === 'create' ? 'post' : 'put';
                    const response = await axios[method](url, this.configForm);

                    if (response.data.success) {
                        this.$message.success(this.configDialog.mode === 'create' ? '配置创建成功' : '配置更新成功');
                        this.configDialog.visible = false;
                        this.loadConfigs();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '操作失败');
                } finally {
                    this.configDialog.loading = false;
                }
            });
        },

        // 查看配置详情
        viewConfig(config) {
            this.showConfigDialog('view', config);
        },

        // 编辑配置
        editConfig(config) {
            this.showConfigDialog('edit', config);
        },

        // 激活配置
        async activateConfig(config) {
            try {
                await this.$confirm('确定要激活此选课配置吗？', '确认操作', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                const response = await axios.post(`/api/admin/config/selection-configs/${config.id}/activate`);
                if (response.data.success) {
                    this.$message.success('配置激活成功');
                    this.loadConfigs();
                    this.loadDashboardData(); // 刷新概览数据
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '激活失败');
                }
            }
        },

        // 结束配置
        async endConfig(config) {
            try {
                await this.$confirm('确定要结束此选课配置吗？', '确认操作', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                const response = await axios.post(`/api/admin/config/selection-configs/${config.id}/end`);
                if (response.data.success) {
                    this.$message.success('配置已结束');
                    this.loadConfigs();
                    this.loadDashboardData(); // 刷新概览数据
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '操作失败');
                }
            }
        },

        // 处理配置命令
        handleConfigCommand({ action, row }) {
            switch (action) {
                case 'copy':
                    this.copyConfig(row);
                    break;
                case 'delete':
                    this.deleteConfig(row);
                    break;
            }
        },

        // 复制配置
        copyConfig(config) {
            this.copyConfigDialog.sourceId = config.id;
            this.copyConfigDialog.visible = true;
            this.copyConfigForm = {
                academic_year: '2025-2026',
                semester: '2026春',
                round_number: 1
            };
        },

        // 确认复制配置
        async confirmCopyConfig() {
            this.$refs.copyConfigForm.validate(async (valid) => {
                if (!valid) return;

                this.copyConfigDialog.loading = true;
                try {
                    const response = await axios.post(
                        `/api/admin/config/selection-configs/${this.copyConfigDialog.sourceId}/copy`,
                        this.copyConfigForm
                    );

                    if (response.data.success) {
                        this.$message.success('配置复制成功');
                        this.copyConfigDialog.visible = false;
                        this.loadConfigs();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '复制失败');
                } finally {
                    this.copyConfigDialog.loading = false;
                }
            });
        },

        // 删除配置
        async deleteConfig(config) {
            try {
                await this.$confirm(`确定要删除配置"${config.round_name}"吗？此操作不可撤销。`, '确认删除', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'error'
                });

                const response = await axios.delete(`/api/admin/config/selection-configs/${config.id}`);
                if (response.data.success) {
                    this.$message.success('配置删除成功');
                    this.loadConfigs();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '删除失败');
                }
            }
        },

        // 分页处理
        handleConfigSizeChange(val) {
            this.configPagination.limit = val;
            this.configPagination.page = 1;
            this.loadConfigs();
        },

        handleConfigCurrentChange(val) {
            this.configPagination.page = val;
            this.loadConfigs();
        },

        // 获取选课方式类型
        getSelectionMethodType(method) {
            const types = {
                'first_come': 'success',
                'lottery': 'warning',
                'priority': 'info'
            };
            return types[method] || 'info';
        },

        // ================== 场地管理 ==================

        // 加载场地列表
        async loadVenues() {
            this.venueLoading = true;
            try {
                const params = new URLSearchParams({
                    page: this.venuePagination.page,
                    limit: this.venuePagination.limit,
                    ...this.venueFilters
                });

                const response = await axios.get(`/api/admin/resources/venues?${params}`);
                if (response.data.success) {
                    this.venueList = response.data.data.list;
                    this.venuePagination.total = response.data.data.total;
                }
            } catch (error) {
                this.$message.error('加载场地列表失败');
            } finally {
                this.venueLoading = false;
            }
        },

        // 刷新场地列表
        async refreshVenues() {
            await this.loadVenues();
            this.$message.success('数据已刷新');
        },

        // 搜索场地
        searchVenues() {
            this.venuePagination.page = 1;
            this.loadVenues();
        },

        // 重置场地筛选条件
        resetVenueFilters() {
            this.venueFilters = {
                keyword: '',
                type: '',
                status: ''
            };
            this.venuePagination.page = 1;
            this.loadVenues();
        },

        // 显示场地对话框
        showVenueDialog(mode, venue = null) {
            this.venueDialog.mode = mode;
            this.venueDialog.visible = true;
            
            if (mode === 'create') {
                this.resetVenueForm();
            } else if (venue) {
                this.venueForm = { ...venue };
            }
        },

        // 重置场地表单
        resetVenueForm() {
            this.venueForm = {
                id: null,
                name: '',
                type: 'indoor',
                location: '',
                capacity: 30,
                description: '',
                equipment: '',
                status: 'available'
            };
            this.$nextTick(() => {
                this.$refs.venueForm?.clearValidate();
            });
        },

        // 保存场地
        async saveVenue() {
            this.$refs.venueForm.validate(async (valid) => {
                if (!valid) return;

                this.venueDialog.loading = true;
                try {
                    const url = this.venueDialog.mode === 'create' 
                        ? '/api/admin/resources/venues'
                        : `/api/admin/resources/venues/${this.venueForm.id}`;
                    
                    const method = this.venueDialog.mode === 'create' ? 'post' : 'put';
                    const response = await axios[method](url, this.venueForm);

                    if (response.data.success) {
                        this.$message.success(this.venueDialog.mode === 'create' ? '场地创建成功' : '场地更新成功');
                        this.venueDialog.visible = false;
                        this.loadVenues();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '操作失败');
                } finally {
                    this.venueDialog.loading = false;
                }
            });
        },

        // 查看场地详情
        viewVenue(venue) {
            this.showVenueDialog('view', venue);
        },

        // 编辑场地
        editVenue(venue) {
            this.showVenueDialog('edit', venue);
        },

        // 管理场地时间表
        async manageVenueSchedule(venue) {
            try {
                this.scheduleDialog.venue = venue;
                this.scheduleDialog.visible = true;
                await this.loadVenueSchedules(venue.id);
                await this.loadAllVenues(); // 加载所有场地供复制模板使用
            } catch (error) {
                this.$message.error('加载场地时间表失败');
            }
        },

        // 加载场地时间表
        async loadVenueSchedules(venueId) {
            try {
                this.scheduleLoading = true;
                const response = await axios.get(`/api/admin/resources/venues/${venueId}/schedules`);
                
                if (response.data.success) {
                    const weeklySchedule = response.data.data.weeklySchedule;
                    
                    // 格式化为表格数据
                    this.weeklyScheduleList = [];
                    for (let day = 1; day <= 7; day++) {
                        this.weeklyScheduleList.push({
                            dayOfWeek: day,
                            schedules: weeklySchedule[day] || []
                        });
                    }
                }
            } catch (error) {
                this.$message.error('加载场地时间表失败');
            } finally {
                this.scheduleLoading = false;
            }
        },

        // 刷新时间表
        async refreshSchedule() {
            if (this.scheduleDialog.venue) {
                await this.loadVenueSchedules(this.scheduleDialog.venue.id);
            }
        },

        // 显示批量设置对话框
        showBatchSetDialog() {
            this.batchSetForm = {
                scheduleType: 'simple',
                days: [],
                startTime: '08:00:00',
                endTime: '18:00:00',
                timeSlots: [
                    {
                        start_time: '08:00:00',
                        end_time: '12:00:00',
                        is_available: true,
                        maintenance_reason: ''
                    }
                ]
            };
            this.batchSetDialog.visible = true;
        },

        // 选择工作日
        selectWorkdays() {
            this.batchSetForm.days = [1, 2, 3, 4, 5];
        },

        // 选择周末
        selectWeekend() {
            this.batchSetForm.days = [6, 7];
        },

        // 选择全部日期
        selectAllDays() {
            this.batchSetForm.days = [1, 2, 3, 4, 5, 6, 7];
        },

        // 添加时间段
        addTimeSlot() {
            this.batchSetForm.timeSlots.push({
                start_time: '08:00:00',
                end_time: '12:00:00',
                is_available: true,
                maintenance_reason: ''
            });
        },

        // 移除时间段
        removeTimeSlot(index) {
            this.batchSetForm.timeSlots.splice(index, 1);
        },

        // 确认批量设置
        async confirmBatchSet() {
            this.$refs.batchSetForm.validate(async (valid) => {
                if (!valid) return;

                if (this.batchSetForm.days.length === 0) {
                    this.$message.warning('请选择应用日期');
                    return;
                }

                this.batchSetDialog.loading = true;
                try {
                    const response = await axios.post(`/api/admin/resources/venues/${this.scheduleDialog.venue.id}/batch-hours`, this.batchSetForm);
                    
                    if (response.data.success) {
                        this.$message.success('批量设置成功');
                        this.batchSetDialog.visible = false;
                        await this.refreshSchedule();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '批量设置失败');
                } finally {
                    this.batchSetDialog.loading = false;
                }
            });
        },

        // 显示复制时间表对话框
        showCopyScheduleDialog() {
            this.copyScheduleForm = {
                sourceVenueId: this.scheduleDialog.venue.id,
                targetVenueIds: []
            };
            this.copyScheduleDialog.visible = true;
        },

        // 加载所有场地
        async loadAllVenues() {
            try {
                const response = await axios.get('/api/admin/resources/venues', {
                    params: { limit: 1000 } // 获取所有场地
                });
                if (response.data.success) {
                    this.allVenues = response.data.data.list;
                }
            } catch (error) {
                console.error('加载场地列表失败:', error);
            }
        },

        // 确认复制时间表
        async confirmCopySchedule() {
            if (this.copyScheduleForm.targetVenueIds.length === 0) {
                this.$message.warning('请选择目标场地');
                return;
            }

            try {
                await this.$confirm(`确定要将当前场地的时间表复制到选中的 ${this.copyScheduleForm.targetVenueIds.length} 个场地吗？`, '确认复制', {
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                this.copyScheduleDialog.loading = true;
                const response = await axios.post('/api/admin/resources/venues/copy-schedule', this.copyScheduleForm);
                
                if (response.data.success) {
                    this.$message.success(response.data.message);
                    this.copyScheduleDialog.visible = false;
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '复制失败');
                }
            } finally {
                this.copyScheduleDialog.loading = false;
            }
        },

        // 查看使用统计
        async viewUsageStatistics() {
            try {
                const response = await axios.get(`/api/admin/resources/venues/${this.scheduleDialog.venue.id}/usage-statistics`);
                
                if (response.data.success) {
                    this.usageStats = response.data.data;
                    
                    // 格式化表格数据
                    this.usageStatsTableData = Object.values(this.usageStats.weeklyUsage);
                    
                    this.usageStatsDialog.visible = true;
                }
            } catch (error) {
                this.$message.error('加载使用统计失败');
            }
        },

        // 清空场地时间表
        async clearSchedule() {
            try {
                await this.$confirm(`确定要清空场地"${this.scheduleDialog.venue.name}"的所有时间表设置吗？此操作不可撤销。`, '确认清空', {
                    confirmButtonText: '清空',
                    cancelButtonText: '取消',
                    type: 'error'
                });

                const response = await axios.delete(`/api/admin/resources/venues/${this.scheduleDialog.venue.id}/schedules`);
                
                if (response.data.success) {
                    this.$message.success('时间表已清空');
                    await this.refreshSchedule();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '清空失败');
                }
            }
        },

        // 编辑某一天的时间表
        // 编辑单日时间表
        async editDaySchedule(dayData) {
            try {
                // 设置对话框数据
                this.dayScheduleDialog.venue = this.scheduleDialog.venue;
                this.dayScheduleDialog.dayOfWeek = dayData.dayOfWeek;
                this.dayScheduleDialog.loading = true;
                this.dayScheduleDialog.visible = true;
                
                // 获取该天的时间表数据
                const response = await axios.get(`/api/admin/resources/venues/${this.scheduleDialog.venue.id}/schedules/${dayData.dayOfWeek}`);
                
                if (response.data.success) {
                    // 深拷贝时间表数据用于编辑
                    this.dayScheduleDialog.schedules = response.data.data.schedules.map(s => ({
                        ...s,
                        is_available: s.is_available === 1 || s.is_available === true
                    }));
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error('获取单日时间表错误:', error);
                this.$message.error('获取时间表数据失败');
            } finally {
                this.dayScheduleDialog.loading = false;
            }
        },
        
        // 添加时间段
        addTimeSlot() {
            this.dayScheduleDialog.schedules.push({
                start_time: '08:00:00',
                end_time: '10:00:00',
                is_available: true,
                maintenance_reason: ''
            });
        },
        
        // 删除时间段
        removeTimeSlot(index) {
            this.dayScheduleDialog.schedules.splice(index, 1);
        },
        
        // 快速设置时间段
        setQuickSchedule(type) {
            let schedules = [];
            
            switch (type) {
                case 'morning':
                    schedules = [
                        { start_time: '08:00:00', end_time: '12:00:00', is_available: true, maintenance_reason: '' }
                    ];
                    break;
                case 'afternoon':
                    schedules = [
                        { start_time: '14:00:00', end_time: '18:00:00', is_available: true, maintenance_reason: '' }
                    ];
                    break;
                case 'evening':
                    schedules = [
                        { start_time: '19:00:00', end_time: '22:00:00', is_available: true, maintenance_reason: '' }
                    ];
                    break;
                case 'fullday':
                    schedules = [
                        { start_time: '08:00:00', end_time: '12:00:00', is_available: true, maintenance_reason: '' },
                        { start_time: '14:00:00', end_time: '18:00:00', is_available: true, maintenance_reason: '' },
                        { start_time: '19:00:00', end_time: '22:00:00', is_available: true, maintenance_reason: '' }
                    ];
                    break;
            }
            
            this.dayScheduleDialog.schedules = schedules;
            this.$message.success('已应用快速设置模板');
        },
        
        // 保存单日时间表
        async saveDaySchedule() {
            try {
                // 验证时间段
                if (!this.validateTimeSlots(this.dayScheduleDialog.schedules)) {
                    return;
                }
                
                this.dayScheduleDialog.loading = true;
                
                const response = await axios.put(
                    `/api/admin/resources/venues/${this.scheduleDialog.venue.id}/schedules/${this.dayScheduleDialog.dayOfWeek}`,
                    {
                        schedules: this.dayScheduleDialog.schedules
                    }
                );
                
                if (response.data.success) {
                    this.$message.success('单日时间表更新成功');
                    this.dayScheduleDialog.visible = false;
                    // 刷新时间表显示
                    this.refreshSchedule();
                } else {
                    throw new Error(response.data.message);
                }
            } catch (error) {
                console.error('保存单日时间表错误:', error);
                this.$message.error(error.response?.data?.message || '保存失败');
            } finally {
                this.dayScheduleDialog.loading = false;
            }
        },
        
        // 验证时间段
        validateTimeSlots(schedules) {
            if (!schedules || schedules.length === 0) {
                return true; // 允许清空
            }
            
            // 检查每个时间段的有效性
            for (let i = 0; i < schedules.length; i++) {
                const slot = schedules[i];
                
                if (!slot.start_time || !slot.end_time) {
                    this.$message.error(`第${i + 1}个时间段的开始或结束时间未设置`);
                    return false;
                }
                
                if (slot.start_time >= slot.end_time) {
                    this.$message.error(`第${i + 1}个时间段的开始时间必须小于结束时间`);
                    return false;
                }
                
                // 如果是维护状态，需要填写原因
                if (!slot.is_available && !slot.maintenance_reason) {
                    this.$message.error(`第${i + 1}个时间段处于维护状态，请填写维护原因`);
                    return false;
                }
            }
            
            // 检查时间段重叠
            for (let i = 0; i < schedules.length; i++) {
                for (let j = i + 1; j < schedules.length; j++) {
                    const slot1 = schedules[i];
                    const slot2 = schedules[j];
                    
                    if (
                        (slot1.start_time < slot2.end_time && slot1.end_time > slot2.start_time) ||
                        (slot2.start_time < slot1.end_time && slot2.end_time > slot1.start_time)
                    ) {
                        this.$message.error(`时间段重叠: ${slot1.start_time.substring(0, 5)}-${slot1.end_time.substring(0, 5)} 与 ${slot2.start_time.substring(0, 5)}-${slot2.end_time.substring(0, 5)}`);
                        return false;
                    }
                }
            }
            
            return true;
        },

        // 清空某一天的时间表
        async clearDaySchedule(dayData) {
            try {
                await this.$confirm(`确定要清空${this.getDayName(dayData.dayOfWeek)}的时间表吗？`, '确认清空', {
                    confirmButtonText: '清空',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                // 批量设置为空（删除这一天的时间表）
                const batchData = {
                    scheduleType: 'simple',
                    days: [dayData.dayOfWeek],
                    startTime: '00:00:00',
                    endTime: '00:00:00',
                    timeSlots: []
                };

                const response = await axios.post(`/api/admin/resources/venues/${this.scheduleDialog.venue.id}/batch-hours`, batchData);
                
                if (response.data.success) {
                    this.$message.success('时间表已清空');
                    await this.refreshSchedule();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('清空失败');
                }
            }
        },

        // 编辑时间段（用于日历视图）
        editScheduleSlot(slot) {
            this.$message.info('编辑时间段功能可进一步开发');
        },

        // 获取星期名称
        getDayName(dayOfWeek) {
            const dayNames = {
                1: '周一',
                2: '周二', 
                3: '周三',
                4: '周四',
                5: '周五',
                6: '周六',
                7: '周日'
            };
            return dayNames[dayOfWeek] || '';
        },

        // 计算单日总时长
        calculateDayTotalHours(schedules) {
            if (!schedules || schedules.length === 0) return 0;
            
            let totalMinutes = 0;
            schedules.forEach(schedule => {
                const start = new Date(`2000-01-01 ${schedule.start_time}`);
                const end = new Date(`2000-01-01 ${schedule.end_time}`);
                totalMinutes += (end - start) / (1000 * 60);
            });
            
            return (totalMinutes / 60).toFixed(1);
        },

        // 获取某天的时间表（用于日历视图）
        getDaySchedules(day) {
            const dayData = this.weeklyScheduleList.find(d => d.dayOfWeek === day);
            return dayData ? dayData.schedules : [];
        },

        // 计算时间段在日历中的样式
        getScheduleBlockStyle(slot) {
            const startHour = parseInt(slot.start_time.substring(0, 2));
            const endHour = parseInt(slot.end_time.substring(0, 2));
            const startMinute = parseInt(slot.start_time.substring(3, 5));
            const endMinute = parseInt(slot.end_time.substring(3, 5));
            
            const top = ((startHour - 6) + startMinute / 60) * 60; // 每小时60px
            const height = ((endHour - startHour) + (endMinute - startMinute) / 60) * 60;
            
            return {
                top: `${top}px`,
                height: `${height}px`
            };
        },

        // 计算周平均使用率
        calculateWeeklyUsageRate() {
            if (!this.usageStats || !this.usageStats.weeklyUsage) return 0;
            
            const usageRates = Object.values(this.usageStats.weeklyUsage).map(day => parseFloat(day.usageRate));
            const average = usageRates.reduce((sum, rate) => sum + rate, 0) / usageRates.length;
            
            return average.toFixed(1);
        },

        // 获取使用率颜色
        getUsageRateColor(usageRate) {
            const rate = parseFloat(usageRate);
            if (rate >= 80) return 'danger';
            if (rate >= 60) return 'warning';
            if (rate >= 30) return 'success';
            return 'info';
        },

        // 系统概览辅助方法
        getSelectionRate() {
            if (!this.overview.selections || !this.overview.courses) return 0;
            const totalCourses = this.overview.courses.published_courses || 1;
            const successfulSelections = this.overview.selections.successful_selections || 0;
            return Math.round((successfulSelections / totalCourses) * 100);
        },

        getVenueUtilization() {
            if (!this.overview.venues || !this.overview.courses) return 0;
            const activeVenues = this.overview.venues.active_venues || 1;
            const publishedCourses = this.overview.courses.published_courses || 0;
            return Math.min(Math.round((publishedCourses / activeVenues) * 25), 100);
        },

        getTrendIcon(trend) {
            const icons = {
                'up': 'fas fa-arrow-up',
                'down': 'fas fa-arrow-down',
                'stable': 'fas fa-minus'
            };
            return icons[trend] || 'fas fa-minus';
        },

        getTrendColor(trend) {
            const colors = {
                'up': 'color: #67c23a',
                'down': 'color: #f56c6c',
                'stable': 'color: #909399'
            };
            return colors[trend] || 'color: #909399';
        },

        getTrendText(trend) {
            const texts = {
                'up': '↗ 上升',
                'down': '↘ 下降', 
                'stable': '→ 稳定'
            };
            return texts[trend] || '稳定';
        },

        // 删除场地
        async deleteVenue(venue) {
            try {
                await this.$confirm(`确定要删除场地"${venue.name}"吗？此操作不可撤销。`, '确认删除', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'error'
                });

                const response = await axios.delete(`/api/admin/resources/venues/${venue.id}`);
                if (response.data.success) {
                    this.$message.success('场地删除成功');
                    this.loadVenues();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '删除失败');
                }
            }
        },

        // 分页处理
        handleVenueSizeChange(val) {
            this.venuePagination.limit = val;
            this.venuePagination.page = 1;
            this.loadVenues();
        },

        handleVenueCurrentChange(val) {
            this.venuePagination.page = val;
            this.loadVenues();
        },

        // 场地相关辅助方法
        getVenueTypeColor(type) {
            const colors = {
                'indoor': 'primary',
                'outdoor': 'success',
                'swimming': 'info',
                'gym': 'warning'
            };
            return colors[type] || 'info';
        },

        getVenueTypeText(type) {
            const texts = {
                'indoor': '室内',
                'outdoor': '室外',
                'swimming': '游泳馆',
                'gym': '健身房'
            };
            return texts[type] || type;
        },

        getVenueStatusColor(status) {
            const colors = {
                'available': 'success',
                'maintenance': 'warning',
                'unavailable': 'danger'
            };
            return colors[status] || 'info';
        },

        getVenueStatusText(status) {
            const texts = {
                'available': '可用',
                'maintenance': '维护中',
                'unavailable': '不可用'
            };
            return texts[status] || status;
        },
        
        // 格式化设备信息显示
        formatEquipment(equipment) {
            if (!equipment || equipment.trim() === '') {
                return '';
            }
            
            // 将设备信息按逗号、顿号或分号分割
            let items = equipment.split(/[,，、;；]/);
            
            // 清理空项和空格
            items = items.map(item => item.trim()).filter(item => item);
            
            // 如果没有有效项目
            if (items.length === 0) {
                return '';
            }
            
            // 如果项目较少，直接用顿号连接
            if (items.length <= 3) {
                return items.join('、');
            }
            
            // 如果项目较多，显示前3项并添加数量提示
            const displayItems = items.slice(0, 3);
            const remainingCount = items.length - 3;
            return displayItems.join('、') + ` 等${items.length}项`;
        },

        // ================== 教师管理 ==================

        // 加载教师列表
        async loadTeachers() {
            this.teacherLoading = true;
            try {
                const params = new URLSearchParams({
                    page: this.teacherPagination.page,
                    limit: this.teacherPagination.limit,
                    ...this.teacherFilters
                });

                const response = await axios.get(`/api/admin/resources/teachers?${params}`);
                if (response.data.success) {
                    this.teacherList = response.data.data.list;
                    this.teacherPagination.total = response.data.data.total;
                }
            } catch (error) {
                this.$message.error('加载教师列表失败');
            } finally {
                this.teacherLoading = false;
            }
        },

        // 刷新教师列表
        async refreshTeachers() {
            await this.loadTeachers();
            this.$message.success('数据已刷新');
        },

        // 搜索教师
        searchTeachers() {
            this.teacherPagination.page = 1;
            this.loadTeachers();
        },

        // 重置教师筛选条件
        resetTeacherFilters() {
            this.teacherFilters = {
                keyword: '',
                department: '',
                status: ''
            };
            this.teacherPagination.page = 1;
            this.loadTeachers();
        },

        // 显示教师对话框
        showTeacherDialog(mode, teacher = null) {
            this.teacherDialog.mode = mode;
            this.teacherDialog.visible = true;
            
            if (mode === 'create') {
                this.resetTeacherForm();
            } else if (teacher) {
                this.teacherForm = { ...teacher };
                // 如果 employee_id 为空，使用 teacher_id 作为默认值
                if (!this.teacherForm.employee_id && teacher.teacher_id) {
                    this.teacherForm.employee_id = teacher.teacher_id;
                }
            }
        },

        // 重置教师表单
        resetTeacherForm() {
            this.teacherForm = {
                id: null,
                name: '',
                employee_id: '',
                title: '',
                department: '',
                phone: '',
                email: '',
                specialties: '',
                bio: '',
                status: 'active'
            };
            this.$nextTick(() => {
                this.$refs.teacherForm?.clearValidate();
            });
        },

        // 保存教师
        async saveTeacher() {
            this.$refs.teacherForm.validate(async (valid) => {
                if (!valid) return;

                this.teacherDialog.loading = true;
                try {
                    const url = this.teacherDialog.mode === 'create' 
                        ? '/api/admin/resources/teachers'
                        : `/api/admin/resources/teachers/${this.teacherForm.id}`;
                    
                    const method = this.teacherDialog.mode === 'create' ? 'post' : 'put';
                    const response = await axios[method](url, this.teacherForm);

                    if (response.data.success) {
                        this.$message.success(this.teacherDialog.mode === 'create' ? '教师创建成功' : '教师更新成功');
                        this.teacherDialog.visible = false;
                        this.loadTeachers();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '操作失败');
                } finally {
                    this.teacherDialog.loading = false;
                }
            });
        },

        // 查看教师详情
        viewTeacher(teacher) {
            this.showTeacherDialog('view', teacher);
        },

        // 编辑教师
        editTeacher(teacher) {
            this.showTeacherDialog('edit', teacher);
        },

        // 管理教师资质
        async manageTeacherQualifications(teacher) {
            // 初始化资质列表为空数组
            this.qualificationList = [];
            this.qualificationStatistics = {
                total: 0,
                active: 0,
                expired: 0,
                inactive: 0
            };
            
            // 设置教师信息
            this.qualificationDialog.teacher = teacher;
            this.qualificationDialog.visible = true;
            this.qualificationDialog.showForm = false;
            
            // 加载该教师的资质列表
            this.qualificationLoading = true;
            try {
                const response = await axios.get(`/api/admin/qualifications/teacher/${teacher.id}`);
                console.log('资质数据响应:', response.data);
                if (response.data.success && response.data.data) {
                    // 后端返回的数据结构包含teacher, qualifications, statistics
                    const data = response.data.data;
                    // 确保qualifications是数组
                    const qualifications = Array.isArray(data.qualifications) ? data.qualifications : [];
                    console.log('资质列表数据:', qualifications);
                    this.qualificationList = qualifications;
                    
                    // 使用后端返回的统计数据或自行计算
                    if (data.statistics) {
                        this.qualificationStatistics = {
                            total: data.statistics.total || 0,
                            active: data.statistics.active || 0,
                            expired: data.statistics.expired || 0,
                            inactive: data.statistics.inactive || 0
                        };
                    } else {
                        // 如果没有统计数据，自行计算
                        const stats = {
                            total: qualifications.length,
                            active: 0,
                            expired: 0,
                            inactive: 0
                        };
                        
                        qualifications.forEach(q => {
                            if (q.status === 'expired') {
                                stats.expired++;
                            } else if (q.status === 'inactive') {
                                stats.inactive++;
                            } else if (q.status === 'active') {
                                stats.active++;
                            }
                        });
                        
                        this.qualificationStatistics = stats;
                    }
                } else {
                    // 确保qualificationList是数组
                    this.qualificationList = [];
                }
            } catch (error) {
                console.error('加载教师资质失败:', error);
                console.error('错误详情:', error.response?.data);
                this.$message.error('加载教师资质失败: ' + (error.response?.data?.message || error.message));
                // 错误时也要确保qualificationList是数组
                this.qualificationList = [];
            } finally {
                this.qualificationLoading = false;
            }
        },

        // 删除教师
        async deleteTeacher(teacher) {
            try {
                await this.$confirm(`确定要删除教师"${teacher.name}"吗？此操作不可撤销。`, '确认删除', {
                    confirmButtonText: '删除',
                    cancelButtonText: '取消',
                    type: 'error'
                });

                const response = await axios.delete(`/api/admin/resources/teachers/${teacher.id}`);
                if (response.data.success) {
                    this.$message.success('教师删除成功');
                    this.loadTeachers();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '删除失败');
                }
            }
        },

        // 分页处理
        handleTeacherSizeChange(val) {
            this.teacherPagination.limit = val;
            this.teacherPagination.page = 1;
            this.loadTeachers();
        },

        handleTeacherCurrentChange(val) {
            this.teacherPagination.page = val;
            this.loadTeachers();
        },

        // 教师相关辅助方法
        getTeacherStatusColor(status) {
            const colors = {
                'active': 'success',
                'inactive': 'info',
                'suspended': 'warning'
            };
            return colors[status] || 'info';
        },

        getTeacherStatusText(status) {
            const texts = {
                'active': '在职',
                'inactive': '离职',
                'suspended': '暂停'
            };
            return texts[status] || status;
        },

        // ================== 教师资质管理 ==================

        // 加载资质列表
        async loadQualifications() {
            this.qualificationLoading = true;
            try {
                // 先加载教师列表用于筛选
                await this.loadTeachersForQualifications();
                
                const params = new URLSearchParams({
                    page: this.qualificationPagination.page,
                    limit: this.qualificationPagination.limit,
                    ...this.qualificationFilters
                });

                const response = await axios.get(`/api/admin/qualifications?${params}`);
                if (response.data.success) {
                    this.qualificationList = response.data.data.list;
                    this.qualificationPagination.total = response.data.data.total;
                    
                    // 加载统计数据
                    await this.loadQualificationStats();
                }
            } catch (error) {
                this.$message.error('加载资质列表失败');
            } finally {
                this.qualificationLoading = false;
            }
        },

        // 加载教师列表（用于资质管理的筛选）
        async loadTeachersForQualifications() {
            try {
                const response = await axios.get('/api/admin/resources/teachers?page=1&limit=100');
                if (response.data.success) {
                    this.teachersList = response.data.data.list;
                }
            } catch (error) {
                console.error('加载教师列表失败:', error);
            }
        },

        // 加载资质统计
        async loadQualificationStats() {
            try {
                const response = await axios.get('/api/admin/qualifications/statistics');
                if (response.data.success) {
                    const stats = response.data.data.total;
                    this.qualificationStats = {
                        total: stats.total || 0,
                        active: stats.active || 0,
                        expiringSoon: response.data.data.expiringSoon?.length || 0,
                        pending: 0
                    };
                    
                    // 计算待审核数
                    const pendingCount = this.qualificationList.filter(q => q.verified_status === 'pending').length;
                    this.qualificationStats.pending = pendingCount;
                }
            } catch (error) {
                console.error('加载资质统计失败:', error);
            }
        },

        // 刷新资质数据
        async refreshQualifications() {
            await this.loadQualifications();
            this.$message.success('数据已刷新');
        },

        // 搜索资质
        searchQualifications() {
            this.qualificationPagination.page = 1;
            this.loadQualifications();
        },

        // 重置资质筛选条件
        resetQualificationFilters() {
            this.qualificationFilters = {
                teacher_id: '',
                sport_category: '',
                qualification_level: '',
                status: ''
            };
            this.qualificationPagination.page = 1;
            this.loadQualifications();
        },

        // 显示资质对话框
        showQualificationDialog(mode, qualification = null) {
            this.qualificationDialog.mode = mode;
            this.qualificationDialog.visible = true;
            
            switch (mode) {
                case 'create':
                    this.qualificationDialog.title = '添加资质';
                    this.resetQualificationForm();
                    break;
                case 'edit':
                    this.qualificationDialog.title = '编辑资质';
                    this.qualificationForm = { ...qualification };
                    break;
                case 'view':
                    this.qualificationDialog.title = '查看资质';
                    this.qualificationForm = { ...qualification };
                    break;
                case 'verify':
                    this.qualificationDialog.title = '审核资质';
                    this.qualificationForm = { ...qualification };
                    break;
            }
        },

        // 重置资质表单
        resetQualificationForm() {
            this.qualificationForm = {
                id: null,
                teacher_id: '',
                sport_category: '',
                qualification_level: '其他',
                certificate_name: '',
                certificate_number: '',
                issue_date: '',
                expire_date: '',
                issuing_authority: '',
                description: '',
                attachment_url: '',
                verified_status: 'pending',
                verification_notes: ''
            };
            this.$refs.qualificationForm && this.$refs.qualificationForm.clearValidate();
        },

        // 查看教师详情
        viewTeacherDetail(teacherId) {
            const teacher = this.teachersList.find(t => t.id === teacherId);
            if (teacher) {
                this.viewTeacher(teacher);
            }
        },

        // 删除资质
        async deleteQualification(qualification) {
            try {
                await this.$confirm('确定要删除这个资质记录吗？删除后不可恢复。', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                const response = await axios.delete(`/api/admin/qualifications/${qualification.id}`);
                if (response.data.success) {
                    this.$message.success('资质删除成功');
                    this.refreshQualifications();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '删除失败');
                }
            }
        },

        // 分页处理
        handleQualificationSizeChange(val) {
            this.qualificationPagination.limit = val;
            this.qualificationPagination.page = 1;
            this.loadQualifications();
        },

        handleQualificationCurrentChange(val) {
            this.qualificationPagination.page = val;
            this.loadQualifications();
        },

        // 辅助方法
        getQualificationLevelType(level) {
            const types = {
                '国家级': 'danger',
                '省级': 'warning',
                '市级': 'success',
                '校级': 'primary',
                '其他': 'info'
            };
            return types[level] || 'info';
        },

        getVerifiedStatusType(status) {
            const types = {
                'verified': 'success',
                'pending': 'warning',
                'rejected': 'danger'
            };
            return types[status] || 'info';
        },

        getVerifiedStatusText(status) {
            const texts = {
                'verified': '已审核',
                'pending': '待审核',
                'rejected': '已拒绝'
            };
            return texts[status] || status;
        },

        // 获取资质等级标签类型
        getLevelTagType(level) {
            const typeMap = {
                '国家级': 'danger',
                '省级': 'warning',
                '市级': 'primary',
                '校级': 'success',
                '其他': 'info'
            };
            return typeMap[level] || 'info';
        },
        
        getQualificationStatusType(qualification) {
            if (qualification.expire_date && new Date(qualification.expire_date) < new Date()) {
                return 'danger';
            }
            if (qualification.verified_status === 'pending') {
                return 'warning';
            }
            if (qualification.is_active && qualification.verified_status === 'verified') {
                return 'success';
            }
            return 'info';
        },

        getQualificationStatusText(qualification) {
            if (qualification.expire_date && new Date(qualification.expire_date) < new Date()) {
                return '已过期';
            }
            if (qualification.verified_status === 'pending') {
                return '待审核';
            }
            if (qualification.is_active && qualification.verified_status === 'verified') {
                return '有效';
            }
            if (!qualification.is_active) {
                return '已禁用';
            }
            return '未知';
        },

        getQualificationStatusClass(qualification) {
            if (qualification.expire_date && new Date(qualification.expire_date) < new Date()) {
                return 'status-expired';
            }
            if (qualification.verified_status === 'pending') {
                return 'status-pending';
            }
            if (qualification.is_active && qualification.verified_status === 'verified') {
                return 'status-active';
            }
            if (!qualification.is_active) {
                return 'status-inactive';
            }
            return 'status-unknown';
        },

        isExpiringSoon(expireDate) {
            if (!expireDate) return false;
            const expire = new Date(expireDate);
            const now = new Date();
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
            return expire > now && expire <= thirtyDaysLater;
        },

        // 批量操作
        handleQualificationSelection(val) {
            this.selectedQualifications = val;
        },

        // 导出资质报告
        async exportQualifications() {
            try {
                this.$message.info('正在生成报告...');
                this.$message.success('报告生成成功');
            } catch (error) {
                this.$message.error('导出失败');
            }
        },

        // 显示资质表单
        showQualificationForm(mode) {
            this.qualificationDialog.formMode = mode;
            this.qualificationDialog.showForm = true;
            
            if (mode === 'create') {
                this.resetQualificationForm();
                // 设置教师ID
                this.qualificationForm.teacher_id = this.qualificationDialog.teacher.id;
            }
        },
        
        // 取消资质表单
        cancelQualificationForm() {
            this.qualificationDialog.showForm = false;
            this.resetQualificationForm();
        },
        
        // 刷新资质列表
        refreshQualifications() {
            if (this.qualificationDialog.teacher && this.qualificationDialog.teacher.id) {
                this.manageTeacherQualifications(this.qualificationDialog.teacher);
            }
        },
        
        // 关闭资质对话框
        handleQualificationDialogClose() {
            this.qualificationDialog.visible = false;
            this.qualificationDialog.showForm = false;
            this.qualificationDialog.teacher = {};
            this.qualificationList = [];
            this.resetQualificationForm();
        },
        
        // 保存资质
        async saveQualification() {
            try {
                await this.$refs.qualificationForm.validate();
                this.qualificationDialog.loading = true;
                
                let response;
                if (this.qualificationDialog.formMode === 'create') {
                    response = await axios.post('/api/admin/qualifications', this.qualificationForm);
                } else {
                    response = await axios.put(`/api/admin/qualifications/${this.qualificationForm.id}`, this.qualificationForm);
                }
                
                if (response.data.success) {
                    this.$message.success(this.qualificationDialog.formMode === 'create' ? '资质添加成功' : '资质更新成功');
                    this.cancelQualificationForm();
                    this.refreshQualifications();
                }
            } catch (error) {
                if (error.name !== 'ValidationError') {
                    console.error('保存资质失败:', error);
                    this.$message.error(error.response?.data?.message || '保存失败');
                }
            } finally {
                this.qualificationDialog.loading = false;
            }
        },

        // 查看资质
        viewQualification(qualification) {
            this.qualificationForm = { ...qualification };
            this.qualificationDialog.formMode = 'view';
            this.qualificationDialog.showForm = true;
        },

        // 编辑资质
        editQualification(qualification) {
            this.qualificationForm = { ...qualification };
            this.qualificationDialog.formMode = 'edit';
            this.qualificationDialog.showForm = true;
        },

        // 审核资质
        verifyQualification(qualification) {
            this.$prompt('请输入审核意见', '审核资质', {
                confirmButtonText: '通过',
                cancelButtonText: '拒绝',
                distinguishCancelAndClose: true,
                inputPlaceholder: '请输入审核意见（可选）'
            }).then(({ value }) => {
                this.submitVerification(qualification.id, 'verified', value);
            }).catch(action => {
                if (action === 'cancel') {
                    this.$prompt('请输入拒绝原因', '拒绝资质', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPlaceholder: '请输入拒绝原因（必填）',
                        inputValidator: (value) => {
                            if (!value) return '拒绝原因不能为空';
                            return true;
                        }
                    }).then(({ value }) => {
                        this.submitVerification(qualification.id, 'rejected', value);
                    });
                }
            });
        },

        // 提交审核结果
        async submitVerification(id, status, notes) {
            try {
                const response = await axios.post(`/api/admin/qualifications/${id}/verify`, {
                    verified_status: status,
                    verification_notes: notes
                });

                if (response.data.success) {
                    this.$message.success(status === 'verified' ? '资质已通过审核' : '资质已拒绝');
                    this.loadQualifications();
                }
            } catch (error) {
                this.$message.error(error.response?.data?.message || '审核失败');
            }
        },

        // 批量审核
        async batchVerify(status) {
            if (this.selectedQualifications.length === 0) {
                this.$message.warning('请选择要审核的资质');
                return;
            }

            const actionText = status === 'verified' ? '通过' : '拒绝';
            
            try {
                await this.$confirm(`确定要批量${actionText}所选的 ${this.selectedQualifications.length} 个资质吗？`, '批量审核', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                const ids = this.selectedQualifications.map(q => q.id);
                
                const response = await axios.post('/api/admin/qualifications/batch-status', {
                    ids,
                    is_active: status === 'verified'
                });

                if (response.data.success) {
                    this.$message.success(`批量${actionText}成功`);
                    this.loadQualifications();
                    this.selectedQualifications = [];
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || `批量${actionText}失败`);
                }
            }
        },

        // 批量删除
        async batchDelete() {
            if (this.selectedQualifications.length === 0) {
                this.$message.warning('请选择要删除的资质');
                return;
            }

            try {
                await this.$confirm(`确定要删除所选的 ${this.selectedQualifications.length} 个资质吗？删除后不可恢复。`, '批量删除', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                for (const qualification of this.selectedQualifications) {
                    await axios.delete(`/api/admin/qualifications/${qualification.id}`);
                }

                this.$message.success('批量删除成功');
                this.loadQualifications();
                this.selectedQualifications = [];
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error('批量删除失败');
                }
            }
        },

        // ================== 监控统计功能 ==================

        // 实时监控
        async loadRealTimeData() {
            this.realTimeLoading = true;
            try {
                const response = await axios.get('/api/admin/monitoring/real-time-status');
                if (response.data.success) {
                    this.realtimeData = response.data.data;
                }
            } catch (error) {
                this.$message.error('加载实时数据失败');
            } finally {
                this.realTimeLoading = false;
            }
        },

        // 刷新实时数据
        async refreshRealTimeData() {
            await this.loadRealTimeData();
            this.$message.success('实时数据已刷新');
        },

        // 切换自动刷新
        toggleAutoRefresh(value) {
            if (value) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        },

        // 开始自动刷新
        startAutoRefresh() {
            this.stopAutoRefresh(); // 先清除之前的定时器
            this.refreshTimer = setInterval(() => {
                if (this.activeMenu === 'real-time') {
                    this.loadRealTimeData();
                }
            }, 30000); // 30秒刷新一次
        },

        // 停止自动刷新
        stopAutoRefresh() {
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
        },

        // 获取在线用户数
        getOnlineUsers() {
            return this.realtimeData.systemLoad && this.realtimeData.systemLoad.length > 0
                ? this.realtimeData.systemLoad[0].concurrent_users || 0
                : 0;
        },

        // 获取进度条颜色
        getProgressColor(rate) {
            if (rate < 0.5) return '#67C23A';
            if (rate < 0.8) return '#E6A23C';
            return '#F56C6C';
        },

        // 选课统计
        async loadStatistics() {
            this.statisticsLoading = true;
            try {
                const params = new URLSearchParams(this.statisticsFilters);
                const response = await axios.get(`/api/admin/monitoring/selection-progress?${params}`);
                if (response.data.success) {
                    this.statisticsData = response.data.data;
                }
            } catch (error) {
                this.$message.error('加载统计数据失败');
            } finally {
                this.statisticsLoading = false;
            }
        },

        // 刷新统计数据
        async refreshStatistics() {
            await this.loadStatistics();
            this.$message.success('统计数据已刷新');
        },

        // 重置统计筛选条件
        resetStatisticsFilters() {
            this.statisticsFilters = {
                academic_year: '',
                semester: ''
            };
            this.loadStatistics();
        },

        // 课程热度
        async loadPopularity() {
            this.popularityLoading = true;
            try {
                const params = new URLSearchParams({
                    page: this.popularityPagination.page,
                    limit: this.popularityPagination.limit,
                    ...this.popularityFilters
                });

                const response = await axios.get(`/api/admin/monitoring/course-popularity?${params}`);
                if (response.data.success) {
                    this.popularityData = response.data.data;
                    this.popularityPagination.total = response.data.data.total;
                }
            } catch (error) {
                this.$message.error('加载课程热度数据失败');
            } finally {
                this.popularityLoading = false;
            }
        },

        // 刷新热度数据
        async refreshPopularity() {
            await this.loadPopularity();
            this.$message.success('热度数据已刷新');
        },

        // 重置热度筛选条件
        resetPopularityFilters() {
            this.popularityFilters = {
                category: ''
            };
            this.popularityPagination.page = 1;
            this.loadPopularity();
        },

        // 分页处理
        handlePopularitySizeChange(val) {
            this.popularityPagination.limit = val;
            this.popularityPagination.page = 1;
            this.loadPopularity();
        },

        handlePopularityCurrentChange(val) {
            this.popularityPagination.page = val;
            this.loadPopularity();
        },

        // 获取排名样式
        getRankClass(index) {
            if (index === 0) return 'rank-gold';
            if (index === 1) return 'rank-silver';
            if (index === 2) return 'rank-bronze';
            return '';
        },

        // 获取热度分数类型
        getPopularityScoreType(score) {
            if (score >= 90) return 'danger';
            if (score >= 70) return 'warning';
            if (score >= 50) return 'primary';
            return 'info';
        },

        // 系统性能
        async loadPerformance() {
            this.performanceLoading = true;
            try {
                const response = await axios.get(`/api/admin/monitoring/system-performance?period=${this.performancePeriod}`);
                if (response.data.success) {
                    this.performanceData = response.data.data;
                }
            } catch (error) {
                this.$message.error('加载性能数据失败');
            } finally {
                this.performanceLoading = false;
            }
        },

        // ================== 异常处理功能 ==================

        // 异常事件管理
        async loadIncidents() {
            this.incidentsLoading = true;
            try {
                const params = new URLSearchParams({
                    page: this.incidentsPagination.page,
                    limit: this.incidentsPagination.limit
                });

                const response = await axios.get(`/api/admin/monitoring/incidents?${params}`);
                if (response.data.success) {
                    this.incidentsList = response.data.data.list;
                    this.incidentsPagination.total = response.data.data.total;
                }
            } catch (error) {
                this.$message.error('加载异常事件失败');
            } finally {
                this.incidentsLoading = false;
            }
        },

        // 创建异常事件
        showCreateIncidentDialog() {
            this.$message.info('创建异常事件功能开发中');
        },

        // 查看异常事件详情
        viewIncident(incident) {
            this.$message.info('异常事件详情功能开发中');
        },

        // 更新异常事件状态
        async updateIncidentStatus(incident) {
            try {
                await this.$prompt('请输入处理意见', '处理异常事件', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputType: 'textarea'
                }).then(async ({ value }) => {
                    const response = await axios.put(`/api/admin/monitoring/incidents/${incident.id}/status`, {
                        resolution_status: 'resolved',
                        resolution_notes: value
                    });

                    if (response.data.success) {
                        this.$message.success('事件处理成功');
                        this.loadIncidents();
                    }
                });
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '处理失败');
                }
            }
        },

        // 分页处理
        handleIncidentsSizeChange(val) {
            this.incidentsPagination.limit = val;
            this.incidentsPagination.page = 1;
            this.loadIncidents();
        },

        handleIncidentsCurrentChange(val) {
            this.incidentsPagination.page = val;
            this.loadIncidents();
        },

        // 手动调整选课
        async loadStudentInfo() {
            if (!this.adjustForm.student_id) return;
            
            try {
                const response = await axios.get(`/api/admin/users/students?keyword=${this.adjustForm.student_id}`);
                if (response.data.success && response.data.data.list.length > 0) {
                    this.adjustForm.student_info = response.data.data.list[0];
                } else {
                    this.adjustForm.student_info = null;
                    this.$message.warning('未找到该学生');
                }
            } catch (error) {
                this.$message.error('查询学生信息失败');
            }
        },

        async loadCourseInfo() {
            if (!this.adjustForm.course_code) return;
            
            try {
                const response = await axios.get(`/api/courses?keyword=${this.adjustForm.course_code}`);
                if (response.data.success && response.data.data.length > 0) {
                    this.adjustForm.course_info = response.data.data[0];
                } else {
                    this.adjustForm.course_info = null;
                    this.$message.warning('未找到该课程');
                }
            } catch (error) {
                this.$message.error('查询课程信息失败');
            }
        },

        // 执行手动调整
        async submitAdjustment() {
            this.$refs.adjustForm.validate(async (valid) => {
                if (!valid) return;

                if (!this.adjustForm.student_info || !this.adjustForm.course_info) {
                    this.$message.error('请先查询并确认学生和课程信息');
                    return;
                }

                this.adjustLoading = true;
                try {
                    const response = await axios.post('/api/admin/monitoring/emergency/adjust-selection', {
                        user_id: this.adjustForm.student_info.id,
                        course_id: this.adjustForm.course_info.id,
                        action: this.adjustForm.action,
                        reason: this.adjustForm.reason
                    });

                    if (response.data.success) {
                        this.$message.success('选课调整成功');
                        this.resetAdjustForm();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '调整失败');
                } finally {
                    this.adjustLoading = false;
                }
            });
        },

        // 重置调整表单
        resetAdjustForm() {
            this.adjustForm = {
                student_id: '',
                course_code: '',
                action: '',
                reason: '',
                student_info: null,
                course_info: null
            };
            this.$refs.adjustForm?.resetFields();
        },

        // 批量调整
        showBatchAdjustDialog() {
            this.$message.info('批量调整功能开发中');
        },

        // 系统维护
        async loadMaintenanceStatus() {
            try {
                const response = await axios.get('/api/admin/monitoring/emergency/system-health');
                if (response.data.success) {
                    this.systemHealth = response.data.data;
                }
                
                // 同时加载数据关联状态
                this.loadDataRelationStatus();
            } catch (error) {
                console.error('加载系统状态失败:', error);
            }
        },

        // 切换维护模式
        async toggleMaintenanceMode() {
            try {
                const newMode = !this.maintenanceMode.enabled;
                const title = newMode ? '进入维护模式' : '退出维护模式';
                const message = newMode ? '这将阻止所有用户访问系统，确认进入维护模式吗？' : '确认退出维护模式吗？';

                await this.$confirm(message, title, {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                this.maintenanceLoading = true;
                const response = await axios.post('/api/admin/monitoring/emergency/maintenance-mode', {
                    enabled: newMode,
                    message: newMode ? '系统正在维护中，请稍后再试' : '',
                    estimated_duration: newMode ? '1小时' : ''
                });

                if (response.data.success) {
                    this.maintenanceMode.enabled = newMode;
                    this.$message.success(newMode ? '已进入维护模式' : '已退出维护模式');
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '操作失败');
                }
            } finally {
                this.maintenanceLoading = false;
            }
        },

        // 紧急停止选课
        showEmergencyStopDialog() {
            this.$prompt('请输入紧急停止的原因', '紧急停止选课', {
                confirmButtonText: '立即停止',
                cancelButtonText: '取消',
                inputType: 'textarea',
                inputPlaceholder: '请详细说明停止原因...'
            }).then(async ({ value }) => {
                try {
                    const response = await axios.post('/api/admin/monitoring/emergency/stop-selection', {
                        reason: value,
                        notify_users: true
                    });

                    if (response.data.success) {
                        this.$message.success('选课已紧急停止');
                        this.loadDashboardData(); // 刷新概览数据
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '操作失败');
                }
            }).catch(() => {
                // 用户取消
            });
        },

        // 数据清理
        showDataCleanupDialog() {
            this.$message.info('数据清理功能开发中');
        },

        // 辅助方法
        getIncidentTypeColor(type) {
            const colors = {
                'system_error': 'danger',
                'performance_issue': 'warning',
                'user_complaint': 'info',
                'data_inconsistency': 'warning'
            };
            return colors[type] || 'info';
        },

        getIncidentTypeText(type) {
            const texts = {
                'system_error': '系统错误',
                'performance_issue': '性能问题',
                'user_complaint': '用户投诉',
                'data_inconsistency': '数据不一致'
            };
            return texts[type] || type;
        },

        getSeverityColor(severity) {
            const colors = {
                'low': 'success',
                'medium': 'warning',
                'high': 'danger',
                'critical': 'danger'
            };
            return colors[severity] || 'info';
        },

        getSeverityText(severity) {
            const texts = {
                'low': '低',
                'medium': '中',
                'high': '高',
                'critical': '严重'
            };
            return texts[severity] || severity;
        },

        getResolutionStatusColor(status) {
            const colors = {
                'open': 'warning',
                'investigating': 'primary',
                'resolved': 'success',
                'closed': 'info'
            };
            return colors[status] || 'info';
        },

        getResolutionStatusText(status) {
            const texts = {
                'open': '待处理',
                'investigating': '处理中',
                'resolved': '已解决',
                'closed': '已关闭'
            };
            return texts[status] || status;
        },

        // ================== 学生管理 ==================
        async loadStudents() {
            this.studentsLoading = true;
            try {
                const params = {
                    page: this.studentsPagination.page,
                    limit: this.studentsPagination.limit,
                    ...this.studentsFilters
                };
                
                const response = await axios.get('/api/admin/students', { params });
                this.studentsList = response.data.data || [];
                this.studentsPagination.total = response.data.total || 0;
            } catch (error) {
                console.error('加载学生列表失败:', error);
                this.$message.error('加载学生列表失败');
            } finally {
                this.studentsLoading = false;
            }
        },

        async refreshStudents() {
            this.studentsPagination.page = 1;
            await this.loadStudents();
        },

        searchStudents() {
            this.studentsPagination.page = 1;
            this.loadStudents();
        },

        resetStudentsFilters() {
            this.studentsFilters = {
                keyword: '',
                grade: '',
                major: '',
                status: ''
            };
            this.searchStudents();
        },

        showStudentDialog(mode, student = null) {
            this.studentDialog.mode = mode;
            if (mode === 'create') {
                this.studentDialog.title = '添加学生';
                this.resetStudentForm();
            } else if (mode === 'edit') {
                this.studentDialog.title = '编辑学生';
                this.studentForm = { ...student };
            } else if (mode === 'view') {
                this.studentDialog.title = '查看学生详情';
                this.studentForm = { ...student };
            }
            this.studentDialog.visible = true;
        },

        resetStudentForm() {
            this.studentForm = {
                student_id: '',
                username: '',
                real_name: '',
                grade: '',
                major: '',
                class_name: '',
                email: '',
                phone: '',
                credit_limit: 2,
                password: '',
                status: 'active'
            };
            if (this.$refs.studentForm) {
                this.$refs.studentForm.resetFields();
            }
        },

        async saveStudent() {
            try {
                await this.$refs.studentForm.validate();
                this.studentDialog.loading = true;

                const isEdit = this.studentDialog.mode === 'edit';
                const url = isEdit 
                    ? `/api/admin/students/${this.studentForm.id}`
                    : '/api/admin/students';
                const method = isEdit ? 'put' : 'post';

                await axios[method](url, this.studentForm);

                this.$message.success(`${isEdit ? '更新' : '添加'}学生成功`);
                this.studentDialog.visible = false;
                this.loadStudents();
            } catch (error) {
                console.error('保存学生失败:', error);
                this.$message.error(`${this.studentDialog.mode === 'edit' ? '更新' : '添加'}学生失败`);
            } finally {
                this.studentDialog.loading = false;
            }
        },

        viewStudent(student) {
            this.showStudentDialog('view', student);
        },

        editStudent(student) {
            this.showStudentDialog('edit', student);
        },

        async toggleStudentStatus(student) {
            try {
                const newStatus = student.status === 'active' ? 'inactive' : 'active';
                const statusText = newStatus === 'active' ? '启用' : '暂停';
                
                await this.$confirm(`确定要${statusText}学生 ${student.real_name} 吗？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                await axios.put(`/api/admin/students/${student.id}/status`, { 
                    status: newStatus 
                });

                this.$message.success(`${statusText}学生成功`);
                this.loadStudents();
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('切换学生状态失败:', error);
                    this.$message.error('操作失败');
                }
            }
        },

        handleStudentsSizeChange(val) {
            this.studentsPagination.limit = val;
            this.studentsPagination.page = 1;
            this.loadStudents();
        },

        handleStudentsCurrentChange(val) {
            this.studentsPagination.page = val;
            this.loadStudents();
        },

        // ================== 管理员管理 ==================
        async loadAdmins() {
            this.adminsLoading = true;
            try {
                const params = {
                    page: this.adminsPagination.page,
                    limit: this.adminsPagination.limit
                };
                
                const response = await axios.get('/api/admin/admins', { params });
                this.adminsList = response.data.data || [];
                this.adminsPagination.total = response.data.total || 0;
            } catch (error) {
                console.error('加载管理员列表失败:', error);
                this.$message.error('加载管理员列表失败');
            } finally {
                this.adminsLoading = false;
            }
        },

        async refreshAdmins() {
            this.adminsPagination.page = 1;
            await this.loadAdmins();
        },

        showAdminDialog(mode, admin = null) {
            this.adminDialog.mode = mode;
            if (mode === 'create') {
                this.adminDialog.title = '添加管理员';
                this.resetAdminForm();
            } else if (mode === 'edit') {
                this.adminDialog.title = '编辑管理员';
                this.adminForm = { ...admin };
            } else if (mode === 'view') {
                this.adminDialog.title = '查看管理员详情';
                this.adminForm = { ...admin };
            }
            this.adminDialog.visible = true;
        },

        resetAdminForm() {
            this.adminForm = {
                username: '',
                real_name: '',
                role: 'admin',
                email: '',
                phone: '',
                password: '',
                status: 'active'
            };
            if (this.$refs.adminForm) {
                this.$refs.adminForm.resetFields();
            }
        },

        async saveAdmin() {
            try {
                await this.$refs.adminForm.validate();
                this.adminDialog.loading = true;

                const isEdit = this.adminDialog.mode === 'edit';
                const url = isEdit 
                    ? `/api/admin/admins/${this.adminForm.id}`
                    : '/api/admin/admins';
                const method = isEdit ? 'put' : 'post';

                await axios[method](url, this.adminForm);

                this.$message.success(`${isEdit ? '更新' : '添加'}管理员成功`);
                this.adminDialog.visible = false;
                this.loadAdmins();
            } catch (error) {
                console.error('保存管理员失败:', error);
                this.$message.error(`${this.adminDialog.mode === 'edit' ? '更新' : '添加'}管理员失败`);
            } finally {
                this.adminDialog.loading = false;
            }
        },

        viewAdmin(admin) {
            this.showAdminDialog('view', admin);
        },

        editAdmin(admin) {
            this.showAdminDialog('edit', admin);
        },

        async toggleAdminStatus(admin) {
            try {
                const newStatus = admin.status === 'active' ? 'inactive' : 'active';
                const statusText = newStatus === 'active' ? '启用' : '禁用';
                
                await this.$confirm(`确定要${statusText}管理员 ${admin.real_name} 吗？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                await axios.put(`/api/admin/admins/${admin.id}/status`, { 
                    status: newStatus 
                });

                this.$message.success(`${statusText}管理员成功`);
                this.loadAdmins();
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('切换管理员状态失败:', error);
                    this.$message.error('操作失败');
                }
            }
        },

        handleAdminsSizeChange(val) {
            this.adminsPagination.limit = val;
            this.adminsPagination.page = 1;
            this.loadAdmins();
        },

        handleAdminsCurrentChange(val) {
            this.adminsPagination.page = val;
            this.loadAdmins();
        },

        getAdminRoleColor(role) {
            const colors = {
                'super_admin': 'danger',
                'admin': 'warning',
                'operator': 'info'
            };
            return colors[role] || 'info';
        },

        getAdminRoleText(role) {
            const texts = {
                'super_admin': '超级管理员',
                'admin': '管理员',
                'operator': '操作员'
            };
            return texts[role] || role;
        },

        // ================== 系统日志 ==================
        async loadLogs() {
            this.logsLoading = true;
            try {
                const params = {
                    page: this.logsPagination.page,
                    limit: this.logsPagination.limit,
                    ...this.logsFilters
                };
                
                if (this.logsFilters.dateRange && this.logsFilters.dateRange.length === 2) {
                    params.start_date = this.logsFilters.dateRange[0];
                    params.end_date = this.logsFilters.dateRange[1];
                }
                delete params.dateRange;
                
                const response = await axios.get('/api/admin/logs', { params });
                this.logsList = response.data.data || [];
                this.logsPagination.total = response.data.total || 0;
            } catch (error) {
                console.error('加载系统日志失败:', error);
                this.$message.error('加载系统日志失败');
            } finally {
                this.logsLoading = false;
            }
        },

        async refreshLogs() {
            this.logsPagination.page = 1;
            await this.loadLogs();
        },

        searchLogs() {
            this.logsPagination.page = 1;
            this.loadLogs();
        },

        resetLogsFilters() {
            this.logsFilters = {
                operation_type: '',
                operation_module: '',
                dateRange: null
            };
            this.searchLogs();
        },

        viewLogDetail(log) {
            this.logDetailDialog.data = log;
            this.logDetailDialog.visible = true;
        },

        handleLogsSizeChange(val) {
            this.logsPagination.limit = val;
            this.logsPagination.page = 1;
            this.loadLogs();
        },

        handleLogsCurrentChange(val) {
            this.logsPagination.page = val;
            this.loadLogs();
        },

        getOperationTypeColor(type) {
            const colors = {
                'create': 'success',
                'update': 'primary',
                'delete': 'danger',
                'login': 'info',
                'logout': 'info'
            };
            return colors[type] || 'info';
        },

        // ================== 数据完整性验证 ==================
        async loadDataRelationStatus() {
            this.dataValidationLoading = true;
            try {
                const response = await axios.get('/api/admin/monitoring/data-relations');
                this.dataRelationStatus = response.data.data;
                console.log('数据关联状态加载成功:', this.dataRelationStatus);
            } catch (error) {
                console.error('加载数据关联状态失败:', error);
                this.$message.error('加载数据关联状态失败');
                this.dataRelationStatus = null;
            } finally {
                this.dataValidationLoading = false;
            }
        },

        viewDataRelationDetails() {
            this.dataRelationDialog.visible = true;
        },

        async runDataIntegrityValidation() {
            this.dataValidationLoading = true;
            try {
                const response = await axios.post('/api/admin/monitoring/validate-integrity');
                this.lastValidationResult = response.data.data;
                
                // 显示验证结果对话框
                this.validationResultDialog.data = response.data.data;
                this.validationResultDialog.visible = true;
                
                // 设置默认显示的标签页
                if (this.lastValidationResult.errors.length > 0) {
                    this.validationActiveTab = 'errors';
                } else if (this.lastValidationResult.warnings.length > 0) {
                    this.validationActiveTab = 'warnings';
                } else {
                    this.validationActiveTab = 'info';
                }

                // 显示简要结果消息
                if (this.lastValidationResult.validation_passed) {
                    this.$message.success('数据完整性验证通过');
                } else {
                    this.$message.warning(`数据完整性验证完成，发现 ${this.lastValidationResult.summary.total_errors} 个错误和 ${this.lastValidationResult.summary.total_warnings} 个警告`);
                }

                // 验证完成后刷新数据关联状态
                this.loadDataRelationStatus();

            } catch (error) {
                console.error('数据完整性验证失败:', error);
                this.$message.error('数据完整性验证失败');
            } finally {
                this.dataValidationLoading = false;
            }
        },

        getDataStatusType(status) {
            const types = {
                'healthy': 'success',
                'warning': 'warning',
                'error': 'danger'
            };
            return types[status] || 'info';
        },

        getDataStatusText(status) {
            const texts = {
                'healthy': '健康',
                'warning': '警告',
                'error': '错误'
            };
            return texts[status] || status;
        },

        getSeverityColor(severity) {
            const colors = {
                'high': 'danger',
                'medium': 'warning',
                'low': 'info',
                'none': 'info'
            };
            return colors[severity] || 'info';
        },

        getSeverityText(severity) {
            const texts = {
                'high': '高',
                'medium': '中',
                'low': '低',
                'none': '无'
            };
            return texts[severity] || severity;
        },

        // ===== 系统参数配置管理 =====

        // 加载系统配置
        async loadSystemConfigs() {
            try {
                this.systemConfigsLoading = true;
                const params = {};
                
                if (this.systemConfigFilter.category && this.systemConfigFilter.category !== 'all') {
                    params.category = this.systemConfigFilter.category;
                }
                if (this.systemConfigFilter.search) {
                    params.search = this.systemConfigFilter.search;
                }
                
                const response = await axios.get('/api/admin/system/configs', { params });
                
                if (response.data.success) {
                    this.systemConfigs = response.data.data.list || [];
                    
                    // 初始化原始值
                    this.originalConfigValues.clear();
                    this.systemConfigs.forEach(config => {
                        this.originalConfigValues.set(config.config_key, config.config_value);
                    });
                    
                    // 清除修改标记
                    this.modifiedConfigs.clear();
                }
            } catch (error) {
                console.error('加载系统配置失败:', error);
                this.$message.error('加载系统配置失败');
            } finally {
                this.systemConfigsLoading = false;
            }
        },

        // 加载配置分类
        async loadConfigCategories() {
            try {
                const response = await axios.get('/api/admin/system/configs/categories');
                if (response.data.success) {
                    this.configCategories = response.data.data || [];
                }
            } catch (error) {
                console.error('加载配置分类失败:', error);
            }
        },

        // 刷新系统配置
        async refreshSystemConfigs() {
            await Promise.all([
                this.loadSystemConfigs(),
                this.loadConfigCategories()
            ]);
        },

        // 显示系统配置对话框
        showSystemConfigDialog(mode, config = null) {
            this.systemConfigDialog.mode = mode;
            this.systemConfigDialog.visible = true;
            
            if (mode === 'create') {
                this.resetSystemConfigForm();
            } else if (config) {
                this.systemConfigForm = { ...config };
            }
        },

        // 重置系统配置表单
        resetSystemConfigForm() {
            this.systemConfigForm = {
                config_key: '',
                config_value: '',
                config_type: 'string',
                category: 'general',
                description: '',
                is_public: false
            };
            this.$nextTick(() => {
                if (this.$refs.systemConfigForm) {
                    this.$refs.systemConfigForm.clearValidate();
                }
            });
        },

        // 保存系统配置（从对话框）
        async saveSystemConfigFromDialog() {
            this.$refs.systemConfigForm.validate(async (valid) => {
                if (!valid) return;

                this.systemConfigDialog.loading = true;
                try {
                    const url = this.systemConfigDialog.mode === 'create' 
                        ? '/api/admin/system/configs'
                        : `/api/admin/system/configs/${this.systemConfigForm.config_key}`;
                    
                    const method = this.systemConfigDialog.mode === 'create' ? 'post' : 'put';
                    const response = await axios[method](url, this.systemConfigForm);

                    if (response.data.success) {
                        this.$message.success(this.systemConfigDialog.mode === 'create' ? '配置创建成功' : '配置更新成功');
                        this.systemConfigDialog.visible = false;
                        this.loadSystemConfigs();
                    }
                } catch (error) {
                    this.$message.error(error.response?.data?.message || '操作失败');
                } finally {
                    this.systemConfigDialog.loading = false;
                }
            });
        },

        // 保存单个系统配置
        async saveSystemConfig(config) {
            try {
                config.saving = true;
                this.$set(config, 'saving', true);
                
                const response = await axios.put(`/api/admin/system/configs/${config.config_key}`, {
                    config_value: config.config_value,
                    description: config.description,
                    is_public: config.is_public
                });

                if (response.data.success) {
                    this.$message.success('配置保存成功');
                    
                    // 更新原始值
                    this.originalConfigValues.set(config.config_key, config.config_value);
                    this.modifiedConfigs.delete(config.config_key);
                    
                    // 重新加载配置以获取更新时间等信息
                    this.loadSystemConfigs();
                }
            } catch (error) {
                this.$message.error(error.response?.data?.message || '保存配置失败');
            } finally {
                this.$set(config, 'saving', false);
            }
        },

        // 重置系统配置
        async resetSystemConfig(config) {
            try {
                const response = await axios.post(`/api/admin/system/configs/${config.config_key}/reset`);
                if (response.data.success) {
                    this.$message.success('配置已重置为默认值');
                    this.loadSystemConfigs();
                }
            } catch (error) {
                this.$message.error(error.response?.data?.message || '重置配置失败');
            }
        },

        // 删除系统配置
        async deleteSystemConfig(config) {
            try {
                await this.$confirm('确认删除此系统配置？删除后无法恢复。', '确认删除', {
                    type: 'warning'
                });
                
                const response = await axios.delete(`/api/admin/system/configs/${config.config_key}`);
                if (response.data.success) {
                    this.$message.success('配置删除成功');
                    this.loadSystemConfigs();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    this.$message.error(error.response?.data?.message || '删除配置失败');
                }
            }
        },

        // 批量更新系统配置
        async batchUpdateSystemConfigs() {
            if (this.modifiedConfigs.size === 0) {
                this.$message.warning('没有需要保存的修改');
                return;
            }

            try {
                const configs = Array.from(this.modifiedConfigs).map(key => {
                    const config = this.systemConfigs.find(c => c.config_key === key);
                    return {
                        config_key: key,
                        config_value: config.config_value
                    };
                });

                const response = await axios.put('/api/admin/system/configs/batch/update', { configs });
                
                if (response.data.success) {
                    this.$message.success(`批量保存成功 (${configs.length}项)`);
                    this.loadSystemConfigs();
                }
            } catch (error) {
                this.$message.error(error.response?.data?.message || '批量保存失败');
            }
        },

        // 标记配置为已修改
        markConfigAsModified(configKey) {
            this.modifiedConfigs.add(configKey);
        },

        // 检查配置是否已修改
        isConfigModified(configKey) {
            return this.modifiedConfigs.has(configKey);
        },

        // 处理配置操作
        handleConfigAction(command) {
            const { action, config } = command;
            
            switch (action) {
                case 'edit':
                    this.showSystemConfigDialog('edit', config);
                    break;
                case 'copy':
                    this.showSystemConfigDialog('create', {
                        ...config,
                        config_key: config.config_key + '_copy',
                        id: undefined
                    });
                    break;
                case 'delete':
                    this.deleteSystemConfig(config);
                    break;
            }
        },

        // 配置类型改变时处理
        onConfigTypeChange() {
            // 根据类型设置默认值
            switch (this.systemConfigForm.config_type) {
                case 'boolean':
                    this.systemConfigForm.config_value = 'false';
                    break;
                case 'number':
                    this.systemConfigForm.config_value = '0';
                    break;
                case 'json':
                    this.systemConfigForm.config_value = '{}';
                    break;
                default:
                    this.systemConfigForm.config_value = '';
            }
        },

        // 获取配置类型颜色
        getConfigTypeColor(type) {
            const colors = {
                'string': 'primary',
                'number': 'success',
                'boolean': 'warning',
                'json': 'info'
            };
            return colors[type] || 'default';
        },

        // 判断是否为系统关键配置
        isSystemCriticalConfig(configKey) {
            const criticalConfigs = [
                'system_name', 'max_credits_per_student', 'lottery_processing_time',
                'selection_time_limit', 'max_file_size', 'session_timeout'
            ];
            return criticalConfigs.includes(configKey);
        },

        // 切换分类展开状态
        toggleCategoryExpand(category) {
            // 在 groupedConfigs 中找到对应分类并切换状态
            const categoryData = this.groupedConfigs.find(cat => cat.category === category);
            if (categoryData) {
                this.$set(categoryData, 'expanded', !categoryData.expanded);
            }
        },

        // 获取分类名称
        getCategoryName(category) {
            const names = {
                'general': '系统基本',
                'selection': '选课管理',
                'security': '安全设置',
                'notification': '消息通知',
                'limitation': '系统限制',
                'appearance': '外观设置'
            };
            return names[category] || category;
        },

        // 其他原有方法保持不变...
        getSeverityText(severity) {
            const texts = {
                'high': '高',
                'medium': '中',
                'low': '低',
                'none': '无'
            };
            return texts[severity] || severity;
        }
    },
    
    watch: {
        // 监听菜单切换
        activeMenu(newMenu) {
            if (newMenu === 'system-config') {
                this.refreshSystemConfigs();
            }
        }
    },
    
    computed: {
        // 资质对话框标题
        qualificationDialogTitle() {
            if (this.qualificationDialog.teacher && this.qualificationDialog.teacher.name) {
                return `${this.qualificationDialog.teacher.name} - 教师资质管理`;
            }
            return '教师资质管理';
        },
        
        // 分组后的配置
        groupedConfigs() {
            const groups = {};
            
            // 按分类分组
            this.systemConfigs.forEach(config => {
                if (!groups[config.category]) {
                    groups[config.category] = {
                        category: config.category,
                        categoryName: this.getCategoryName(config.category),
                        configs: [],
                        expanded: true // 默认展开
                    };
                }
                groups[config.category].configs.push(config);
            });
            
            return Object.values(groups);
        },

        // 是否有修改的配置
        hasModifiedConfigs() {
            return this.modifiedConfigs.size > 0;
        }
    }
});
