/**
 * Weather Service - 天气服务层
 * 封装高德天气 API 调用、24小时趋势模拟、气象预警及生活指数静态数据
 * 高德天气 API 文档: https://lbs.amap.com/api/webservice/guide/api/weatherinfo
 */

const axios = require("axios");
const env = require("../config/env");
const { WeatherLiveCache, WeatherForecastCache } = require("../models");

const AMAP_BASE_URL = "https://restapi.amap.com/v3/weather/weatherInfo";
const FALLBACK_WEATHERS = ["晴", "多云", "阴", "小雨", "阵雨"];
const CITY_META = {
  110000: { province: "北京", city: "北京市" },
  120000: { province: "天津", city: "天津市" },
  130100: { province: "河北", city: "石家庄市" },
  140100: { province: "山西", city: "太原市" },
  150100: { province: "内蒙古", city: "呼和浩特市" },
  210100: { province: "辽宁", city: "沈阳市" },
  220100: { province: "吉林", city: "长春市" },
  230100: { province: "黑龙江", city: "哈尔滨市" },
  310000: { province: "上海", city: "上海市" },
  320100: { province: "江苏", city: "南京市" },
  320500: { province: "江苏", city: "苏州市" },
  330100: { province: "浙江", city: "杭州市" },
  340100: { province: "安徽", city: "合肥市" },
  350100: { province: "福建", city: "福州市" },
  350200: { province: "福建", city: "厦门市" },
  360100: { province: "江西", city: "南昌市" },
  370100: { province: "山东", city: "济南市" },
  370200: { province: "山东", city: "青岛市" },
  410100: { province: "河南", city: "郑州市" },
  420100: { province: "湖北", city: "武汉市" },
  430100: { province: "湖南", city: "长沙市" },
  440100: { province: "广东", city: "广州市" },
  440300: { province: "广东", city: "深圳市" },
  450100: { province: "广西", city: "南宁市" },
  460100: { province: "海南", city: "海口市" },
  500000: { province: "重庆", city: "重庆市" },
  510100: { province: "四川", city: "成都市" },
  520100: { province: "贵州", city: "贵阳市" },
  530100: { province: "云南", city: "昆明市" },
  540100: { province: "西藏", city: "拉萨市" },
  610100: { province: "陕西", city: "西安市" },
  620100: { province: "甘肃", city: "兰州市" },
  630100: { province: "青海", city: "西宁市" },
  640100: { province: "宁夏", city: "银川市" },
  650100: { province: "新疆", city: "乌鲁木齐市" },
  810000: { province: "香港", city: "香港特别行政区" },
  820000: { province: "澳门", city: "澳门特别行政区" },
};

/**
 * 获取高德 Key（优先从环境变量读取）
 */
const getAmapKey = () => env.amap?.key || process.env.AMAP_KEY || "";

const getReportTime = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const getCityMeta = (city) => {
  return CITY_META[city] || { province: "全国", city: `城市 ${city}` };
};

const getCitySeed = (city) => {
  return String(city)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
};

const getFallbackWeather = (city, reason = "高德天气暂不可用，已启用本地兜底数据") => {
  const seed = getCitySeed(city);
  const meta = getCityMeta(city);
  const temperature = 18 + (seed % 20);

  return {
    temperature: String(temperature),
    weather: FALLBACK_WEATHERS[seed % FALLBACK_WEATHERS.length],
    winddirection: ["东", "南", "西", "北", "东北", "西南"][seed % 6],
    windpower: String((seed % 4) + 1),
    humidity: String(42 + (seed % 45)),
    adcode: String(city),
    province: meta.province,
    city: meta.city,
    reportTime: getReportTime(),
    source: "fallback",
    fallbackReason: reason,
  };
};

const getFallbackForecast = (city, reason = "高德预报暂不可用，已启用本地兜底数据") => {
  const live = getFallbackWeather(city, reason);
  const baseTemp = Number(live.temperature);
  const casts = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(Date.now() + index * 24 * 60 * 60 * 1000);
    const weather = FALLBACK_WEATHERS[(getCitySeed(city) + index) % FALLBACK_WEATHERS.length];
    const daytemp = baseTemp + ((index % 3) - 1);
    const nighttemp = daytemp - 6 - (index % 2);

    return {
      date: date.toISOString().slice(0, 10),
      week: String(date.getDay() === 0 ? 7 : date.getDay()),
      dayweather: weather,
      nightweather: weather === "晴" ? "多云" : weather,
      daytemp: String(daytemp),
      nighttemp: String(nighttemp),
      daywind: live.winddirection,
      nightwind: live.winddirection,
      daypower: live.windpower,
      nightpower: live.windpower,
    };
  });

  return {
    city: live.city,
    adcode: String(city),
    province: live.province,
    reportTime: live.reportTime,
    casts,
    source: "fallback",
    fallbackReason: reason,
  };
};

