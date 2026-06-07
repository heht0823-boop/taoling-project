/**
 * Image Admin Controller - 图片管理控制器（管理员端）
 * 处理图片上传、创建、更新、状态管理和删除操作
 */

const { success, created } = require('../../utils/response');
const service = require('../../services/admin/imageAdminService');

/**
 * 上传图片文件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.uploadFile = async (req, res) => created(res, await service.uploadedFile(req.file), '图片上传成功');

/**
 * 创建图片记录
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.create = async (req, res) => created(res, await service.createImage(req.user, req.body, req), '图片创建成功');

/**
 * 获取图片列表（分页）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.list = async (req, res) => success(res, await service.listImages(req.query));

/**
 * 获取图片详情
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.detail = async (req, res) => success(res, await service.getImage(req.params.id));

/**
 * 更新图片信息
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.update = async (req, res) => success(res, await service.updateImage(req.user, req.params.id, req.body, req), '图片更新成功');

/**
 * 更新图片状态
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.status = async (req, res) => success(res, await service.changeStatus(req.user, req.params.id, req.body.status, req), '图片状态更新成功');

/**
 * 删除图片
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.remove = async (req, res) => success(res, await service.deleteImage(req.user, req.params.id, req), '图片删除成功');

/**
 * 恢复已删除图片
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.restore = async (req, res) => success(res, await service.restoreImage(req.user, req.params.id, req.body.status, req), '图片恢复成功');
