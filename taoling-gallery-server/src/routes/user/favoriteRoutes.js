/**
 * 用户收藏路由配置
 * 处理用户收藏相关的 API 请求（需要登录）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/user/favoriteController');

// 添加收藏
router.post('/favorites', asyncHandler(controller.add));

// 取消收藏
router.delete('/favorites/:imageId', asyncHandler(controller.remove));

// 获取收藏列表
router.get('/favorites', asyncHandler(controller.list));

module.exports = router;
