const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getMyQualifications,
    applyQualification
} = require('../controllers/teacherQualificationController');

// 获取教师自己的资质列表
router.get('/my-qualifications', authenticateToken, getMyQualifications);

// 申请新资质
router.post('/apply', authenticateToken, applyQualification);

module.exports = router;
