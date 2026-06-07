/**
 * User Admin Controller - 用户管理控制器（管理员端）
 * 处理用户列表、详情、状态更新和删除操作
 */

const { success } = require('../../utils/response');
const service = require('../../services/admin/userAdminService');

/**
 * 获取用户列表（分页）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.list = async (req, res) => success(res, await service.list(req.query));

/**
 * 获取用户详情
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.detail = async (req, res) => success(res, await service.detail(req.params.id));

/**
 * 更新用户状态
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.status = async (req, res) => success(res, await service.updateStatus(req.user, req.params.id, req.body.status, req), '用户状态更新成功');

/**
 * 删除用户
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.remove = async (req, res) => success(res, await service.remove(req.user, req.params.id, req), '用户删除成功');
