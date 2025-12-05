const express = require('express');
const router = express.Router();
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');
const {
    getStudents,
    createStudent,
    updateStudent,
    updateStudentStatus,
    getAdmins,
    createAdmin,
    updateAdmin,
    updateAdminStatus
} = require('../controllers/userManagementController');

// 学生管理路由
router.get('/students', authenticateAdmin, requirePermission(['student_management']), getStudents);
router.post('/students', authenticateAdmin, requirePermission(['student_management']), createStudent);
router.put('/students/:id', authenticateAdmin, requirePermission(['student_management']), updateStudent);
router.put('/students/:id/status', authenticateAdmin, requirePermission(['student_management']), updateStudentStatus);

// 管理员管理路由
router.get('/admins', authenticateAdmin, requirePermission(['user_management']), getAdmins);
router.post('/admins', authenticateAdmin, requirePermission(['user_management']), createAdmin);
router.put('/admins/:id', authenticateAdmin, requirePermission(['user_management']), updateAdmin);
router.put('/admins/:id/status', authenticateAdmin, requirePermission(['user_management']), updateAdminStatus);

module.exports = router;
