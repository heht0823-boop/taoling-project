/**
 * 用户资料路由配置
 * 处理用户个人资料相关的 API 请求（需要登录）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const { uploadImage } = require('../../middlewares/upload');
const controller = require('../../controllers/user/profileController');

// 获取用户资料
router.get('/profile', asyncHandler(controller.profile));

// 获取用户统计摘要
router.get('/profile/summary', asyncHandler(controller.summary));

// 更新用户资料（支持 PUT 和 PATCH）
router.put('/profile', asyncHandler(controller.updateProfile));
router.patch('/profile', asyncHandler(controller.updateProfile));

// 更新头像（支持 POST 和 PATCH）
router.post('/profile/avatar', uploadImage.single('file'), asyncHandler(controller.updateAvatar));
router.patch('/profile/avatar', uploadImage.single('file'), asyncHandler(controller.updateAvatar));

// 修改密码
router.patch('/password', asyncHandler(controller.updatePassword));

module.exports = router;
