const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

// 场地管理
router.get('/venues', authenticateAdmin, requirePermission(['resource_management']), resourceController.getVenues);
router.get('/venues/:id', authenticateAdmin, requirePermission(['resource_management']), resourceController.getVenue);
router.post('/venues', authenticateAdmin, requirePermission(['resource_management']), resourceController.createVenue);
router.put('/venues/:id', authenticateAdmin, requirePermission(['resource_management']), resourceController.updateVenue);
router.delete('/venues/:id', authenticateAdmin, requirePermission(['resource_management']), resourceController.deleteVenue);

// 场地时间表管理
router.get('/venues/:id/schedules', authenticateAdmin, requirePermission(['resource_management']), resourceController.getVenueSchedules);
router.put('/venues/:id/schedule', authenticateAdmin, requirePermission(['resource_management']), resourceController.updateVenueSchedule);
router.get('/venues/:id/schedules/:day', authenticateAdmin, requirePermission(['resource_management']), resourceController.getDaySchedule);
router.put('/venues/:id/schedules/:day', authenticateAdmin, requirePermission(['resource_management']), resourceController.updateDaySchedule);
router.post('/venues/:id/batch-hours', authenticateAdmin, requirePermission(['resource_management']), resourceController.batchSetVenueHours);
router.delete('/venues/:id/schedules', authenticateAdmin, requirePermission(['resource_management']), resourceController.clearVenueSchedule);
router.get('/venues/:id/usage-statistics', authenticateAdmin, requirePermission(['resource_management']), resourceController.getVenueUsageStatistics);
router.post('/venues/copy-schedule', authenticateAdmin, requirePermission(['resource_management']), resourceController.copyVenueSchedule);
router.get('/venues/check-conflict', authenticateAdmin, resourceController.checkVenueConflict);

// 教师管理
router.get('/teachers', authenticateAdmin, requirePermission(['teacher_management']), resourceController.getTeachers);
router.get('/teachers/:id', authenticateAdmin, requirePermission(['teacher_management']), resourceController.getTeacher);
router.post('/teachers', authenticateAdmin, requirePermission(['teacher_management']), resourceController.createTeacher);
router.put('/teachers/:id', authenticateAdmin, requirePermission(['teacher_management']), resourceController.updateTeacher);

// 教师资质管理
router.post('/teachers/:teacher_id/qualifications', authenticateAdmin, requirePermission(['teacher_management']), resourceController.addTeacherQualification);
router.put('/qualifications/:id', authenticateAdmin, requirePermission(['teacher_management']), resourceController.updateTeacherQualification);
router.delete('/qualifications/:id', authenticateAdmin, requirePermission(['teacher_management']), resourceController.deleteTeacherQualification);

module.exports = router;
