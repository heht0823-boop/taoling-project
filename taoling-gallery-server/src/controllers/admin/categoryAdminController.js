/**
 * Category Admin Controller - 分类管理控制器（管理员端）
 * 处理分类列表、创建、更新和删除操作
 */

const { success, created } = require('../../utils/response');
const service = require('../../services/admin/categoryAdminService');

/**
 * 获取分类列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.list = async (req, res) => success(res, await service.list(req.query));

/**
 * 创建分类
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.create = async (req, res) => created(res, await service.create(req.user, req.body, req), '分类创建成功');

/**
 * 更新分类
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.update = async (req, res) => success(res, await service.update(req.user, req.params.id, req.body, req), '分类更新成功');

/**
 * 删除分类
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.remove = async (req, res) => success(res, await service.remove(req.user, req.params.id, req), '分类删除成功');
