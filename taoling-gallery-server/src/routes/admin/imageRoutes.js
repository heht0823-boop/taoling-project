/**
 * 管理员图片管理路由配置
 * 处理图片上传、创建、更新、状态管理和删除操作（需要管理员权限）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const { uploadImage } = require('../../middlewares/upload');
const controller = require('../../controllers/admin/imageAdminController');

// 上传图片文件
router.post('/files/images', uploadImage.single('file'), asyncHandler(controller.uploadFile));

// 创建图片记录
router.post('/images', asyncHandler(controller.create));

// 获取图片列表
router.get('/images', asyncHandler(controller.list));

// 获取图片详情
router.get('/images/:id', asyncHandler(controller.detail));

// 更新图片信息（支持 PUT 和 PATCH）
router.put('/images/:id', asyncHandler(controller.update));
router.patch('/images/:id', asyncHandler(controller.update));

// 更新图片状态
router.patch('/images/:id/status', asyncHandler(controller.status));

// 删除图片
router.delete('/images/:id', asyncHandler(controller.remove));

// 恢复已删除图片
router.patch('/images/:id/restore', asyncHandler(controller.restore));

module.exports = router;