const getAmapFailureReason = (errorOrData) => {
  if (errorOrData?.info) return `高德天气返回：${errorOrData.info}`;
  if (errorOrData?.message) return `高德天气请求失败：${errorOrData.message}`;
  return "高德天气暂不可用，已启用本地兜底数据";
};

const normalizeForecastDays = (forecast, city) => {
  if (forecast.casts.length >= 7) return forecast;

  const fallback = getFallbackForecast(city, "高德预报天数不足，已补齐 7 天数据");
  return {
    ...forecast,
    casts: [...forecast.casts, ...fallback.casts.slice(forecast.casts.length)].slice(0, 7),
  };
};

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60 * 1000);

const formatDateTime = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (item) => String(item).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const parseJsonValue = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
};

const logWeatherCacheError = (action, error) => {
  const message = error?.parent?.sqlMessage || error?.original?.sqlMessage || error?.message || "未知错误";
  console.warn(`[weather-cache] ${action} 失败：${message}`);
};

const isCacheFresh = (record, ttlMinutes) => {
  if (!record?.fetched_at) return false;
  return addMinutes(new Date(record.fetched_at), ttlMinutes).getTime() > Date.now();
};

const stripInternalWeatherFields = (data) => {
  if (!data) return data;
  const { rawPayload, ...publicData } = data;
  return publicData;
};

const getCacheMeta = (record, ttlMinutes, cacheStatus) => {
  const fetchedAt = record?.fetched_at ? new Date(record.fetched_at) : null;

  return {
    cacheStatus,
    cachedAt: formatDateTime(fetchedAt),
    cacheExpiresAt: fetchedAt ? formatDateTime(addMinutes(fetchedAt, ttlMinutes)) : "",
  };
};

const buildLiveWeatherFromCache = (record, cacheStatus, extra = {}) => ({
  temperature: record.temperature,
  weather: record.weather,
  winddirection: record.winddirection,
  windpower: record.windpower,
  humidity: record.humidity,
  adcode: record.adcode,
  province: record.province,
  city: record.city,
  reportTime: formatDateTime(record.report_time),
  source: record.source,
  ...getCacheMeta(record, env.amap.liveCacheMinutes, cacheStatus),
  ...extra,
});

const buildForecastFromCache = (record, cacheStatus, extra = {}) => ({
  city: record.city,
  adcode: record.adcode,
  province: record.province,
  reportTime: formatDateTime(record.report_time),
  casts: parseJsonValue(record.casts, []),
  source: record.source,
  ...getCacheMeta(record, env.amap.forecastCacheMinutes, cacheStatus),
  ...extra,
});

const findLiveCache = async (adcode) => {
  try {
    return await WeatherLiveCache.findOne({ where: { adcode } });
  } catch (error) {
    logWeatherCacheError(`读取实况缓存 ${adcode}`, error);
    return null;
  }
};

const findForecastCache = async (adcode) => {
  try {
    return await WeatherForecastCache.findOne({ where: { adcode } });
  } catch (error) {
    logWeatherCacheError(`读取预报缓存 ${adcode}`, error);
    return null;
  }
};

const upsertLiveWeatherCache = async (weather) => {
  if (weather.source !== "amap") return null;

  const payload = {
    adcode: weather.adcode,
    province: weather.province,
    city: weather.city,
    weather: weather.weather,
    temperature: weather.temperature,
    winddirection: weather.winddirection,
    windpower: weather.windpower,
    humidity: weather.humidity,
    report_time: weather.reportTime || null,
    source: weather.source,
    raw_payload: weather.rawPayload || null,
    fetched_at: new Date(),
  };

  try {
    const cache = await WeatherLiveCache.findOne({ where: { adcode: weather.adcode } });
    if (cache) {
      await cache.update(payload);
      return cache.reload();
    }

    return await WeatherLiveCache.create(payload);
  } catch (error) {
    logWeatherCacheError(`写入实况缓存 ${weather.adcode}`, error);
    return null;
  }
};

