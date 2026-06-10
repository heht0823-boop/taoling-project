/**
 * Weather Controller - 天气控制层
 * 处理天气相关的 HTTP 请求，统一使用 success 工具返回三段式响应
 */

const { success } = require("../utils/response");
const weatherService = require("../services/weatherService");

/**
 * GET /api/weather/live
 * 获取指定城市的实况天气
 * @query {string} city - 城市编码（adcode），如 110000
 */
const getLiveWeather = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res
      .status(400)
      .json({
        code: 400,
        message: "缺少 city 参数（城市编码 adcode）",
        data: {},
      });
  }

  const data = await weatherService.fetchLiveWeather(city);
  success(res, data, "获取实况天气成功");
};

/**
 * GET /api/weather/live/batch
 * 批量获取多个城市的实况天气（用于城市卡片展示和热力图）
 * @query {string} cities - 城市编码列表，用逗号分隔，如 110000,310000,440100
 */
const getBatchLiveWeather = async (req, res) => {
  const { cities } = req.query;

  if (!cities) {
    return res
      .status(400)
      .json({
        code: 400,
        message: "缺少 cities 参数（城市编码列表，逗号分隔）",
        data: {},
      });
  }

  const cityList = cities
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  if (cityList.length === 0) {
    return res
      .status(400)
      .json({
        code: 400,
        message: "cities 参数格式错误，请提供有效的城市编码",
        data: {},
      });
  }

  const data = await weatherService.fetchBatchLiveWeather(cityList);
  success(res, data, "批量获取实况天气成功");
};

/**
 * GET /api/weather/forecast
 * 获取指定城市的天气预报（默认 7 天）
 * @query {string} city - 城市编码（adcode），如 110000
 */
const getForecastWeather = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res
      .status(400)
      .json({
        code: 400,
        message: "缺少 city 参数（城市编码 adcode）",
        data: {},
      });
  }

  const data = await weatherService.fetchForecastWeather(city);
  success(res, data, "获取天气预报成功");
};

/**
 * GET /api/weather/24h
 * 获取指定城市的 24 小时温度趋势（基于实况+预报插值模拟）
 * @query {string} city - 城市编码（adcode），如 110000
 */
const getHourlyTrend = async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res
      .status(400)
      .json({
        code: 400,
        message: "缺少 city 参数（城市编码 adcode）",
        data: {},
      });
  }

  const data = await weatherService.fetchHourlyTrend(city);
  success(res, data, "获取 24 小时趋势成功");
};

/**
 * GET /api/weather/warnings
 * 获取气象预警信息（静态示例数据）
 * @query {string} [city] - 可选，城市编码，不传则返回所有预警
 */
const getWarnings = (req, res) => {
  const { city } = req.query;

  if (city) {
    const data = weatherService.getStaticWarnings(city);
    return success(res, data, "获取气象预警成功");
  }

  const data = weatherService.getAllWarnings();
  success(res, data, "获取全部气象预警成功");
};

/**
 * GET /api/weather/tips
 * 获取生活指数小贴士（静态示例数据）
 * @query {string} city - 城市编码（adcode），如 110000
 */
const getLifeTips = (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res
      .status(400)
      .json({
        code: 400,
        message: "缺少 city 参数（城市编码 adcode）",
        data: {},
      });
  }

  const data = weatherService.getLifeTips(city);
  success(res, data, "获取生活指数成功");
};

module.exports = {
  getLiveWeather,
  getBatchLiveWeather,
  getForecastWeather,
  getHourlyTrend,
  getWarnings,
  getLifeTips,
};
