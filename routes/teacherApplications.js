const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getPendingApplications,
    getAllApplications,
    getApplicationDetail,
    processApplication,
    batchProcessApplications
} = require('../controllers/applicationController');

// 获取待处理的特殊申请列表
router.get('/pending', authenticateToken, getPendingApplications);

// 获取所有申请历史（包括已处理的）
router.get('/all', authenticateToken, getAllApplications);

// 获取单个申请详情
router.get('/:id', authenticateToken, getApplicationDetail);

// 审核申请（批准或拒绝）
router.post('/:id/process', authenticateToken, processApplication);

// 批量处理申请
router.post('/batch-process', authenticateToken, batchProcessApplications);

module.exports = router;