const upsertForecastCache = async (forecast) => {
  if (forecast.source !== "amap") return null;

  const payload = {
    adcode: forecast.adcode,
    province: forecast.province,
    city: forecast.city,
    report_time: forecast.reportTime || null,
    casts: forecast.casts,
    source: forecast.source,
    raw_payload: forecast.rawPayload || null,
    fetched_at: new Date(),
  };

  try {
    const cache = await WeatherForecastCache.findOne({ where: { adcode: forecast.adcode } });
    if (cache) {
      await cache.update(payload);
      return cache.reload();
    }

    return await WeatherForecastCache.create(payload);
  } catch (error) {
    logWeatherCacheError(`写入预报缓存 ${forecast.adcode}`, error);
    return null;
  }
};

/**
 * 获取实况天气
 * @param {string} city - 城市编码（adcode，如 110000）
 * @returns {Promise<Object>} 实况天气数据
 */
const fetchLiveWeatherFromAmap = async (city) => {
  const amapKey = getAmapKey();
  if (!amapKey) {
    return getFallbackWeather(city, "未配置 AMAP_KEY，已启用本地兜底数据");
  }

  try {
    const response = await axios.get(AMAP_BASE_URL, {
      params: {
        key: amapKey,
        city,
        extensions: "base",
        output: "JSON",
      },
      timeout: 5000,
    });

    const { data } = response;

    if (data.status !== "1") {
      return getFallbackWeather(city, getAmapFailureReason(data));
    }

    if (!data.lives || data.lives.length === 0) {
      return getFallbackWeather(city, "高德未返回该城市实况天气，已启用本地兜底数据");
    }

    return {
      temperature: data.lives[0].temperature,
      weather: data.lives[0].weather,
      winddirection: data.lives[0].winddirection,
      windpower: data.lives[0].windpower,
      humidity: data.lives[0].humidity,
      adcode: data.lives[0].adcode,
      province: data.lives[0].province,
      city: data.lives[0].city,
      reportTime: data.lives[0].reporttime,
      source: "amap",
      rawPayload: data,
    };
  } catch (error) {
    return getFallbackWeather(city, getAmapFailureReason(error));
  }
};

const fetchLiveWeather = async (city, options = {}) => {
  const adcode = String(city);
  const forceRefresh = Boolean(options.forceRefresh);
  const cache = await findLiveCache(adcode);

  if (!forceRefresh && isCacheFresh(cache, env.amap.liveCacheMinutes)) {
    return buildLiveWeatherFromCache(cache, "cache");
  }

  const freshWeather = await fetchLiveWeatherFromAmap(adcode);

  if (freshWeather.source !== "amap") {
    if (cache) {
      return buildLiveWeatherFromCache(cache, "stale", {
        fallbackReason: freshWeather.fallbackReason,
      });
    }

    return {
      ...stripInternalWeatherFields(freshWeather),
      cacheStatus: "fallback",
      cachedAt: "",
      cacheExpiresAt: "",
    };
  }

  const updatedCache = await upsertLiveWeatherCache(freshWeather);
  return updatedCache
    ? buildLiveWeatherFromCache(updatedCache, "refreshed")
    : { ...stripInternalWeatherFields(freshWeather), cacheStatus: "refreshed" };
};

/**
 * 批量获取多个城市的实况天气（用于热力图和城市卡片）
 * @param {string[]} cities - 城市编码数组
 * @returns {Promise<Object[]>} 多个城市的实况天气数据列表
 */
const fetchBatchLiveWeather = async (cities, options = {}) => {
  const results = [];
  const batchSize = 6;

  for (let index = 0; index < cities.length; index += batchSize) {
    const cityBatch = cities.slice(index, index + batchSize);
    const settled = await Promise.allSettled(cityBatch.map((city) => fetchLiveWeather(city, options)));

    settled.forEach((result, cityIndex) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
        return;
      }

      const city = cityBatch[cityIndex];
      console.warn(`[weather-cache] 批量实况 ${city} 获取失败：${result.reason?.message || "未知错误"}`);
      results.push(getFallbackWeather(city, "该城市天气获取失败，已启用本地兜底数据"));
    });
  }

  return results;
};

/**
 * 获取未来天气预报
 * @param {string} city - 城市编码（adcode，如 110000）
 * @returns {Promise<Object>} 预报天气数据
 */
