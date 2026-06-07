/**
 * 用户留言路由配置
 * 处理用户留言相关的 API 请求（需要登录）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/user/messageController');

// 获取我的留言列表
router.get('/messages', asyncHandler(controller.listMine));

// 创建留言
router.post('/messages', asyncHandler(controller.create));

module.exports = router;
