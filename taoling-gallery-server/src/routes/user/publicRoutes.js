/**
 * 公开路由配置
 * 无需登录即可访问的接口（部分支持可选认证）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const { optionalAuth, auth } = require('../../middlewares/auth');
const image = require('../../controllers/user/imageController');
const favorite = require('../../controllers/user/favoriteController');
const download = require('../../controllers/user/downloadController');
const message = require('../../controllers/user/messageController');

// 图片相关接口
router.get('/images', optionalAuth, asyncHandler(image.list));
router.get('/images/:id/thumbnail', optionalAuth, asyncHandler(image.thumbnail));
router.get('/images/:id', optionalAuth, asyncHandler(image.detail));
router.post('/images/:id/view', optionalAuth, asyncHandler(image.view));
router.get('/images/:id/related', optionalAuth, asyncHandler(image.related));

// 收藏和下载（需要登录）
router.post('/images/:id/favorite', auth, asyncHandler(favorite.add));
router.delete('/images/:id/favorite', auth, asyncHandler(favorite.remove));
router.post('/images/:id/download', auth, asyncHandler(download.create));

// 分类和标签
router.get('/categories', optionalAuth, asyncHandler(image.categories));
router.get('/tags', optionalAuth, asyncHandler(image.tags));

// 留言板
router.get('/messages', optionalAuth, asyncHandler(message.listBoard));

module.exports = router;
