/**
 * AI Controller - AI 助手控制器
 * 处理 AI 对话相关的 HTTP 请求
 */

const { success, created } = require('../../utils/response');
const service = require('../../services/user/aiService');

/**
 * 判断是否需要流式响应。默认流式，只有显式 stream=false 才走非流式兜底。
 * @param {Object} req - Express 请求对象
 * @returns {boolean} 是否流式响应
 */
const shouldStream = (req) => {
  const value = req.query.stream ?? req.body.stream;
  return !(value === false || value === 'false' || value === 0 || value === '0');
};

/**
 * 写入 SSE 事件（内部方法）
 * @param {Object} res - Express 响应对象
 * @param {string} event - 事件名称
 * @param {Object} data - 事件数据
 */
const writeSse = (res, event, data) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
};

/**
 * AI 对话接口
 * 支持普通响应和流式响应两种模式
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
exports.chat = async (req, res, next) => {
  if (!shouldStream(req)) return created(res, await service.chat(req.user, req.body, req), 'AI 回复成功');

  res.status(200);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  try {
    await service.chatStream(req.user, req.body, req, async (event, data) => writeSse(res, event, data));
  } catch (error) {
    writeSse(res, 'error', {
      code: error.statusCode || 500,
      message: error.message || 'AI 流式回复失败',
      data: error.details || {},
    });
  } finally {
    res.end();
  }
};

/**
 * 创建新的 AI 会话
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.createConversation = async (req, res) => created(res, await service.createConversation(req.user, req.body, req), 'AI 会话创建成功');

/**
 * 获取用户的 AI 会话列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.conversations = async (req, res) => success(res, await service.listConversations(req.user));

/**
 * 获取指定会话的消息列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.messages = async (req, res) => success(res, await service.listMessages(req.user, req.params.id || req.params.conversationId));

/**
 * 删除指定的 AI 会话
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.remove = async (req, res) => success(res, await service.deleteConversation(req.user, req.params.id || req.params.conversationId, req), 'AI 会话已删除');

/**
 * 清空用户所有 AI 会话
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.clear = async (req, res) => success(res, await service.clearConversations(req.user), 'AI 会话已清空');
