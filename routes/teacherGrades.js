const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getCourseGrades,
    updateStudentGrade,
    batchUpdateGrades,
    submitGrades,
    getGradeStatistics
} = require('../controllers/gradeController');

// 获取课程学生成绩列表
router.get('/course/:courseId', authenticateToken, getCourseGrades);

// 录入或更新单个学生成绩
router.put('/course/:courseId/student/:studentId', authenticateToken, updateStudentGrade);

// 批量录入成绩
router.post('/course/:courseId/batch', authenticateToken, batchUpdateGrades);

// 提交成绩到教务系统
router.post('/course/:courseId/submit', authenticateToken, submitGrades);

// 获取成绩统计信息
router.get('/course/:courseId/statistics', authenticateToken, getGradeStatistics);

module.exports = router;
