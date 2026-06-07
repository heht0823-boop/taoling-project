/**
 * 管理员用户管理路由配置
 * 处理用户列表、详情、状态更新和删除操作（需要管理员权限）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/admin/userAdminController');

// 获取用户列表
router.get('/users', asyncHandler(controller.list));

// 获取用户详情
router.get('/users/:id', asyncHandler(controller.detail));

// 更新用户状态
router.patch('/users/:id/status', asyncHandler(controller.status));

// 删除用户
router.delete('/users/:id', asyncHandler(controller.remove));

module.exports = router;
