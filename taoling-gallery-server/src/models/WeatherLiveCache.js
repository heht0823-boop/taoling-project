/**
 * WeatherLiveCache 模型 - 天气实况缓存
 * 缓存高德实况天气接口返回的数据，降低重复请求高德 API 的频率
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeatherLiveCache = sequelize.define('WeatherLiveCache', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  adcode: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  province: { type: DataTypes.STRING(50), allowNull: true },
  city: { type: DataTypes.STRING(50), allowNull: false },
  weather: { type: DataTypes.STRING(50), allowNull: false },
  temperature: { type: DataTypes.STRING(20), allowNull: false },
  winddirection: { type: DataTypes.STRING(50), allowNull: true },
  windpower: { type: DataTypes.STRING(50), allowNull: true },
  humidity: { type: DataTypes.STRING(20), allowNull: true },
  report_time: { type: DataTypes.DATE, allowNull: true },
  source: { type: DataTypes.ENUM('amap', 'fallback'), allowNull: false, defaultValue: 'amap' },
  raw_payload: { type: DataTypes.JSON, allowNull: true },
  fetched_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'weather_live_cache',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = WeatherLiveCache;