const fetchForecastWeatherFromAmap = async (city) => {
  const amapKey = getAmapKey();
  if (!amapKey) {
    return getFallbackForecast(city, "未配置 AMAP_KEY，已启用本地兜底数据");
  }

  try {
    const response = await axios.get(AMAP_BASE_URL, {
      params: {
        key: amapKey,
        city,
        extensions: "all",
        output: "JSON",
      },
      timeout: 5000,
    });

    const { data } = response;

    if (data.status !== "1") {
      return getFallbackForecast(city, getAmapFailureReason(data));
    }

    if (!data.forecasts || data.forecasts.length === 0) {
      return getFallbackForecast(city, "高德未返回该城市预报天气，已启用本地兜底数据");
    }

    const forecast = data.forecasts[0];

    return normalizeForecastDays(
      {
        city: forecast.city,
        adcode: forecast.adcode,
        province: forecast.province,
        reportTime: forecast.reporttime,
        casts: forecast.casts.map((cast) => ({
          date: cast.date,
          week: cast.week,
          dayweather: cast.dayweather,
          nightweather: cast.nightweather,
          daytemp: cast.daytemp,
          nighttemp: cast.nighttemp,
          daywind: cast.daywind,
          nightwind: cast.nightwind,
          daypower: cast.daypower,
          nightpower: cast.nightpower,
        })),
        source: "amap",
        rawPayload: data,
      },
      city,
    );
  } catch (error) {
    return getFallbackForecast(city, getAmapFailureReason(error));
  }
};

const fetchForecastWeather = async (city, options = {}) => {
  const adcode = String(city);
  const forceRefresh = Boolean(options.forceRefresh);
  const cache = await findForecastCache(adcode);

  if (!forceRefresh && isCacheFresh(cache, env.amap.forecastCacheMinutes)) {
    return buildForecastFromCache(cache, "cache");
  }

  const freshForecast = await fetchForecastWeatherFromAmap(adcode);

  if (freshForecast.source !== "amap") {
    if (cache) {
      return buildForecastFromCache(cache, "stale", {
        fallbackReason: freshForecast.fallbackReason,
      });
    }

    return {
      ...stripInternalWeatherFields(freshForecast),
      cacheStatus: "fallback",
      cachedAt: "",
      cacheExpiresAt: "",
    };
  }

  const updatedCache = await upsertForecastCache(freshForecast);
  return updatedCache
    ? buildForecastFromCache(updatedCache, "refreshed")
    : { ...stripInternalWeatherFields(freshForecast), cacheStatus: "refreshed" };
};

/**
 * 模拟生成 24 小时逐小时温度趋势
 * 高德天气 API 不提供原生小时级数据，此接口基于当日实况温度 + 预报早晚温度做插值模拟
 * @param {string} city - 城市编码
 * @returns {Promise<Object[]>} 24 小时趋势数据
 */
const fetchHourlyTrend = async (city, options = {}) => {
  // 同时获取实况和预报数据作为插值基础
  const [liveResult, forecastResult] = await Promise.allSettled([
    fetchLiveWeather(city, options),
    fetchForecastWeather(city, options),
  ]);

  // 默认温度基准
  let baseTemp = 25;
  let baseWeather = "晴";
  let dayTempMax = 30;
  let nightTempMin = 20;

  if (liveResult.status === "fulfilled") {
    baseTemp = Number(liveResult.value.temperature);
    baseWeather = liveResult.value.weather;
  }

  if (
    forecastResult.status === "fulfilled" &&
    forecastResult.value.casts.length > 0
  ) {
    dayTempMax = Number(forecastResult.value.casts[0].daytemp);
    nightTempMin = Number(forecastResult.value.casts[0].nighttemp);
  }

  // 生成 24 小时数据（当前时间起）
  const now = new Date();
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = time.getHours();

    // 使用正弦曲线模拟温度日变化
    // 最低温在凌晨 4-6 点，最高温在下午 14-16 点
    const cycleHour = (hour - 14 + 24) % 24;
    const ratio = Math.cos((cycleHour / 24) * 2 * Math.PI);
    const simulatedTemp = Math.round(
      (dayTempMax + nightTempMin) / 2 +
        ((dayTempMax - nightTempMin) / 2) * ratio,
    );

    hours.push({
      time: `${String(hour).padStart(2, "0")}:00`,
      temperature: simulatedTemp,
      weather:
        i === 0
          ? baseWeather
          : simulatedTemp > (dayTempMax + nightTempMin) / 2
            ? "晴"
            : "多云",
    });
  }

  return hours;
};

/**
 * 获取气象预警（静态数据）
 * 高德天气 API 不直接提供全国气象预警数据，当前返回静态示例数据
 * @param {string} city - 城市编码
 * @returns {Object[]} 预警信息列表
 */
