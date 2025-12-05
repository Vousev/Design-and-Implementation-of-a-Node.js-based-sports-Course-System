const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    selectCourse,
    dropCourse,
    getMySelections,
    favoriteCourse,
    unfavoriteCourse,
    getFavoriteCourses,
    getSelectionHistory
} = require('../controllers/selectionController');

// 选课操作（需要认证）
router.post('/select', authenticateToken, selectCourse);

// 退选操作（需要认证）
router.post('/drop', authenticateToken, dropCourse);

// 获取我的选课列表（需要认证）
router.get('/my', authenticateToken, getMySelections);

// 收藏课程（需要认证）
router.post('/favorite', authenticateToken, favoriteCourse);

// 取消收藏课程（需要认证）
router.delete('/favorite', authenticateToken, unfavoriteCourse);

// 获取收藏的课程列表（需要认证）
router.get('/favorites', authenticateToken, getFavoriteCourses);

// 获取选课历史（需要认证）
router.get('/history', authenticateToken, getSelectionHistory);

module.exports = router;
