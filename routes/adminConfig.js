const express = require('express');
const router = express.Router();
const selectionConfigController = require('../controllers/selectionConfigController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

// 选课配置管理
router.get('/selection-configs', authenticateAdmin, requirePermission(['selection_config']), selectionConfigController.getSelectionConfigs);
router.get('/selection-configs/current', authenticateAdmin, selectionConfigController.getCurrentConfig);
router.get('/selection-configs/:id', authenticateAdmin, requirePermission(['selection_config']), selectionConfigController.getSelectionConfig);
router.post('/selection-configs', authenticateAdmin, requirePermission(['selection_config']), selectionConfigController.createSelectionConfig);
router.put('/selection-configs/:id', authenticateAdmin, requirePermission(['selection_config']), selectionConfigController.updateSelectionConfig);
router.post('/selection-configs/:id/activate', authenticateAdmin, requirePermission(['selection_config']), selectionConfigController.activateSelectionConfig);
router.post('/selection-configs/:id/end', authenticateAdmin, requirePermission(['selection_config']), selectionConfigController.endSelectionConfig);
router.delete('/selection-configs/:id', authenticateAdmin, requirePermission(['selection_config']), selectionConfigController.deleteSelectionConfig);
router.post('/selection-configs/:id/copy', authenticateAdmin, requirePermission(['selection_config']), selectionConfigController.copySelectionConfig);

module.exports = router;
