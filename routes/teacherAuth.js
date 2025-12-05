const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    teacherLogin,
    teacherRegister,
    getCurrentTeacher,
    updateTeacherProfile,
    changePassword
} = require('../controllers/teacherAuthController');

// 教师登录
router.post('/login', teacherLogin);

// 教师注册
router.post('/register', teacherRegister);

// 获取当前教师信息（需要认证）
router.get('/profile', authenticateToken, getCurrentTeacher);

// 更新教师个人信息（需要认证）
router.put('/profile', authenticateToken, updateTeacherProfile);

// 修改密码（需要认证）
router.put('/password', authenticateToken, changePassword);

module.exports = router;
