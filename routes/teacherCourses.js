const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getDashboardData,
    getTeacherCourses,
    createCourse,
    updateCourse,
    publishCourse,
    closeCourse,
    openCourse,
    getCourseStudents,
    deleteCourse
} = require('../controllers/teacherController');

// 获取教师工作台数据
router.get('/dashboard', authenticateToken, getDashboardData);

// 获取教师的课程列表
router.get('/', authenticateToken, getTeacherCourses);

// 创建新课程
router.post('/', authenticateToken, createCourse);

// 更新课程信息
router.put('/:id', authenticateToken, updateCourse);

// 发布课程
router.post('/:id/publish', authenticateToken, publishCourse);

// 关闭课程
router.post('/:id/close', authenticateToken, closeCourse);

// 重新开启课程
router.post('/:id/open', authenticateToken, openCourse);

// 获取课程选课名单
router.get('/:id/students', authenticateToken, getCourseStudents);

// 删除课程
router.delete('/:id', authenticateToken, deleteCourse);

module.exports = router;
