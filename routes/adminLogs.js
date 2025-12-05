const express = require('express');
const router = express.Router();
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');
const {
    getSystemLogs,
    getLogDetail,
    cleanupOldLogs,
    exportLogs,
    getLogStatistics
} = require('../controllers/logController');

// 系统日志路由
router.get('/', authenticateAdmin, requirePermission(['system_monitoring']), getSystemLogs);
router.get('/statistics', authenticateAdmin, requirePermission(['system_monitoring']), getLogStatistics);
router.get('/export', authenticateAdmin, requirePermission(['system_monitoring']), exportLogs);
router.get('/:id', authenticateAdmin, requirePermission(['system_monitoring']), getLogDetail);
router.post('/cleanup', authenticateAdmin, requirePermission(['system_management']), cleanupOldLogs);

module.exports = router;
