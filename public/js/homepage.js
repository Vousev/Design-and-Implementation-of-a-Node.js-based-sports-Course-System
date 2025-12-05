// 配置axios默认设置
axios.defaults.baseURL = '/api';
axios.defaults.timeout = 10000;

// Vue应用实例
const app = new Vue({
    el: '#app',
    data() {
        return {
            // 身份选择
            selectedRole: 'student',
            
            // 认证模式
            authMode: 'login',
            
            // 登录表单
            loginForm: {
                username: '',
                password: ''
            },
            loginRules: {
                username: [
                    { required: true, message: '请输入用户名/学号/工号', trigger: 'blur' },
                    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
                ]
            },
            loginLoading: false,
            
            // 注册表单
            registerForm: {
                username: '',
                student_id: '',
                teacher_id: '',
                real_name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: ''
            },
            registerRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
                ],
                student_id: [
                    { required: true, message: '请输入学号', trigger: 'blur' },
                    { pattern: /^\d{10}$/, message: '学号格式不正确', trigger: 'blur' }
                ],
                teacher_id: [
                    { required: true, message: '请输入工号', trigger: 'blur' },
                    { pattern: /^T\d{3}$/, message: '工号格式不正确（如：T001）', trigger: 'blur' }
                ],
                real_name: [
                    { required: true, message: '请输入真实姓名', trigger: 'blur' },
                    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
                ],
                phone: [
                    { required: true, message: '请输入手机号', trigger: 'blur' },
                    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请确认密码', trigger: 'blur' },
                    { validator: this.validateConfirmPassword, trigger: 'blur' }
                ]
            },
            registerLoading: false,
            
            // 其他状态
            showAbout: false
        };
    },
    
    mounted() {
        // 页面加载完成后的初始化
        this.initApp();
    },
    
    methods: {
        // 初始化应用
        initApp() {
            // 检查是否有已保存的身份选择
            const savedRole = localStorage.getItem('selectedRole');
            if (savedRole && ['student', 'teacher', 'admin'].includes(savedRole)) {
                this.selectedRole = savedRole;
            }
            
            // 检查是否已经登录
            const token = localStorage.getItem('token');
            if (token) {
                this.checkLoginStatus();
            }
        },
        
        // 检查登录状态
        async checkLoginStatus() {
            try {
                // 检查学生token
                const studentToken = localStorage.getItem('token');
                if (studentToken) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${studentToken}`;
                    const response = await axios.get('/auth/me');
                    if (response.data.success) {
                        const userInfo = response.data.data;
                        this.redirectToUserPage(userInfo.role || 'student');
                        return;
                    }
                }

                // 检查教师token
                const teacherToken = localStorage.getItem('teacher_token');
                if (teacherToken) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${teacherToken}`;
                    const response = await axios.get('/teacher/auth/profile');
                    if (response.data.success) {
                        const userInfo = response.data.data;
                        this.redirectToUserPage(userInfo.role || 'teacher');
                        return;
                    }
                }

                // 检查管理员token
                const adminToken = localStorage.getItem('admin_token');
                if (adminToken) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
                    const response = await axios.get('/admin/auth/me');
                    if (response.data.success) {
                        const userInfo = response.data.data;
                        this.redirectToUserPage(userInfo.role || 'admin');
                        return;
                    }
                }
            } catch (error) {
                console.log('检查登录状态失败:', error);
                // 清除可能无效的token
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                localStorage.removeItem('teacher_token');
                localStorage.removeItem('teacher_user');
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                localStorage.removeItem('userRole');
            }
        },
        
        // 选择身份
        selectRole(role) {
            this.selectedRole = role;
            localStorage.setItem('selectedRole', role);
            
            // 重置表单
            this.resetForms();
        },
        
        // 重置表单
        resetForms() {
            this.loginForm = {
                username: '',
                password: ''
            };
            this.registerForm = {
                username: '',
                student_id: '',
                teacher_id: '',
                real_name: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: ''
            };
            
            // 清除验证状态
            if (this.$refs.loginForm) {
                this.$refs.loginForm.clearValidate();
            }
            if (this.$refs.registerForm) {
                this.$refs.registerForm.clearValidate();
            }
        },
        
        // 验证确认密码
        validateConfirmPassword(rule, value, callback) {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        },
        
        // 处理登录
        async handleLogin() {
            try {
                await this.$refs.loginForm.validate();
                
                this.loginLoading = true;
                
                // 根据选择的身份调用不同的登录接口
                const loginData = {
                    username: this.loginForm.username,
                    password: this.loginForm.password,
                    role: this.selectedRole
                };
                
                let response;
                console.log('登录请求数据:', loginData);
                
                switch (this.selectedRole) {
                    case 'student':
                        response = await axios.post('/auth/login', loginData);
                        break;
                    case 'teacher':
                        response = await axios.post('/teacher/auth/login', loginData);
                        break;
                    case 'admin':
                        response = await axios.post('/admin/auth/login', loginData);
                        break;
                    default:
                        throw new Error('无效的身份类型');
                }
                
                if (response.data.success) {
                    const { token, user } = response.data.data;
                    
                    // 验证身份是否匹配
                    let roleValid = false;
                    if (this.selectedRole === 'admin') {
                        // 管理员身份包括 super_admin, admin, operator
                        roleValid = ['super_admin', 'admin', 'operator'].includes(user.role);
                    } else {
                        roleValid = user.role === this.selectedRole;
                    }
                    
                    if (!roleValid) {
                        this.$message.error('身份验证失败，请选择正确的身份');
                        return;
                    }
                    
                    // 根据身份类型使用不同的存储键
                    if (this.selectedRole === 'teacher') {
                        // 教师使用专用存储键
                        localStorage.setItem('teacher_token', token);
                        localStorage.setItem('teacher_user', JSON.stringify(user));
                    } else if (this.selectedRole === 'admin') {
                        // 管理员使用专用存储键
                        user.userType = 'admin'; // 确保用户信息包含userType标识
                        localStorage.setItem('admin_token', token);
                        localStorage.setItem('admin_user', JSON.stringify(user));
                    } else {
                        // 学生使用通用存储键
                        localStorage.setItem('token', token);
                        localStorage.setItem('userInfo', JSON.stringify(user));
                    }
                    localStorage.setItem('userRole', user.role);
                    
                    this.$message.success('登录成功');
                    
                    // 跳转到对应页面
                    this.redirectToUserPage(user.role);
                } else {
                    this.$message.error(response.data.message || '登录失败');
                }
            } catch (error) {
                console.error('登录错误:', error);
                console.error('错误响应:', error.response);
                console.error('错误状态码:', error.response?.status);
                console.error('错误消息:', error.response?.data);
                
                if (error.response && error.response.status === 401) {
                    this.$message.error('用户名或密码错误');
                } else if (error.response && error.response.status === 403) {
                    this.$message.error('身份验证失败，请选择正确的身份');
                } else if (error.code === 'ECONNREFUSED') {
                    this.$message.error('服务器连接失败，请检查服务器是否启动');
                } else {
                    this.$message.error(error.response?.data?.message || '登录失败，请稍后重试');
                }
            } finally {
                this.loginLoading = false;
            }
        },
        
        // 处理注册
        async handleRegister() {
            try {
                await this.$refs.registerForm.validate();
                
                this.registerLoading = true;
                
                // 根据选择的身份调用不同的注册接口
                const registerData = {
                    ...this.registerForm,
                    role: this.selectedRole
                };
                
                // 移除确认密码字段
                delete registerData.confirmPassword;
                
                let response;
                switch (this.selectedRole) {
                    case 'student':
                        response = await axios.post('/auth/register', registerData);
                        break;
                    case 'teacher':
                        response = await axios.post('/teacher/auth/register', registerData);
                        break;
                    case 'admin':
                        this.$message.warning('管理员账号需要由系统管理员创建');
                        return;
                    default:
                        throw new Error('无效的身份类型');
                }
                
                if (response.data.success) {
                    this.$message.success('注册成功，请登录');
                    this.authMode = 'login';
                    this.resetForms();
                } else {
                    this.$message.error(response.data.message || '注册失败');
                }
            } catch (error) {
                console.error('注册错误:', error);
                if (error.response && error.response.status === 409) {
                    this.$message.error('用户名或学号/工号已存在');
                } else {
                    this.$message.error(error.response?.data?.message || '注册失败，请稍后重试');
                }
            } finally {
                this.registerLoading = false;
            }
        },
        
        // 跳转到用户页面
        redirectToUserPage(role) {
            const baseUrl = window.location.origin;
            let redirectUrl;
            
            switch (role) {
                case 'student':
                    redirectUrl = `${baseUrl}/student`;
                    break;
                case 'teacher':
                    redirectUrl = `${baseUrl}/teacher`;
                    break;
                case 'admin':
                case 'super_admin':
                case 'operator':
                    redirectUrl = `${baseUrl}/admin`;
                    break;
                default:
                    redirectUrl = `${baseUrl}/student`;
            }
            
            // 延迟跳转，让用户看到成功消息并确保数据存储完成
            setTimeout(() => {
                // 再次确认数据已保存
                console.log('跳转前检查 localStorage:', {
                    token: localStorage.getItem('token') ? '存在' : '不存在',
                    userInfo: localStorage.getItem('userInfo') ? '存在' : '不存在',
                    teacher_token: localStorage.getItem('teacher_token') ? '存在' : '不存在',
                    teacher_user: localStorage.getItem('teacher_user') ? '存在' : '不存在',
                    admin_token: localStorage.getItem('admin_token') ? '存在' : '不存在',
                    admin_user: localStorage.getItem('admin_user') ? '存在' : '不存在',
                    userRole: localStorage.getItem('userRole'),
                    selectedRole: this.selectedRole
                });
                window.location.href = redirectUrl;
            }, 1500);
        },
        
        // 快速登录（测试用）
        quickLogin(role, username, password) {
            this.selectedRole = role;
            this.loginForm.username = username;
            this.loginForm.password = password;
            this.handleLogin();
        }
    },
    
    watch: {
        // 监听身份变化，重置表单
        selectedRole() {
            this.resetForms();
        },
        
        // 监听认证模式变化，重置表单
        authMode() {
            this.resetForms();
        }
    }
});

// 添加全局错误处理
window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
});

// 添加页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // 页面隐藏时的处理
    } else {
        // 页面显示时的处理
        // 可以在这里检查登录状态
    }
});

// 添加键盘事件处理
document.addEventListener('keydown', function(event) {
    // Enter键提交表单
    if (event.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'INPUT') {
            const form = activeElement.closest('.auth-form');
            if (form) {
                if (app.authMode === 'login') {
                    app.handleLogin();
                } else {
                    app.handleRegister();
                }
            }
        }
    }
});

// 添加页面加载完成事件
document.addEventListener('DOMContentLoaded', function() {
    // 添加页面加载动画
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// 导出app实例供调试使用
window.app = app;
