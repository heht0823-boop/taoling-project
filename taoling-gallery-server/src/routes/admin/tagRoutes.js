/**
 * 管理员标签管理路由配置
 * 处理标签列表、创建、更新和删除操作（需要管理员权限）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/admin/tagAdminController');

// 获取标签列表
router.get('/tags', asyncHandler(controller.list));

// 创建标签
router.post('/tags', asyncHandler(controller.create));

// 更新标签（支持 PUT 和 PATCH）
router.put('/tags/:id', asyncHandler(controller.update));
router.patch('/tags/:id', asyncHandler(controller.update));

// 删除标签
router.delete('/tags/:id', asyncHandler(controller.remove));

module.exports = router;
