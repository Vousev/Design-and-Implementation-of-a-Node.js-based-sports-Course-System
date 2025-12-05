const express = require('express');
const router = express.Router();
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');
const {
    getQualifications,
    getTeacherQualifications,
    createQualification,
    updateQualification,
    deleteQualification,
    updateQualificationStatus,
    getQualificationStatistics,
    verifyQualification
} = require('../controllers/teacherQualificationController');

// 获取资质列表
router.get('/', authenticateAdmin, requirePermission(['teacher_management']), getQualifications);

// 获取资质统计
router.get('/statistics', authenticateAdmin, requirePermission(['teacher_management']), getQualificationStatistics);

// 获取指定教师的资质
router.get('/teacher/:teacherId', authenticateAdmin, requirePermission(['teacher_management']), getTeacherQualifications);

// 创建资质
router.post('/', authenticateAdmin, requirePermission(['teacher_management']), createQualification);

// 更新资质
router.put('/:id', authenticateAdmin, requirePermission(['teacher_management']), updateQualification);

// 删除资质
router.delete('/:id', authenticateAdmin, requirePermission(['teacher_management']), deleteQualification);

// 批量更新状态
router.post('/batch-status', authenticateAdmin, requirePermission(['teacher_management']), updateQualificationStatus);

// 验证资质
router.post('/:id/verify', authenticateAdmin, requirePermission(['teacher_management']), verifyQualification);

module.exports = router;
