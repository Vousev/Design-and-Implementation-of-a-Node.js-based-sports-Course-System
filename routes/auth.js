const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    login,
    register,
    getCurrentUser,
    updateProfile,
    changePassword
} = require('../controllers/authController');

// 用户登录
router.post('/login', login);

// 用户注册（可选功能）
router.post('/register', register);

// 获取当前用户信息（需要认证）
router.get('/me', authenticateToken, getCurrentUser);

// 更新用户信息（需要认证）
router.put('/profile', authenticateToken, updateProfile);

// 修改密码（需要认证）
router.put('/password', authenticateToken, changePassword);

module.exports = router;
