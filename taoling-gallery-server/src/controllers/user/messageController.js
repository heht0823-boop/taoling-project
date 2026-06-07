/**
 * Message Controller - 用户留言控制器
 * 处理留言列表、创建等请求
 */

const { created, success } = require('../../utils/response');
const service = require('../../services/user/messageService');

/**
 * 获取留言板列表（公开）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.listBoard = async (req, res) => success(res, await service.listBoard(req.query));

/**
 * 获取我的留言列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.listMine = async (req, res) => success(res, await service.listMine(req.user.id, req.query));

/**
 * 创建留言
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.create = async (req, res) => created(res, await service.create(req.user, req.body, req), '留言提交成功，审核通过后展示');
