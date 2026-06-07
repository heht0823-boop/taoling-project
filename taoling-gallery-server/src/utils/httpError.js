/**
 * HTTP Error Utils - HTTP 错误工具函数
 * 提供统一的自定义错误类和常见 HTTP 错误创建函数
 */

/**
 * 自定义 HTTP 错误类
 * @class
 * @extends Error
 */
class HttpError extends Error {
  /**
   * 构造函数
   * @param {number} statusCode - HTTP 状态码
   * @param {string} message - 错误消息
   * @param {Object} details - 错误详情（可选）
   */
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * 创建 400 Bad Request 错误
 * @param {string} message - 错误消息
 * @param {Object} details - 错误详情
 * @returns {HttpError} HttpError 实例
 */
const badRequest = (message, details) => new HttpError(400, message, details);

/**
 * 创建 401 Unauthorized 错误
 * @param {string} message - 错误消息（默认'请先登录后再继续操作'）
 * @returns {HttpError} HttpError 实例
 */
const unauthorized = (message = '请先登录后再继续操作') => new HttpError(401, message);

/**
 * 创建 403 Forbidden 错误
 * @param {string} message - 错误消息（默认'当前账号没有权限执行该操作'）
 * @returns {HttpError} HttpError 实例
 */
const forbidden = (message = '当前账号没有权限执行该操作') => new HttpError(403, message);

/**
 * 创建 404 Not Found 错误
 * @param {string} message - 错误消息（默认'请求的数据不存在'）
 * @returns {HttpError} HttpError 实例
 */
const notFound = (message = '请求的数据不存在') => new HttpError(404, message);

/**
 * 创建 409 Conflict 错误
 * @param {string} message - 错误消息（默认'数据已存在，请勿重复提交'）
 * @returns {HttpError} HttpError 实例
 */
const conflict = (message = '数据已存在，请勿重复提交') => new HttpError(409, message);

module.exports = { HttpError, badRequest, unauthorized, forbidden, notFound, conflict };