const getStaticWarnings = (city) => {
  const warningMap = {
    110000: [
      {
        level: "蓝色",
        type: "大风",
        title: "北京市发布大风蓝色预警",
        content:
          "预计未来 24 小时北京市将有 4-5 级偏北风，阵风可达 7 级，请注意防范。",
        time: "2025-06-09 10:00",
      },
    ],
    310000: [
      {
        level: "黄色",
        type: "雷电",
        title: "上海市发布雷电黄色预警",
        content:
          "预计未来 6 小时内上海市大部地区将发生雷电活动，并伴有短时强降水，请注意防范。",
        time: "2025-06-09 09:30",
      },
    ],
    440100: [
      {
        level: "蓝色",
        type: "高温",
        title: "广州市发布高温蓝色预警",
        content:
          "预计未来 48 小时广州市最高气温将达 35°C 以上，请注意防暑降温。",
        time: "2025-06-09 08:00",
      },
    ],
    320500: [
      {
        level: "蓝色",
        type: "大风",
        title: "苏州市发布大风蓝色预警",
        content: "预计未来 24 小时苏州市将有 4-5 级偏东风，请注意防范。",
        time: "2025-06-09 11:00",
      },
    ],
    330100: [
      {
        level: "蓝色",
        type: "暴雨",
        title: "杭州市发布暴雨蓝色预警",
        content:
          "预计未来 12 小时杭州市将有中到大雨，部分地区暴雨，请注意防范。",
        time: "2025-06-09 07:00",
      },
    ],
  };

  return warningMap[city] || [];
};

/**
 * 获取所有预警城市列表
 * @returns {Object[]} 预警城市及预警信息
 */
const getAllWarnings = () => {
  return [
    { city: "北京市", adcode: "110000", warnings: getStaticWarnings("110000") },
    { city: "上海市", adcode: "310000", warnings: getStaticWarnings("310000") },
    { city: "广州市", adcode: "440100", warnings: getStaticWarnings("440100") },
    { city: "苏州市", adcode: "320500", warnings: getStaticWarnings("320500") },
    { city: "杭州市", adcode: "330100", warnings: getStaticWarnings("330100") },
  ].filter((item) => item.warnings.length > 0);
};

/**
 * 获取生活指数小贴士（静态数据）
 * 高德天气 API 不包含生活指数数据，当前返回静态示例数据
 * @param {string} city - 城市编码
 * @returns {Object} 生活指数数据
 */
const getLifeTips = (city) => {
  const tipsMap = {
    110000: {
      uv: { level: "中等", advice: "涂擦防晒护肤品，避免长时间日晒" },
      dressing: { level: "舒适", advice: "建议穿薄外套或牛仔裤等服装" },
      carWash: { level: "适宜", advice: "天气晴朗，适合洗车" },
      sport: { level: "较适宜", advice: "天气较好，推荐进行户外运动" },
      travel: { level: "适宜", advice: "温度适宜，适合外出游玩" },
      coldRisk: { level: "低发", advice: "感冒几率较低，无需过分担心" },
    },
    310000: {
      uv: { level: "弱", advice: "无需特别防护" },
      dressing: { level: "舒适", advice: "建议穿薄外套或牛仔裤等服装" },
      carWash: { level: "不宜", advice: "未来有降雨，不适合洗车" },
      sport: { level: "不宜", advice: "有降水天气，建议室内运动" },
      travel: { level: "一般", advice: "有降水，出行请携带雨具" },
      coldRisk: { level: "低发", advice: "感冒几率较低，无需过分担心" },
    },
    440100: {
      uv: { level: "很强", advice: "尽量避免外出，外出时做好防晒" },
      dressing: { level: "炎热", advice: "建议穿短衫短裤等清凉夏季服装" },
      carWash: { level: "适宜", advice: "天气炎热，适合洗车" },
      sport: { level: "较适宜", advice: "天气较好，推荐进行户外运动" },
      travel: { level: "适宜", advice: "温度适宜，适合外出游玩" },
      coldRisk: { level: "低发", advice: "感冒几率较低，无需过分担心" },
    },
  };

  return tipsMap[city] || tipsMap["110000"];
};

module.exports = {
  fetchLiveWeather,
  fetchBatchLiveWeather,
  fetchForecastWeather,
  fetchHourlyTrend,
  getStaticWarnings,
  getAllWarnings,
  getLifeTips,
};
