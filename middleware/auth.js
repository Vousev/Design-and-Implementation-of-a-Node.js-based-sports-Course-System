const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// JWT认证中间件（支持学生和教师）
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '访问令牌缺失'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 根据用户类型验证用户
        if (decoded.userType === 'teacher') {
            // 验证教师用户（使用统一users表）
            const teachers = await query(`
                SELECT 
                    u.id as userId,
                    u.teacher_id as teacherId,
                    u.username,
                    'teacher' as role,
                    u.status,
                    t.name,
                    t.title,
                    t.department
                FROM users u
                JOIN teachers t ON u.teacher_id = t.id
                WHERE u.id = ? AND u.user_type = 'teacher' AND u.status = 'active'
            `, [decoded.userId]);

            if (teachers.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: '教师用户不存在或已被禁用'
                });
            }

            req.user = {
                ...teachers[0],
                userType: 'teacher'
            };
        } else {
            // 验证学生用户
            const students = await query(
                'SELECT id, student_id, username, real_name, status FROM users WHERE id = ? AND user_type = "student" AND status = "active"',
                [decoded.userId]
            );

            if (students.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: '学生用户不存在或已被禁用'
                });
            }

            req.user = {
                ...students[0],
                userType: 'student'
            };
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '访问令牌已过期'
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: '无效的访问令牌'
            });
        } else {
            console.error('认证中间件错误:', error);
            return res.status(500).json({
                success: false,
                message: '服务器内部错误'
            });
        }
    }
};

// 可选认证中间件（用于某些可选登录的接口）
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.userType === 'teacher') {
            const teachers = await query(`
                SELECT 
                    u.id as userId,
                    u.teacher_id as teacherId,
                    u.username,
                    'teacher' as role,
                    u.status,
                    t.name,
                    t.title,
                    t.department
                FROM users u
                JOIN teachers t ON u.teacher_id = t.id
                WHERE u.id = ? AND u.user_type = 'teacher' AND u.status = 'active'
            `, [decoded.userId]);

            req.user = teachers.length > 0 ? { ...teachers[0], userType: 'teacher' } : null;
        } else {
            const students = await query(
                'SELECT id, student_id, username, real_name, status FROM users WHERE id = ? AND user_type = "student" AND status = "active"',
                [decoded.userId]
            );

            req.user = students.length > 0 ? { ...students[0], userType: 'student' } : null;
        }

        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// 教师权限验证中间件
const requireTeacher = (req, res, next) => {
    if (!req.user || req.user.userType !== 'teacher') {
        return res.status(403).json({
            success: false,
            message: '需要教师权限'
        });
    }
    next();
};

// 学生权限验证中间件
const requireStudent = (req, res, next) => {
    if (!req.user || req.user.userType !== 'student') {
        return res.status(403).json({
            success: false,
            message: '需要学生权限'
        });
    }
    next();
};

// 管理员权限验证中间件
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.userType !== 'teacher' || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '需要管理员权限'
        });
    }
    next();
};

// 生成JWT令牌（学生）
const generateToken = (userId, studentId, role = 'student') => {
    return jwt.sign(
        { 
            userId, 
            studentId,
            role,
            userType: 'student'
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: '24h' // 24小时过期
        }
    );
};

// 生成JWT令牌（教师）
const generateTeacherToken = (userId, teacherId, role = 'teacher') => {
    return jwt.sign(
        { 
            userId, 
            teacherId,
            role,
            userType: 'teacher'
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: '24h' // 24小时过期
        }
    );
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireTeacher,
    requireStudent,
    requireAdmin,
    generateToken,
    generateTeacherToken
};
