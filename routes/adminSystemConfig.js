const express = require('express');
const router = express.Router();
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');
const systemConfigController = require('../controllers/systemConfigController');

// 获取系统配置列表
router.get('/configs', authenticateAdmin, systemConfigController.getSystemConfigs);

// 获取配置分类
router.get('/configs/categories', authenticateAdmin, systemConfigController.getConfigCategories);

// 获取单个系统配置
router.get('/configs/:key', authenticateAdmin, systemConfigController.getSystemConfig);

// 更新系统配置
router.put('/configs/:key', authenticateAdmin, requirePermission(['system_management']), systemConfigController.updateSystemConfig);

// 创建系统配置
router.post('/configs', authenticateAdmin, requirePermission(['system_management']), systemConfigController.createSystemConfig);

// 删除系统配置
router.delete('/configs/:key', authenticateAdmin, requirePermission(['system_management']), systemConfigController.deleteSystemConfig);

// 批量更新配置
router.put('/configs/batch/update', authenticateAdmin, requirePermission(['system_management']), systemConfigController.batchUpdateConfigs);

// 重置配置到默认值
router.post('/configs/:key/reset', authenticateAdmin, requirePermission(['system_management']), systemConfigController.resetConfigToDefault);

module.exports = router;
