/**
 * AI 助手路由配置
 * 处理 AI 对话相关的 API 请求（需要登录）
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const controller = require('../../controllers/user/aiController');

// AI 对话（支持流式和非流式响应）
router.post('/chat', asyncHandler(controller.chat));

// 会话管理
router.post('/conversations', asyncHandler(controller.createConversation));
router.get('/conversations', asyncHandler(controller.conversations));
router.get('/conversations/:conversationId/messages', asyncHandler(controller.messages));
router.delete('/conversations/:conversationId', asyncHandler(controller.remove));
router.delete('/conversations', asyncHandler(controller.clear));

module.exports = router;
