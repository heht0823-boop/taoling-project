/**
 * API 路由入口文件
 * 统一管理所有 API 路由的注册和中间件配置
 */

const router = require('express').Router();
const { auth, adminOnly } = require('../middlewares/auth');

// 用户认证路由（无需登录）
router.use('/auth', require('./user/authRoutes'));

// 公开路由（部分需要可选认证）
router.use('/', require('./user/publicRoutes'));

// 用户路由（需要登录）
router.use('/user', auth, require('./user/profileRoutes'));
router.use('/user', auth, require('./user/favoriteRoutes'));
router.use('/user', auth, require('./user/downloadRoutes'));
router.use('/user', auth, require('./user/messageRoutes'));

// AI 助手路由（需要登录）
// 同时支持 /api/ai/* 和 /api/user/ai/* 两套路径，便于前端逐步切换
router.use('/ai', auth, require('./user/aiRoutes'));
router.use('/user/ai', auth, require('./user/aiRoutes'));

// 天气路由（无需登录）
router.use('/weather', require('./weatherRoutes'));

// 管理员路由（需要管理员权限）
router.use('/admin', adminOnly, require('./admin/dashboardRoutes'));
router.use('/admin', adminOnly, require('./admin/imageRoutes'));
router.use('/admin', adminOnly, require('./admin/categoryRoutes'));
router.use('/admin', adminOnly, require('./admin/tagRoutes'));
router.use('/admin', adminOnly, require('./admin/userRoutes'));
router.use('/admin', adminOnly, require('./admin/messageRoutes'));

module.exports = router;
