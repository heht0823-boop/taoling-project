/**
 * Auth Middleware - 认证中间件
 * 提供用户认证、可选认证和管理员权限校验功能
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const { unauthorized, forbidden } = require('../utils/httpError');
const { readAuthCookie } = require('../utils/authCookie');

/**
 * 从 HttpOnly Cookie 或请求头中读取 JWT token
 * @param {Object} req - Express 请求对象
 * @returns {string|null} JWT token 或 null
 */
const readToken = (req) => {
  const cookieToken = readAuthCookie(req);
  if (cookieToken) return cookieToken;

  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7);
};

/**
 * 从 token 解析并加载用户信息
 * @param {string} token - JWT token
 * @returns {Promise<User|null>} 用户对象或 null
 */
const loadUserFromToken = async (token) => {
  const payload = jwt.verify(token, env.jwt.secret);
  const user = await User.findOne({
    where: { id: payload.id, deleted_at: null },
    attributes: ['id', 'username', 'email', 'role', 'status', 'avatar_url'],
  });
  if (!user || user.status !== 'normal') return null;
  return user;
};

/**
 * 可选认证中间件
 * 用于公开接口：有 token 就解析用户信息，没有 token 也允许访问
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (token) req.user = await loadUserFromToken(token);
    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};

/**
 * 强制认证中间件
 * 用于收藏、下载、AI、我的页面等必须登录的接口
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
const auth = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) throw unauthorized();
    const user = await loadUserFromToken(token);
    if (!user) throw unauthorized('登录已失效或账号不可用，请重新登录');
    req.user = user;
    return next();
  } catch (error) {
    return next(unauthorized('登录已失效或账号不可用，请重新登录'));
  }
};

/**
 * 管理员权限中间件
 * 用于所有管理端接口，必须保证用户存在且 role = admin
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
const adminOnly = async (req, res, next) => {
  try {
    const token = readToken(req);
    if (!token) throw unauthorized();
    const user = await loadUserFromToken(token);
    if (!user) throw unauthorized('登录已失效或账号不可用，请重新登录');
    if (user.role !== 'admin') throw forbidden('只有管理员可以访问管理端接口');
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { optionalAuth, auth, adminOnly };
