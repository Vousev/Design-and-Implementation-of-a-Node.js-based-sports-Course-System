const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

// 管理员登录
router.post('/login', adminAuthController.login);

// 管理员登出
router.post('/logout', authenticateAdmin, adminAuthController.logout);

// 获取当前管理员信息
router.get('/me', authenticateAdmin, adminAuthController.getCurrentAdmin);

// 修改密码
router.put('/change-password', authenticateAdmin, adminAuthController.changePassword);

// 管理员管理（需要超级管理员权限）
router.get('/admins', authenticateAdmin, requirePermission(['user_management']), adminAuthController.getAdminList);
router.post('/admins', authenticateAdmin, requirePermission(['user_management']), adminAuthController.createAdmin);
router.put('/admins/:id', authenticateAdmin, requirePermission(['user_management']), adminAuthController.updateAdmin);
router.put('/admins/:id/reset-password', authenticateAdmin, requirePermission(['user_management']), adminAuthController.resetAdminPassword);

module.exports = router;
