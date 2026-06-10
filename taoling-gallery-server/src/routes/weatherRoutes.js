/**
 * Weather Routes - 天气模块路由
 * 定义所有天气相关接口的路由
 * 前缀: /api/weather
 */

const router = require('express').Router();
const asyncHandler = require('../middlewares/asyncHandler');
const weatherController = require('../controllers/weatherController');

// 实况天气
router.get('/live', asyncHandler(weatherController.getLiveWeather));

// 批量实况天气（用于城市卡片 + 热力图）
router.get('/live/batch', asyncHandler(weatherController.getBatchLiveWeather));

// 天气预报（7 天）
router.get('/forecast', asyncHandler(weatherController.getForecastWeather));

// 24 小时温度趋势（插值模拟）
router.get('/24h', asyncHandler(weatherController.getHourlyTrend));

// 气象预警（静态数据）
router.get('/warnings', weatherController.getWarnings);

// 生活指数小贴士（静态数据）
router.get('/tips', weatherController.getLifeTips);

module.exports = router;
