/**
 * 管理员仪表盘路由配置
 * 处理系统统计和操作日志相关请求（需要管理员权限）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/admin/dashboardController');

// 获取系统统计数据
router.get('/dashboard/stats', asyncHandler(controller.stats));

// 获取操作日志列表
router.get('/logs', asyncHandler(controller.logs));

module.exports = router;
