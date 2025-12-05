const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// 导入路由
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const selectionRoutes = require('./routes/selections');

// 导入教师端路由
const teacherAuthRoutes = require('./routes/teacherAuth');
const teacherCourseRoutes = require('./routes/teacherCourses');
const teacherGradeRoutes = require('./routes/teacherGrades');
const teacherApplicationRoutes = require('./routes/teacherApplications');
const teacherQualificationRoutes = require('./routes/teacherQualifications');

// 导入管理员端路由
const adminAuthRoutes = require('./routes/adminAuth');
const adminConfigRoutes = require('./routes/adminConfig');
const adminSystemConfigRoutes = require('./routes/adminSystemConfig');
const adminResourceRoutes = require('./routes/adminResources');
const adminMonitoringRoutes = require('./routes/adminMonitoring');
const adminUsersRoutes = require('./routes/adminUsers');
const adminLogsRoutes = require('./routes/adminLogs');
const adminQualificationsRoutes = require('./routes/adminQualifications');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 
        ['https://yourdomain.com'] : 
        ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 学生端API路由
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/selections', selectionRoutes);

// 教师端API路由
app.use('/api/teacher/auth', teacherAuthRoutes);
app.use('/api/teacher/courses', teacherCourseRoutes);
app.use('/api/teacher/grades', teacherGradeRoutes);
app.use('/api/teacher/applications', teacherApplicationRoutes);
app.use('/api/teacher/qualifications', teacherQualificationRoutes);

// 管理员端API路由
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/config', adminConfigRoutes);
app.use('/api/admin/system', adminSystemConfigRoutes);
app.use('/api/admin/resources', adminResourceRoutes);
app.use('/api/admin/monitoring', adminMonitoringRoutes);
app.use('/api/admin', adminUsersRoutes);
app.use('/api/admin/logs', adminLogsRoutes);
app.use('/api/admin/qualifications', adminQualificationsRoutes);

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        endpoints: {
            student: {
                auth: '/api/auth',
                courses: '/api/courses',
                selections: '/api/selections'
            },
            teacher: {
                auth: '/api/teacher/auth',
                courses: '/api/teacher/courses',
                grades: '/api/teacher/grades',
                applications: '/api/teacher/applications'
            },
            admin: {
                auth: '/api/admin/auth',
                config: '/api/admin/config',
                resources: '/api/admin/resources',
                monitoring: '/api/admin/monitoring'
            }
        }
    });
});

// 前端页面路由
app.get('/student', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'student.html'));
});

app.get('/teacher', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'teacher.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// 根路径返回主页面（登录注册页面）
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 前端路由处理（SPA支持）
app.get('*', (req, res) => {
    // 如果是API请求但路由不存在，返回404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API接口不存在'
        });
    }
    
    // 其他请求返回主页面
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    
    // 数据库连接错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ER_ACCESS_DENIED_ERROR') {
        return res.status(503).json({
            success: false,
            message: '数据库连接失败，请稍后重试'
        });
    }
    
    // JWT错误
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: '无效的访问令牌'
        });
    }
    
    // 验证错误
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: '数据验证失败',
            details: error.message
        });
    }
    
    // 默认错误处理
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 
            '服务器内部错误' : 
            error.message
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '请求的资源不存在'
    });
});

// 启动服务器
async function startServer() {
    try {
        // 测试数据库连接
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('数据库连接失败，服务器启动中止');
            process.exit(1);
        }
        
        // 启动HTTP服务器
        app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    体育选课系统服务器                          ║
║                                                              ║
║  服务器地址: http://localhost:${PORT}                          ║
║  API文档: http://localhost:${PORT}/api/health                 ║
║  环境: ${process.env.NODE_ENV || 'development'}                ║
║                                                              ║
║  主页面: http://localhost:${PORT}                             ║
║  学生端: http://localhost:${PORT}/student                     ║
║  教师端: http://localhost:${PORT}/teacher                     ║
║  管理员端: http://localhost:${PORT}/admin                      ║
║                                                              ║
║  服务器已成功启动！                                            ║
╚══════════════════════════════════════════════════════════════╝
            `);
        });
        
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
}

// 优雅关闭处理
process.on('SIGTERM', () => {
    console.log('收到SIGTERM信号，正在优雅关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('收到SIGINT信号，正在优雅关闭服务器...');
    process.exit(0);
});

// 未捕获异常处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    process.exit(1);
});

// 启动服务器
startServer();
