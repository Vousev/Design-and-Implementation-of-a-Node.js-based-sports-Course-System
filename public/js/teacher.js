// 配置moment.js中文
moment.locale('zh-cn');

// 配置axios
axios.defaults.baseURL = '/api';
axios.defaults.timeout = 10000;

// 请求拦截器
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('teacher_token');
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
        if (error.response) {
            const { status, data } = error.response;
            
            if (status === 401) {
                // 未授权，清除token并跳转到登录
                localStorage.removeItem('teacher_token');
                localStorage.removeItem('teacher_user');
                app.isLoggedIn = false;
                app.loginDialogVisible = true;
                app.$message.error(data.message || '登录已过期，请重新登录');
            } else if (status === 403) {
                app.$message.error(data.message || '权限不足');
            } else if (status >= 500) {
                app.$message.error('服务器错误，请稍后重试');
            } else {
                app.$message.error(data.message || '请求失败');
            }
        } else {
            app.$message.error('网络错误，请检查网络连接');
        }
        return Promise.reject(error);
    }
);

// Vue应用实例
const app = new Vue({
    el: '#app',
    data() {
        return {
            // 登录相关
            isLoggedIn: false,
            loginDialogVisible: true,
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

            // 用户信息
            currentUser: {},

            // 菜单相关
            activeMenu: 'dashboard',
            pendingApplicationsCount: 0,

            // 工作台数据
            dashboardStats: {
                totalCourses: 0,
                totalStudents: 0,
                pendingGrades: 0,
                pendingApplications: 0
            },
            recentActivities: [],

            // 课程管理
            courses: [],
            coursesLoading: false,
            courseFilter: {
                status: '',
                semester: ''
            },
            coursePagination: {
                page: 1,
                limit: 10,
                total: 0
            },
            
            // 学生名单页面的课程列表副本（避免污染主课程列表）
            coursesForStudentFilter: [],

            // 课程表单
            courseForm: {
                course_code: '',
                name: '',
                category_id: '',
                venue_id: '',
                credits: 2,
                capacity: 30,
                day_of_week: '',
                start_time: '',
                end_time: '',
                weeks: '',
                semester: '',
                academic_year: '',
                requirements: '',
                description: '',
                syllabus: '',
                assessment_method: ''
            },
            courseRules: {
                course_code: [
                    { required: true, message: '请输入课程代码', trigger: 'blur' }
                ],
                name: [
                    { required: true, message: '请输入课程名称', trigger: 'blur' }
                ],
                category_id: [
                    { required: true, message: '请选择体育类别', trigger: 'change' }
                ],
                venue_id: [
                    { required: true, message: '请选择上课场地', trigger: 'change' }
                ],
                capacity: [
                    { required: true, message: '请输入课程容量', trigger: 'blur' }
                ],
                day_of_week: [
                    { required: true, message: '请选择上课星期', trigger: 'change' }
                ],
                start_time: [
                    { required: true, message: '请选择开始时间', trigger: 'change' }
                ],
                end_time: [
                    { required: true, message: '请选择结束时间', trigger: 'change' }
                ]
            },
            saveLoading: false,
            editingCourseId: null,

            // 基础数据
            categories: [],
            venues: [],

            // 选课名单管理
            studentsFilter: {
                courseId: '',
                status: 'selected'
            },
            selectedCourse: null,
            courseStudents: [],
            studentsLoading: false,
            selectedStudents: [],

            // 导出功能
            showExportDialog: false,
            exportForm: {
                courseId: '',
                format: 'excel',
                fields: ['student_id', 'real_name', 'gender', 'grade', 'major', 'class_name']
            },
            exportLoading: false,

            // 成绩管理
            gradeFilter: {
                courseId: '',
                semester: '',
                academic_year: ''
            },
            selectedGradeCourse: null,
            courseGrades: [],
            gradesLoading: false,
            batchGradeMode: false,
            batchGradeForm: {
                attendance_score: null,
                performance_score: null,
                midterm_score: null,
                final_score: null
            },
            batchSaving: false,
            showSubmitGrades: false,
            submitGradeForm: {
                semester: '',
                academic_year: ''
            },
            submitLoading: false,

            // 成绩统计
            statisticsFilter: {
                courseId: '',
                semester: '2025秋',  // 默认当前学期
                academic_year: '2025-2026'  // 默认当前学年
            },
            gradeStatistics: null,
            statisticsLoading: false,

            // 特殊申请管理
            applicationFilter: {
                type: '',
                status: '',
                studentName: ''
            },
            applications: [],
            applicationsLoading: false,
            selectedApplications: [],
            applicationPagination: {
                page: 1,
                limit: 10,
                total: 0
            },
            currentApplication: null,
            showProcessDialog: false,
            processAction: '',
            processForm: {
                comment: ''
            },
            processLoading: false,
            showDetailDialog: false,

            // 个人信息和密码修改
            showProfileDialogVisible: false,
            profileForm: {
                name: '',
                title: '',
                department: '',
                phone: '',
                email: '',
                introduction: ''
            },
            profileRules: {
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' }
                ],
                email: [
                    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
                ]
            },
            profileLoading: false,
            showPasswordDialogVisible: false,
            passwordForm: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            passwordRules: {
                currentPassword: [
                    { required: true, message: '请输入当前密码', trigger: 'blur' }
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
            },
            passwordLoading: false,

            // 资质管理
            qualificationList: [],
            qualificationLoading: false,
            qualificationStats: {
                total: 0,
                active: 0,
                expired: 0,
                pending: 0
            },
            qualificationDialog: {
                visible: false,
                mode: 'create', // create, view
                title: '申请新资质',
                loading: false
            },
            qualificationForm: {
                sport_category: '',
                qualification_level: '其他',
                certificate_name: '',
                certificate_number: '',
                issue_date: '',
                expire_date: '',
                issuing_authority: '',
                description: '',
                attachment_url: ''
            },
            qualificationRules: {
                sport_category: [
                    { required: true, message: '请选择体育类别', trigger: 'change' }
                ],
                certificate_name: [
                    { required: true, message: '请输入证书名称', trigger: 'blur' }
                ]
            }
        };
    },

    computed: {
        // 计算已完成成绩录入的数量
        completedGradesCount() {
            return this.courseGrades.filter(student => 
                student.total_score !== null && student.total_score !== undefined
            ).length;
        },

        // 处理申请对话框标题
        processDialogTitle() {
            return this.processAction === 'approve' ? '批准申请' : '拒绝申请';
        }
    },

    mounted() {
        this.checkLoginStatus();
        this.loadBasicData();
    },

    methods: {
        // 检查登录状态
        checkLoginStatus() {
            const token = localStorage.getItem('teacher_token');
            const user = localStorage.getItem('teacher_user');
            
            if (token && user) {
                this.isLoggedIn = true;
                this.loginDialogVisible = false;
                this.currentUser = JSON.parse(user);
                this.loadDashboardData();
                // 预加载课程列表，供其他页面使用
                this.loadCourses();
            } else {
                this.isLoggedIn = false;
                this.loginDialogVisible = true;
            }
        },

        // 处理登录
        async handleLogin() {
            try {
                await this.$refs.loginForm.validate();
                this.loginLoading = true;

                const response = await axios.post('/teacher/auth/login', this.loginForm);
                
                if (response.data.success) {
                    const { token, user } = response.data.data;
                    
                    // 保存登录信息
                    localStorage.setItem('teacher_token', token);
                    localStorage.setItem('teacher_user', JSON.stringify(user));
                    
                    this.isLoggedIn = true;
                    this.loginDialogVisible = false;
                    this.currentUser = user;
                    
                    this.$message.success('登录成功');
                    this.loadDashboardData();
                    // 预加载课程列表
                    this.loadCourses();
                }
            } catch (error) {
                console.error('登录失败:', error);
            } finally {
                this.loginLoading = false;
            }
        },

        // 处理用户菜单命令
        handleUserCommand(command) {
            switch (command) {
                case 'profile':
                    this.showProfileDialog();
                    break;
                case 'password':
                    this.showPasswordDialog();
                    break;
                case 'logout':
                    this.handleLogout();
                    break;
            }
        },

        // 退出登录
        handleLogout() {
            this.$confirm('确定要退出登录吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                localStorage.removeItem('teacher_token');
                localStorage.removeItem('teacher_user');
                this.isLoggedIn = false;
                this.currentUser = {};
                this.$message.success('已退出登录');
                
                // 跳转到首页登录界面
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            });
        },

        // 菜单选择
        async handleMenuSelect(key) {
            console.log('切换菜单到:', key);
            this.activeMenu = key;
            
            // 根据菜单加载对应数据
            switch (key) {
                case 'dashboard':
                    this.loadDashboardData();
                    break;
                case 'course-list':
                    // 强制重新加载课程列表
                    console.log('切换到课程列表，重新加载数据');
                    // 清空选课名单相关状态，避免表格复用问题
                    this.selectedStudents = [];
                    await this.loadCourses();
                    break;
                case 'course-create':
                    this.resetCourseForm();
                    break;
                case 'students':
                    // 确保课程列表已加载
                    if (this.courses.length === 0) {
                        await this.loadCourses();
                    }
                    this.loadCourseStudents();
                    break;
                case 'grade-input':
                    // 确保课程列表已加载
                    if (this.courses.length === 0) {
                        await this.loadCourses();
                    }
                    this.loadCourseGrades();
                    break;
                case 'grade-statistics':
                    // 确保课程列表已加载
                    if (this.courses.length === 0) {
                        await this.loadCourses();
                    }
                    this.loadGradeStatistics();
                    break;
                case 'applications':
                    this.loadApplications('pending');
                    break;
                case 'qualifications':
                    this.loadQualifications();
                    break;
            }
        },

        // 加载基础数据
        async loadBasicData() {
            try {
                // 加载体育类别
                const categoriesResponse = await axios.get('/courses/categories');
                if (categoriesResponse.data.success) {
                    this.categories = categoriesResponse.data.data;
                }

                // 加载场地信息
                const venuesResponse = await axios.get('/courses/meta/venues');
                if (venuesResponse.data.success) {
                    this.venues = venuesResponse.data.data;
                }
            } catch (error) {
                console.error('加载基础数据失败:', error);
            }
        },

        // 加载工作台数据
        async loadDashboardData() {
            try {
                console.log('加载教师工作台数据...');
                
                const response = await axios.get('/teacher/courses/dashboard');
                
                if (response.data.success) {
                    const { stats, recentActivities } = response.data.data;
                    
                    // 更新统计数据
                    this.dashboardStats = {
                        totalCourses: stats.totalCourses,
                        totalStudents: stats.totalStudents,
                        pendingGrades: 0, // 暂时保留，后续可以添加成绩统计
                        pendingApplications: stats.pendingApplications
                    };
                    
                    // 更新最近活动
                    this.recentActivities = recentActivities.length > 0 ? recentActivities : [
                        {
                            id: 'default',
                            content: '暂无最近活动',
                            time: moment().format('YYYY-MM-DD HH:mm'),
                            type: 'info'
                        }
                    ];
                    
                    console.log('工作台数据加载成功:', { stats: this.dashboardStats, activities: this.recentActivities });
                } else {
                    throw new Error(response.data.message || '获取数据失败');
                }
            } catch (error) {
                console.error('加载工作台数据失败:', error);
                this.$message.error('加载工作台数据失败: ' + (error.response?.data?.message || error.message));
                
                // 设置默认数据
                this.dashboardStats = {
                    totalCourses: 0,
                    totalStudents: 0,
                    pendingGrades: 0,
                    pendingApplications: 0
                };
                
                this.recentActivities = [
                    {
                        id: 'error',
                        content: '无法加载数据，请检查网络连接',
                        time: moment().format('YYYY-MM-DD HH:mm'),
                        type: 'danger'
                    }
                ];
            }
        },

        // 加载课程列表
        async loadCourses() {
            try {
                this.coursesLoading = true;
                
                const params = {
                    page: this.coursePagination.page,
                    limit: this.coursePagination.limit,
                    ...this.courseFilter
                };

                console.log('=== 开始加载课程列表 ===');
                console.log('请求参数:', params);

                const response = await axios.get('/teacher/courses', { params });
                
                console.log('课程列表响应:', response.data);
                
                if (response.data.success) {
                    // 使用解构确保创建新数组，避免引用问题
                    const coursesData = response.data.data.courses || [];
                    console.log('课程数据:', coursesData);
                    console.log('课程数量:', coursesData.length);
                    if (coursesData.length > 0) {
                        console.log('第一个课程:', coursesData[0]);
                    }
                    
                    // 强制更新courses数组（使用深拷贝）
                    this.$set(this, 'courses', JSON.parse(JSON.stringify(coursesData)));
                    // 同时更新选课名单页面使用的副本
                    this.$set(this, 'coursesForStudentFilter', JSON.parse(JSON.stringify(coursesData)));
                    
                    this.coursePagination = {
                        ...this.coursePagination,
                        ...response.data.data.pagination
                    };
                    
                    console.log('courses数组更新后:', this.courses);
                }
            } catch (error) {
                console.error('加载课程列表失败:', error);
                this.$message.error('加载课程列表失败');
            } finally {
                this.coursesLoading = false;
            }
        },

        // 重置课程筛选
        resetCourseFilter() {
            this.courseFilter = {
                status: '',
                semester: ''
            };
            this.coursePagination.page = 1;
            this.loadCourses();
        },

        // 分页处理
        handleSizeChange(val) {
            this.coursePagination.limit = val;
            this.coursePagination.page = 1;
            this.loadCourses();
        },

        handleCurrentChange(val) {
            this.coursePagination.page = val;
            this.loadCourses();
        },

        // 编辑课程
        editCourse(course) {
            this.editingCourseId = course.id;
            this.courseForm = { ...course };
            this.activeMenu = 'course-edit';
        },

        // 查看学生名单
        async viewStudents(course) {
            // 设置筛选条件
            this.studentsFilter.courseId = course.id;
            this.studentsFilter.status = 'selected';
            
            // 切换到学生名单页面
            this.activeMenu = 'students';
            
            // 确保课程列表已加载（用于下拉框显示）
            if (this.courses.length === 0) {
                await this.loadCourses();
            }
            
            // 加载学生名单
            await this.loadCourseStudents();
        },

        // 发布课程
        async publishCourse(course) {
            try {
                await this.$confirm(`确定要发布课程"${course.name}"吗？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                const response = await axios.post(`/teacher/courses/${course.id}/publish`);
                
                if (response.data.success) {
                    this.$message.success('课程发布成功');
                    this.loadCourses();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('发布课程失败:', error);
                }
            }
        },

        // 关闭课程
        async closeCourse(course) {
            try {
                await this.$confirm(
                    `确定要关闭课程"${course.name}"吗？关闭后该课程将不再接受新的选课。`, 
                    '关闭课程', 
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                );

                const response = await axios.post(`/teacher/courses/${course.id}/close`);
                
                if (response.data.success) {
                    this.$message.success('课程已关闭');
                    this.loadCourses();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('关闭课程失败:', error);
                    this.$message.error('关闭课程失败');
                }
            }
        },

        // 重新开启课程
        async openCourse(course) {
            try {
                await this.$confirm(
                    `确定要重新开启课程"${course.name}"吗？开启后学生可以继续选课。`, 
                    '开启课程', 
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'success'
                    }
                );

                const response = await axios.post(`/teacher/courses/${course.id}/open`);
                
                if (response.data.success) {
                    this.$message.success('课程已重新开启');
                    this.loadCourses();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('开启课程失败:', error);
                    this.$message.error('开启课程失败');
                }
            }
        },

        // 删除课程
        async deleteCourse(course) {
            try {
                await this.$confirm(`确定要删除课程"${course.name}"吗？此操作不可恢复！`, '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'error'
                });

                const response = await axios.delete(`/teacher/courses/${course.id}`);
                
                if (response.data.success) {
                    this.$message.success('课程删除成功');
                    this.loadCourses();
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除课程失败:', error);
                }
            }
        },

        // 保存课程
        async saveCourse() {
            try {
                await this.$refs.courseForm.validate();
                this.saveLoading = true;

                let response;
                if (this.editingCourseId) {
                    // 更新课程
                    response = await axios.put(`/teacher/courses/${this.editingCourseId}`, this.courseForm);
                } else {
                    // 创建课程
                    response = await axios.post('/teacher/courses', this.courseForm);
                }

                if (response.data.success) {
                    this.$message.success(this.editingCourseId ? '课程更新成功' : '课程创建成功');
                    this.activeMenu = 'course-list';
                    this.loadCourses();
                    this.resetCourseForm();
                }
            } catch (error) {
                console.error('保存课程失败:', error);
            } finally {
                this.saveLoading = false;
            }
        },

        // 重置课程表单
        resetCourseForm() {
            this.courseForm = {
                course_code: '',
                name: '',
                category_id: '',
                venue_id: '',
                credits: 2,
                capacity: 30,
                day_of_week: '',
                start_time: '',
                end_time: '',
                weeks: '',
                semester: '',
                academic_year: '',
                requirements: '',
                description: '',
                syllabus: '',
                assessment_method: ''
            };
            this.editingCourseId = null;
            
            if (this.$refs.courseForm) {
                this.$refs.courseForm.clearValidate();
            }
        },

        // 工具方法
        getWeekdayName(dayOfWeek) {
            const weekdays = ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
            return weekdays[dayOfWeek] || '';
        },

        // 格式化时间（只显示时分）
        formatTime(time) {
            if (!time) return '';
            // 如果是 HH:MM:SS 格式，截取前5位
            if (typeof time === 'string' && time.length >= 5) {
                return time.substring(0, 5);
            }
            return time;
        },

        getStatusType(status) {
            const types = {
                'draft': 'info',
                'published': 'success',
                'closed': 'danger'
            };
            return types[status] || 'info';
        },

        getStatusText(status) {
            const texts = {
                'draft': '草稿',
                'published': '已发布',
                'closed': '已关闭'
            };
            return texts[status] || status;
        },

        // ===== 选课名单管理功能 =====

        // 加载选课学生名单
        async loadCourseStudents() {
            console.log('=== 开始加载学生名单 ===');
            console.log('当前courseId:', this.studentsFilter.courseId);
            console.log('当前status:', this.studentsFilter.status);
            
            if (!this.studentsFilter.courseId) {
                console.log('courseId为空，清空学生列表');
                this.courseStudents = [];
                this.selectedCourse = null;
                return;
            }

            try {
                this.studentsLoading = true;
                
                const params = {
                    status: this.studentsFilter.status || 'selected'
                };

                console.log('请求参数:', params);
                console.log('请求URL:', `/teacher/courses/${this.studentsFilter.courseId}/students`);

                const response = await axios.get(`/teacher/courses/${this.studentsFilter.courseId}/students`, { params });
                
                console.log('API响应:', response.data);
                
                if (response.data.success) {
                    this.courseStudents = response.data.data.students;
                    this.selectedCourse = response.data.data.course;
                    console.log('加载学生名单成功，学生数量:', this.courseStudents.length);
                    console.log('学生数据:', this.courseStudents);
                    
                    if (this.courseStudents.length === 0) {
                        this.$message.info('该课程暂无学生选课');
                    }
                } else {
                    this.$message.error(response.data.message || '加载失败');
                }
            } catch (error) {
                console.error('加载学生名单失败:', error);
                console.error('错误详情:', error.response?.data);
                this.$message.error(error.response?.data?.message || '加载学生名单失败');
            } finally {
                this.studentsLoading = false;
            }
        },

        // 重置学生筛选
        resetStudentsFilter() {
            this.studentsFilter = {
                courseId: '',
                status: 'selected'
            };
            this.courseStudents = [];
            this.selectedCourse = null;
            this.selectedStudents = [];
        },

        // 处理学生选择
        handleStudentSelection(selection) {
            this.selectedStudents = selection;
        },

        // 处理学生退课
        async handleStudentDrop(student) {
            try {
                await this.$confirm(`确定要让学生"${student.real_name}"退课吗？`, '确认退课', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                // 这里需要调用退课API
                this.$message.info('退课功能开发中...');
                
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('退课操作失败:', error);
                }
            }
        },

        // 确认学生选课（从候补转为正式）
        async handleStudentConfirm(student) {
            try {
                await this.$confirm(`确定要确认学生"${student.real_name}"的选课申请吗？`, '确认选课', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info'
                });

                // 这里需要调用确认选课API
                this.$message.info('确认选课功能开发中...');
                
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('确认选课失败:', error);
                }
            }
        },

        // 查看学生详情
        viewStudentDetail(student) {
            this.$alert(`
                <div style="text-align: left;">
                    <p><strong>学号：</strong>${student.student_id}</p>
                    <p><strong>姓名：</strong>${student.real_name}</p>
                    <p><strong>性别：</strong>${student.gender === 'male' ? '男' : '女'}</p>
                    <p><strong>年级：</strong>${student.grade}</p>
                    <p><strong>专业：</strong>${student.major}</p>
                    <p><strong>班级：</strong>${student.class_name}</p>
                    <p><strong>联系电话：</strong>${student.phone || '未填写'}</p>
                    <p><strong>邮箱：</strong>${student.email || '未填写'}</p>
                    <p><strong>选课时间：</strong>${this.formatDateTime(student.selection_time)}</p>
                    <p><strong>选课状态：</strong>${this.getSelectionStatusText(student.status)}</p>
                </div>
            `, `学生详情 - ${student.real_name}`, {
                confirmButtonText: '关闭',
                dangerouslyUseHTMLString: true
            });
        },

        // 批量退课
        async batchDropStudents() {
            if (this.selectedStudents.length === 0) {
                this.$message.warning('请先选择要退课的学生');
                return;
            }

            try {
                await this.$confirm(`确定要让选中的 ${this.selectedStudents.length} 名学生退课吗？`, '批量退课', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                this.$message.info('批量退课功能开发中...');
                
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('批量退课失败:', error);
                }
            }
        },

        // 批量导出选中学生
        async batchExportStudents() {
            if (this.selectedStudents.length === 0) {
                this.$message.warning('请先选择要导出的学生');
                return;
            }

            this.$message.info('批量导出功能开发中...');
        },

        // 确认导出
        async confirmExport() {
            if (!this.exportForm.courseId) {
                this.$message.warning('请选择要导出的课程');
                return;
            }

            if (this.exportForm.fields.length === 0) {
                this.$message.warning('请选择要包含的信息字段');
                return;
            }

            try {
                this.exportLoading = true;
                this.$message.info('导出功能开发中...');
                
                // TODO: 实现导出功能
                
            } catch (error) {
                console.error('导出失败:', error);
                this.$message.error('导出失败');
            } finally {
                this.exportLoading = false;
                this.showExportDialog = false;
            }
        },

        // 获取选课状态类型
        getSelectionStatusType(status) {
            const types = {
                'selected': 'success',
                'waiting': 'warning', 
                'dropped': 'danger'
            };
            return types[status] || 'info';
        },

        // 获取选课状态文本
        getSelectionStatusText(status) {
            const texts = {
                'selected': '已选课',
                'waiting': '候补',
                'dropped': '已退课'
            };
            return texts[status] || status;
        },

        // 格式化日期时间
        formatDateTime(dateTime) {
            if (!dateTime) return '';
            return moment(dateTime).format('YYYY-MM-DD HH:mm');
        },

        // ===== 成绩管理功能 =====

        // 加载课程成绩
        async loadCourseGrades() {
            if (!this.gradeFilter.courseId) {
                this.courseGrades = [];
                this.selectedGradeCourse = null;
                return;
            }

            try {
                this.gradesLoading = true;
                
                const params = {};
                if (this.gradeFilter.semester) params.semester = this.gradeFilter.semester;
                if (this.gradeFilter.academic_year) params.academic_year = this.gradeFilter.academic_year;

                const response = await axios.get(`/teacher/grades/course/${this.gradeFilter.courseId}`, { params });
                
                if (response.data.success) {
                    this.courseGrades = response.data.data.students.map(student => {
                        // 添加响应式属性
                        student._saving = false;
                        return student;
                    });
                    this.selectedGradeCourse = response.data.data.course;
                    console.log('加载成绩数据成功:', this.courseGrades);
                }
            } catch (error) {
                console.error('加载成绩数据失败:', error);
                this.$message.error('加载成绩数据失败');
            } finally {
                this.gradesLoading = false;
            }
        },

        // 重置成绩筛选
        resetGradeFilter() {
            this.gradeFilter = {
                courseId: '',
                semester: '',
                academic_year: ''
            };
            this.courseGrades = [];
            this.selectedGradeCourse = null;
        },

        // 计算总成绩
        calculateTotalScore(student) {
            const { attendance_score, performance_score, midterm_score, final_score } = student;
            
            // 权重设置
            const attendanceWeight = 0.2;  // 出勤20%
            const performanceWeight = 0.3; // 平时表现30%
            const midtermWeight = 0.2;     // 期中20%
            const finalWeight = 0.3;       // 期末30%

            let total_score = 0;
            let scoreCount = 0;

            if (attendance_score !== undefined && attendance_score !== null) {
                total_score += attendance_score * attendanceWeight;
                scoreCount++;
            }
            if (performance_score !== undefined && performance_score !== null) {
                total_score += performance_score * performanceWeight;
                scoreCount++;
            }
            if (midterm_score !== undefined && midterm_score !== null) {
                total_score += midterm_score * midtermWeight;
                scoreCount++;
            }
            if (final_score !== undefined && final_score !== null) {
                total_score += final_score * finalWeight;
                scoreCount++;
            }

            if (scoreCount === 4) {
                student.total_score = Math.round(total_score * 10) / 10; // 保留一位小数
                
                // 计算等级
                if (student.total_score >= 90) student.grade_level = 'A';
                else if (student.total_score >= 80) student.grade_level = 'B';
                else if (student.total_score >= 70) student.grade_level = 'C';
                else if (student.total_score >= 60) student.grade_level = 'D';
                else student.grade_level = 'F';
            } else {
                student.total_score = null;
                student.grade_level = null;
            }
        },

        // 保存单个学生成绩
        async saveStudentGrade(student) {
            if (!this.selectedGradeCourse) {
                this.$message.warning('请先选择课程');
                return;
            }

            if (!this.gradeFilter.semester || !this.gradeFilter.academic_year) {
                this.$message.warning('请填写学期和学年信息');
                return;
            }

            try {
                student._saving = true;

                const gradeData = {
                    attendance_score: student.attendance_score,
                    performance_score: student.performance_score,
                    midterm_score: student.midterm_score,
                    final_score: student.final_score,
                    remarks: student.remarks,
                    semester: this.gradeFilter.semester,
                    academic_year: this.gradeFilter.academic_year
                };

                const response = await axios.put(
                    `/teacher/grades/course/${this.gradeFilter.courseId}/student/${student.student_id}`, 
                    gradeData
                );

                if (response.data.success) {
                    this.$message.success('成绩保存成功');
                    // 更新本地数据
                    student.total_score = response.data.data.total_score;
                    student.grade_level = response.data.data.grade_level;
                }
            } catch (error) {
                console.error('保存成绩失败:', error);
                this.$message.error('保存成绩失败');
            } finally {
                student._saving = false;
            }
        },

        // 应用批量成绩
        applyBatchGrade() {
            const { attendance_score, performance_score, midterm_score, final_score } = this.batchGradeForm;
            
            if (attendance_score === null && performance_score === null && midterm_score === null && final_score === null) {
                this.$message.warning('请至少填写一项批量成绩');
                return;
            }

            this.courseGrades.forEach(student => {
                if (attendance_score !== null) student.attendance_score = attendance_score;
                if (performance_score !== null) student.performance_score = performance_score;
                if (midterm_score !== null) student.midterm_score = midterm_score;
                if (final_score !== null) student.final_score = final_score;
                
                // 重新计算总分
                this.calculateTotalScore(student);
            });

            this.$message.success('批量成绩应用成功');
        },

        // 批量保存成绩
        async saveBatchGrades() {
            if (!this.selectedGradeCourse) {
                this.$message.warning('请先选择课程');
                return;
            }

            if (!this.gradeFilter.semester || !this.gradeFilter.academic_year) {
                this.$message.warning('请填写学期和学年信息');
                return;
            }

            try {
                this.batchSaving = true;

                const grades = this.courseGrades.map(student => ({
                    student_id: student.student_id,
                    attendance_score: student.attendance_score,
                    performance_score: student.performance_score,
                    midterm_score: student.midterm_score,
                    final_score: student.final_score,
                    remarks: student.remarks
                }));

                const response = await axios.post(`/teacher/grades/course/${this.gradeFilter.courseId}/batch`, {
                    grades,
                    semester: this.gradeFilter.semester,
                    academic_year: this.gradeFilter.academic_year
                });

                if (response.data.success) {
                    this.$message.success('批量保存成功');
                    this.loadCourseGrades(); // 重新加载数据
                }
            } catch (error) {
                console.error('批量保存失败:', error);
                this.$message.error('批量保存失败');
            } finally {
                this.batchSaving = false;
            }
        },

        // 确认提交成绩
        async confirmSubmitGrades() {
            if (!this.submitGradeForm.semester || !this.submitGradeForm.academic_year) {
                this.$message.warning('请填写学期和学年信息');
                return;
            }

            try {
                this.submitLoading = true;

                const response = await axios.post(`/teacher/grades/course/${this.gradeFilter.courseId}/submit`, {
                    semester: this.submitGradeForm.semester,
                    academic_year: this.submitGradeForm.academic_year
                });

                if (response.data.success) {
                    this.$message.success('成绩提交成功');
                    this.showSubmitGrades = false;
                    this.loadCourseGrades(); // 重新加载数据
                }
            } catch (error) {
                console.error('提交成绩失败:', error);
                this.$message.error('提交成绩失败');
            } finally {
                this.submitLoading = false;
            }
        },

        // 获取总分颜色类型
        getTotalScoreType(score) {
            if (score === null || score === undefined) return '';
            if (score >= 90) return 'success';
            if (score >= 80) return 'primary';
            if (score >= 70) return 'warning';
            if (score >= 60) return 'info';
            return 'danger';
        },

        // 获取等级颜色类型
        getGradeLevelType(level) {
            const types = {
                'A': 'success',
                'B': 'primary',
                'C': 'warning',
                'D': 'info',
                'F': 'danger'
            };
            return types[level] || '';
        },

        // 获取等级颜色
        getGradeLevelColor(level) {
            const colors = {
                'A': '#67c23a',
                'B': '#409eff',
                'C': '#e6a23c',
                'D': '#909399',
                'F': '#f56c6c'
            };
            return colors[level] || '#909399';
        },

        // ===== 成绩统计功能 =====

        // 加载成绩统计
        async loadGradeStatistics() {
            if (!this.statisticsFilter.courseId) {
                this.gradeStatistics = null;
                return;
            }

            try {
                this.statisticsLoading = true;
                
                const params = {};
                if (this.statisticsFilter.semester) params.semester = this.statisticsFilter.semester;
                if (this.statisticsFilter.academic_year) params.academic_year = this.statisticsFilter.academic_year;

                const response = await axios.get(`/teacher/grades/course/${this.statisticsFilter.courseId}/statistics`, { params });
                
                if (response.data.success) {
                    this.gradeStatistics = response.data.data;
                    console.log('加载统计数据成功:', this.gradeStatistics);
                    
                    // 渲染图表
                    this.$nextTick(() => {
                        this.renderCharts();
                    });
                }
            } catch (error) {
                console.error('加载统计数据失败:', error);
                this.$message.error('加载统计数据失败');
            } finally {
                this.statisticsLoading = false;
            }
        },

        // 渲染图表
        renderCharts() {
            if (!this.gradeStatistics) return;
            
            // 渲染等级分布图
            this.renderGradeDistributionChart();
            
            // 渲染分数分布图
            this.renderScoreDistributionChart();
        },

        // 渲染等级分布饼图
        renderGradeDistributionChart() {
            const chartDom = document.getElementById('gradeDistributionChart');
            if (!chartDom) return;
            
            const gradeChart = echarts.init(chartDom);
            
            const data = this.gradeStatistics.grade_distribution || [];
            const chartData = data.map(item => ({
                value: item.count || 0,
                name: `${item.grade_level}级 (${item.count || 0}人)`
            }));
            
            const option = {
                title: {
                    text: '等级分布',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)'
                },
                legend: {
                    bottom: 10,
                    left: 'center',
                    data: chartData.map(item => item.name)
                },
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: chartData,
                    color: ['#67C23A', '#409EFF', '#E6A23C', '#909399', '#F56C6C']
                }]
            };
            
            gradeChart.setOption(option);
            
            // 自适应窗口大小
            window.addEventListener('resize', () => {
                gradeChart.resize();
            });
        },

        // 渲染分数分布柱状图
        renderScoreDistributionChart() {
            const chartDom = document.getElementById('scoreDistributionChart');
            if (!chartDom) return;
            
            const scoreChart = echarts.init(chartDom);
            
            const distribution = this.gradeStatistics.distribution || {};
            const xAxisData = ['90-100分', '80-89分', '70-79分', '60-69分', '60分以下'];
            const seriesData = [
                distribution.score_90_100 || 0,
                distribution.score_80_89 || 0,
                distribution.score_70_79 || 0,
                distribution.score_60_69 || 0,
                distribution.score_below_60 || 0
            ];
            
            const option = {
                title: {
                    text: '分数段分布',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: '{b}: {c}人'
                },
                xAxis: {
                    type: 'category',
                    data: xAxisData,
                    axisTick: {
                        alignWithLabel: true
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '人数',
                    minInterval: 1
                },
                series: [{
                    data: seriesData,
                    type: 'bar',
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    },
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {offset: 0, color: '#83bff6'},
                            {offset: 0.5, color: '#188df0'},
                            {offset: 1, color: '#188df0'}
                        ])
                    },
                    label: {
                        show: true,
                        position: 'top',
                        formatter: '{c}'
                    }
                }]
            };
            
            scoreChart.setOption(option);
            
            // 自适应窗口大小
            window.addEventListener('resize', () => {
                scoreChart.resize();
            });
        },

        // 导出统计报告
        exportStatistics() {
            if (!this.gradeStatistics) {
                this.$message.warning('请先查询成绩统计数据');
                return;
            }
            
            const { course, semester, academic_year, total_students, average_score, pass_rate, excellent_rate } = this.gradeStatistics;
            
            // 生成报告内容
            let reportContent = `成绩统计报告\n`;
            reportContent += `================================\n\n`;
            reportContent += `课程信息：${course.name}\n`;
            reportContent += `学期：${semester || '全部'}\n`;
            reportContent += `学年：${academic_year || '全部'}\n\n`;
            
            reportContent += `基本统计信息\n`;
            reportContent += `--------------------------------\n`;
            reportContent += `总学生数：${total_students}\n`;
            reportContent += `平均分：${average_score.toFixed(2)}\n`;
            reportContent += `及格率：${(pass_rate * 100).toFixed(2)}%\n`;
            reportContent += `优秀率：${(excellent_rate * 100).toFixed(2)}%\n\n`;
            
            reportContent += `等级分布\n`;
            reportContent += `--------------------------------\n`;
            if (this.gradeStatistics.grade_distribution) {
                this.gradeStatistics.grade_distribution.forEach(item => {
                    const percentage = total_students > 0 ? (item.count / total_students * 100).toFixed(2) : '0.00';
                    reportContent += `${item.grade_level}级：${item.count}人 (${percentage}%)\n`;
                });
            }
            
            reportContent += `\n分数段分布\n`;
            reportContent += `--------------------------------\n`;
            if (this.gradeStatistics.distribution) {
                const dist = this.gradeStatistics.distribution;
                reportContent += `90-100分：${dist.score_90_100 || 0}人\n`;
                reportContent += `80-89分：${dist.score_80_89 || 0}人\n`;
                reportContent += `70-79分：${dist.score_70_79 || 0}人\n`;
                reportContent += `60-69分：${dist.score_60_69 || 0}人\n`;
                reportContent += `60分以下：${dist.score_below_60 || 0}人\n`;
            }
            
            reportContent += `\n生成时间：${new Date().toLocaleString('zh-CN')}\n`;
            
            // 创建下载链接
            const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `成绩统计报告_${course.name}_${new Date().getTime()}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            this.$message.success('统计报告已导出');
        },

        // ===== 特殊申请管理功能 =====

        // 加载申请列表
        async loadApplications(type = 'all') {
            try {
                this.applicationsLoading = true;
                
                const params = {
                    page: this.applicationPagination.page,
                    limit: this.applicationPagination.limit,
                    ...this.applicationFilter
                };

                const url = type === 'pending' ? '/teacher/applications/pending' : '/teacher/applications/all';
                const response = await axios.get(url, { params });
                
                if (response.data.success) {
                    this.applications = response.data.data.applications;
                    this.applicationPagination = {
                        ...this.applicationPagination,
                        ...response.data.data.pagination
                    };
                    
                    // 更新待处理申请数量
                    if (type === 'pending') {
                        this.pendingApplicationsCount = response.data.data.pagination.total;
                    }
                    
                    console.log('加载申请列表成功:', this.applications);
                }
            } catch (error) {
                console.error('加载申请列表失败:', error);
                this.$message.error('加载申请列表失败');
            } finally {
                this.applicationsLoading = false;
            }
        },

        // 重置申请筛选
        resetApplicationFilter() {
            this.applicationFilter = {
                type: '',
                status: '',
                studentName: ''
            };
            this.applicationPagination.page = 1;
            this.loadApplications();
        },

        // 处理申请选择
        handleApplicationSelection(selection) {
            this.selectedApplications = selection;
        },

        // 分页处理
        handleApplicationSizeChange(val) {
            this.applicationPagination.limit = val;
            this.applicationPagination.page = 1;
            this.loadApplications();
        },

        handleApplicationCurrentChange(val) {
            this.applicationPagination.page = val;
            this.loadApplications();
        },

        // 处理单个申请
        processApplication(application, action) {
            this.currentApplication = application;
            this.processAction = action;
            this.processForm.comment = '';
            this.showProcessDialog = true;
        },

        // 确认处理申请
        async confirmProcessApplication() {
            if (!this.processForm.comment.trim()) {
                this.$message.warning('请填写处理意见');
                return;
            }

            try {
                this.processLoading = true;

                const response = await axios.post(`/teacher/applications/${this.currentApplication.id}/process`, {
                    action: this.processAction,
                    comment: this.processForm.comment
                });

                if (response.data.success) {
                    this.$message.success(
                        this.processAction === 'approve' ? '申请已批准' : '申请已拒绝'
                    );
                    this.showProcessDialog = false;
                    this.loadApplications(); // 重新加载列表
                }
            } catch (error) {
                console.error('处理申请失败:', error);
                this.$message.error('处理申请失败');
            } finally {
                this.processLoading = false;
            }
        },

        // 查看申请详情
        viewApplicationDetail(application) {
            this.currentApplication = application;
            this.showDetailDialog = true;
        },

        // 批量处理申请
        async batchProcessApplications(action) {
            if (this.selectedApplications.length === 0) {
                this.$message.warning('请先选择要处理的申请');
                return;
            }

            const pendingApplications = this.selectedApplications.filter(app => app.status === 'pending');
            if (pendingApplications.length === 0) {
                this.$message.warning('所选申请中没有待处理的申请');
                return;
            }

            try {
                await this.$confirm(
                    `确定要${action === 'approve' ? '批准' : '拒绝'}选中的 ${pendingApplications.length} 个申请吗？`,
                    '批量处理确认',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                );

                const comment = await this.$prompt(
                    '请输入处理意见：',
                    action === 'approve' ? '批量批准' : '批量拒绝',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputType: 'textarea',
                        inputPlaceholder: action === 'approve' ? '请输入批准意见...' : '请输入拒绝原因...'
                    }
                );

                if (comment.action === 'confirm') {
                    const applicationIds = pendingApplications.map(app => app.id);
                    
                    const response = await axios.post('/teacher/applications/batch-process', {
                        applicationIds,
                        action,
                        comment: comment.value
                    });

                    if (response.data.success) {
                        this.$message.success(
                            action === 'approve' ? '批量批准成功' : '批量拒绝成功'
                        );
                        this.loadApplications(); // 重新加载列表
                        this.selectedApplications = []; // 清空选择
                    }
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('批量处理失败:', error);
                    this.$message.error('批量处理失败');
                }
            }
        },

        // 获取申请类型颜色
        getApplicationTypeColor(type) {
            const colors = {
                'drop': 'warning',
                'transfer': 'primary',
                'makeup': 'success',
                'other': 'info'
            };
            return colors[type] || 'info';
        },

        // 获取申请类型文本
        getApplicationTypeText(type) {
            const texts = {
                'drop': '退课申请',
                'transfer': '换课申请',
                'makeup': '补选申请',
                'other': '其他申请'
            };
            return texts[type] || type;
        },

        // 获取申请状态颜色
        getApplicationStatusColor(status) {
            const colors = {
                'pending': 'warning',
                'approved': 'success',
                'rejected': 'danger'
            };
            return colors[status] || 'info';
        },

        // 获取申请状态文本
        getApplicationStatusText(status) {
            const texts = {
                'pending': '待处理',
                'approved': '已批准',
                'rejected': '已拒绝'
            };
            return texts[status] || status;
        },

        // ===== 通用功能 =====

        // ===== 个人信息和密码修改功能 =====

        // 显示个人信息对话框
        async showProfileDialog() {
            try {
                // 获取教师信息
                const response = await axios.get('/teacher/auth/profile');
                if (response.data.success) {
                    this.profileForm = { ...response.data.data };
                }
            } catch (error) {
                console.error('获取个人信息失败:', error);
            }
            this.showProfileDialogVisible = true;
        },

        // 保存个人信息
        async saveProfile() {
            try {
                await this.$refs.profileForm.validate();
                this.profileLoading = true;

                const response = await axios.put('/teacher/auth/profile', this.profileForm);
                
                if (response.data.success) {
                    this.$message.success('个人信息更新成功');
                    this.showProfileDialogVisible = false;
                    
                    // 更新当前用户信息
                    this.currentUser = { ...this.currentUser, ...response.data.data };
                    localStorage.setItem('teacher_user', JSON.stringify(this.currentUser));
                }
            } catch (error) {
                console.error('更新个人信息失败:', error);
                this.$message.error('更新个人信息失败');
            } finally {
                this.profileLoading = false;
            }
        },

        // 显示修改密码对话框
        showPasswordDialog() {
            this.passwordForm = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            this.showPasswordDialogVisible = true;
        },

        // 修改密码
        async changePassword() {
            try {
                await this.$refs.passwordForm.validate();
                this.passwordLoading = true;

                const response = await axios.put('/teacher/auth/password', {
                    currentPassword: this.passwordForm.currentPassword,
                    newPassword: this.passwordForm.newPassword
                });
                
                if (response.data.success) {
                    this.$message.success('密码修改成功，请重新登录');
                    this.showPasswordDialogVisible = false;
                    
                    // 清除登录信息，跳转到登录页
                    setTimeout(() => {
                        this.handleLogout();
                    }, 1500);
                }
            } catch (error) {
                console.error('修改密码失败:', error);
                this.$message.error('修改密码失败');
            } finally {
                this.passwordLoading = false;
            }
        },

        // ==================== 资质管理方法 ====================
        
        // 加载资质列表
        async loadQualifications() {
            this.qualificationLoading = true;
            try {
                const response = await axios.get('/teacher/qualifications/my-qualifications');
                if (response.data.success) {
                    this.qualificationList = response.data.data;
                    this.updateQualificationStats();
                }
            } catch (error) {
                console.error('加载资质列表失败:', error);
                this.$message.error('加载资质列表失败');
            } finally {
                this.qualificationLoading = false;
            }
        },

        // 更新资质统计
        updateQualificationStats() {
            this.qualificationStats = {
                total: this.qualificationList.length,
                active: this.qualificationList.filter(q => q.status === 'active').length,
                expired: this.qualificationList.filter(q => q.status === 'expired').length,
                pending: this.qualificationList.filter(q => q.status === 'pending_verification').length
            };
        },

        // 显示资质对话框
        showQualificationDialog(mode, qualification = null) {
            this.qualificationDialog.mode = mode;
            
            if (mode === 'create') {
                this.qualificationDialog.title = '申请新资质';
                this.resetQualificationForm();
            } else if (mode === 'view') {
                this.qualificationDialog.title = '资质详情';
                this.qualificationForm = { ...qualification };
            }
            
            this.qualificationDialog.visible = true;
        },

        // 重置资质表单
        resetQualificationForm() {
            this.qualificationForm = {
                sport_category: '',
                qualification_level: '其他',
                certificate_name: '',
                certificate_number: '',
                issue_date: '',
                expire_date: '',
                issuing_authority: '',
                description: '',
                attachment_url: ''
            };
            if (this.$refs.qualificationForm) {
                this.$refs.qualificationForm.clearValidate();
            }
        },

        // 查看资质
        viewQualification(qualification) {
            this.showQualificationDialog('view', qualification);
        },

        // 保存资质（申请新资质）
        async saveQualification() {
            try {
                await this.$refs.qualificationForm.validate();
                this.qualificationDialog.loading = true;

                const response = await axios.post('/teacher/qualifications/apply', this.qualificationForm);
                
                if (response.data.success) {
                    this.$message.success('资质申请已提交，等待管理员审核');
                    this.qualificationDialog.visible = false;
                    this.loadQualifications();
                }
            } catch (error) {
                console.error('提交资质申请失败:', error);
                if (error !== 'validate') {
                    this.$message.error('提交资质申请失败');
                }
            } finally {
                this.qualificationDialog.loading = false;
            }
        },

        // 下载证书附件
        downloadCertificate(qualification) {
            if (qualification.attachment_url) {
                window.open(qualification.attachment_url, '_blank');
            } else {
                this.$message.warning('暂无附件可下载');
            }
        },

        // 获取资质等级标签类型
        getLevelTagType(level) {
            const map = {
                '国家级': 'danger',
                '省级': 'warning',
                '市级': 'primary',
                '校级': 'success',
                '其他': 'info'
            };
            return map[level] || 'info';
        },

        // 获取资质状态类型
        getQualificationStatusType(qualification) {
            const statusMap = {
                'active': 'success',
                'expired': 'danger',
                'inactive': 'info',
                'pending_verification': 'warning',
                'rejected': 'danger'
            };
            return statusMap[qualification.status] || 'info';
        },

        // 获取资质状态文本
        getQualificationStatusText(qualification) {
            const statusTextMap = {
                'active': '有效',
                'expired': '已过期',
                'inactive': '未激活',
                'pending_verification': '待审核',
                'rejected': '已拒绝'
            };
            return statusTextMap[qualification.status] || qualification.status;
        },

        // 获取验证状态类型
        getVerifiedStatusType(status) {
            const map = {
                'pending': 'warning',
                'verified': 'success',
                'rejected': 'danger'
            };
            return map[status] || 'info';
        },

        // 获取验证状态文本
        getVerifiedStatusText(status) {
            const map = {
                'pending': '待验证',
                'verified': '已验证',
                'rejected': '已拒绝'
            };
            return map[status] || status;
        },

        // 格式化日期
        formatDate(date) {
            if (!date) return '';
            return moment(date).format('YYYY-MM-DD');
        }
    }
});
