/**
 * 管理员留言管理路由配置
 * 处理留言列表、详情、回复和屏蔽操作（需要管理员权限）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/admin/messageAdminController');

// 获取留言列表
router.get('/messages', asyncHandler(controller.list));

// 获取留言详情
router.get('/messages/:id', asyncHandler(controller.detail));

// 回复留言
router.post('/messages/:id/replies', asyncHandler(controller.reply));

// 屏蔽留言（逻辑删除）
router.delete('/messages/:id', asyncHandler(controller.block));

module.exports = router;
