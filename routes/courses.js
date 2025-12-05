const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
    getCategories,
    getCourses,
    getCourseDetail,
    getTeachers,
    getVenues,
    getCourseSchedule
} = require('../controllers/courseController');

// 获取体育类别列表
router.get('/categories', getCategories);

// 获取课程列表（支持筛选和分页）
router.get('/', optionalAuth, getCourses);

// 获取课程详情
router.get('/:id', optionalAuth, getCourseDetail);

// 获取教师列表
router.get('/meta/teachers', getTeachers);

// 获取场地列表
router.get('/meta/venues', getVenues);

// 获取课程时间表
router.get('/meta/schedule', getCourseSchedule);

module.exports = router;
