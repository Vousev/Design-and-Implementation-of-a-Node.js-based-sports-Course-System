const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');
const emergencyController = require('../controllers/emergencyController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

// 系统监控
router.get('/overview', authenticateAdmin, requirePermission(['system_monitoring']), monitoringController.getSystemOverview);
router.get('/selection-progress', authenticateAdmin, requirePermission(['statistics']), monitoringController.getSelectionProgress);
router.get('/course-popularity', authenticateAdmin, requirePermission(['statistics']), monitoringController.getCoursePopularity);
router.get('/system-performance', authenticateAdmin, requirePermission(['system_monitoring']), monitoringController.getSystemPerformance);
router.get('/user-behavior', authenticateAdmin, requirePermission(['statistics']), monitoringController.getUserBehaviorStats);
router.get('/real-time-status', authenticateAdmin, requirePermission(['system_monitoring']), monitoringController.getRealTimeStatus);
router.post('/update-stats', authenticateAdmin, requirePermission(['system_monitoring']), monitoringController.updateSystemStats);

// 异常事件管理
router.get('/incidents', authenticateAdmin, requirePermission(['incident_management']), monitoringController.getSystemIncidents);
router.post('/incidents', authenticateAdmin, requirePermission(['incident_management']), monitoringController.createSystemIncident);
router.put('/incidents/:id/status', authenticateAdmin, requirePermission(['incident_management']), monitoringController.updateIncidentStatus);

// 紧急处理
router.post('/emergency/adjust-selection', authenticateAdmin, requirePermission(['emergency_handling']), emergencyController.adjustCourseSelection);
router.post('/emergency/batch-process', authenticateAdmin, requirePermission(['emergency_handling']), emergencyController.batchProcessSelections);
router.post('/emergency/maintenance-mode', authenticateAdmin, requirePermission(['system_maintenance']), emergencyController.toggleMaintenanceMode);
router.post('/emergency/stop-selection', authenticateAdmin, requirePermission(['emergency_handling']), emergencyController.emergencyStopSelection);
router.post('/emergency/cleanup-data', authenticateAdmin, requirePermission(['data_maintenance']), emergencyController.cleanupAnomalousData);
router.get('/emergency/system-health', authenticateAdmin, requirePermission(['system_monitoring']), emergencyController.getSystemHealth);

// 数据完整性验证
router.post('/validate-integrity', authenticateAdmin, requirePermission(['system_monitoring']), monitoringController.validateDataIntegrity);
router.get('/data-relations', authenticateAdmin, requirePermission(['system_monitoring']), monitoringController.getDataRelationStatus);

module.exports = router;
