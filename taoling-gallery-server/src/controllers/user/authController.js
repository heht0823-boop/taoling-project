/**
 * Auth Controller - 用户认证控制器
 * 处理用户注册、登录、登出等认证相关请求
 */

const { success, created } = require('../../utils/response');
const service = require('../../services/user/authService');
const { clearAuthCookie, setAuthCookie } = require('../../utils/authCookie');

const sendAuthResult = (res, result, message) => {
  const { token, ...data } = result;
  setAuthCookie(res, token);
  return success(res, data, message);
};

/**
 * 用户注册
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.register = async (req, res) => {
  const { token, ...data } = await service.register(req.body, req);
  setAuthCookie(res, token);
  return created(res, data, '注册成功');
};

/**
 * 用户登录
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.login = async (req, res) => sendAuthResult(res, await service.login(req.body, req), '登录成功');

/**
 * 用户退出登录
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.logout = async (req, res) => {
  clearAuthCookie(res);
  return success(res, await service.logout(req.user, req), '退出登录成功');
};

/**
 * 获取当前登录用户信息
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.me = async (req, res) => success(res, await service.getUserWithStats(req.user.id));
