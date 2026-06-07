/**
 * 用户认证路由配置
 * 处理用户注册、登录、登出等认证相关请求
 */

const router = require('express').Router();
const asyncHandler = require('../../middlewares/asyncHandler');
const { auth, optionalAuth } = require('../../middlewares/auth');
const controller = require('../../controllers/user/authController');

// 注册（无需登录）
router.post('/register', asyncHandler(controller.register));

// 登录（无需登录）
router.post('/login', asyncHandler(controller.login));

// 登出（可选登录）：即使 Cookie 已过期或无效，也允许后端清除浏览器 Cookie
router.post('/logout', optionalAuth, asyncHandler(controller.logout));

// 获取当前用户信息（需要登录）
router.get('/me', auth, asyncHandler(controller.me));

module.exports = router;
