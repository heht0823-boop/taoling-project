/**
 * Message Admin Controller - 留言管理控制器（管理员端）
 * 处理留言列表、详情、回复和屏蔽操作
 */

const { created, success } = require('../../utils/response');
const service = require('../../services/admin/messageAdminService');

/**
 * 获取留言列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.list = async (req, res) => success(res, await service.list(req.query));

/**
 * 获取留言详情
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.detail = async (req, res) => success(res, await service.detail(req.params.id));

/**
 * 回复留言
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.reply = async (req, res) => created(res, await service.reply(req.user, req.params.id, req.body, req), '回复成功');

/**
 * 屏蔽留言
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.block = async (req, res) => success(res, await service.block(req.user, req.params.id, req), '留言已屏蔽');
