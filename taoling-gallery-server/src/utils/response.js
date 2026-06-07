/**
 * Response Utils - 响应工具函数
 * 提供统一的 API 响应格式化功能
 */

/**
 * 成功响应
 * @param {Object} res - Express 响应对象
 * @param {Object} data - 响应数据
 * @param {string} message - 响应消息（默认'success'）
 * @param {number} statusCode - HTTP 状态码（默认200）
 * @returns {Object} Express 响应
 */
const success = (res, data = {}, message = 'success', statusCode = 200) => {
  return res.status(statusCode).json({ code: statusCode, message, data });
};

/**
 * 创建成功响应（HTTP 201）
 * @param {Object} res - Express 响应对象
 * @param {Object} data - 响应数据
 * @param {string} message - 响应消息（默认'创建成功'）
 * @returns {Object} Express 响应
 */
const created = (res, data = {}, message = '创建成功') => success(res, data, message, 201);

module.exports = { success, created };
