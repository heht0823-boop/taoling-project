/**
 * Dashboard Controller - 仪表盘控制器（管理员端）
 * 处理系统统计和操作日志请求
 */

const { success } = require('../../utils/response');
const service = require('../../services/admin/dashboardService');

/**
 * 获取系统统计数据
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.stats = async (req, res) => success(res, await service.stats());

/**
 * 获取操作日志列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.logs = async (req, res) => success(res, await service.logs(req.query));
