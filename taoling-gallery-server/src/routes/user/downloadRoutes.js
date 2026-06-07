/**
 * 用户下载路由配置
 * 处理用户下载记录相关的 API 请求（需要登录）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/user/downloadController');

// 创建下载记录
router.post('/downloads', asyncHandler(controller.create));

// 获取下载记录列表
router.get('/downloads', asyncHandler(controller.list));

// 删除单条下载记录
router.delete('/downloads/:recordId', asyncHandler(controller.remove));

// 清空所有下载记录
router.delete('/downloads', asyncHandler(controller.clear));

module.exports = router;
