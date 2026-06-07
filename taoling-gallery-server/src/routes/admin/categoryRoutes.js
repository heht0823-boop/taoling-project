/**
 * 管理员分类管理路由配置
 * 处理分类列表、创建、更新和删除操作（需要管理员权限）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/admin/categoryAdminController');

// 获取分类列表
router.get('/categories', asyncHandler(controller.list));

// 创建分类
router.post('/categories', asyncHandler(controller.create));

// 更新分类（支持 PUT 和 PATCH）
router.put('/categories/:id', asyncHandler(controller.update));
router.patch('/categories/:id', asyncHandler(controller.update));

// 删除分类
router.delete('/categories/:id', asyncHandler(controller.remove));

module.exports = router;
