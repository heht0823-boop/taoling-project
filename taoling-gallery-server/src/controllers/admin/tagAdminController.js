/**
 * Tag Admin Controller - 标签管理控制器（管理员端）
 * 处理标签列表、创建、更新和删除操作
 */

const { success, created } = require('../../utils/response');
const service = require('../../services/admin/tagAdminService');

/**
 * 获取标签列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.list = async (req, res) => success(res, await service.list(req.query));

/**
 * 创建标签
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.create = async (req, res) => created(res, await service.create(req.user, req.body, req), '标签创建成功');

/**
 * 更新标签
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.update = async (req, res) => success(res, await service.update(req.user, req.params.id, req.body, req), '标签更新成功');

/**
 * 删除标签
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.remove = async (req, res) => success(res, await service.remove(req.user, req.params.id, req), '标签删除成功');
