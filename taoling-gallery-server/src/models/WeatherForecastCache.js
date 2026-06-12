/**
 * WeatherForecastCache 模型 - 天气预报缓存
 * 缓存高德天气预报接口返回的数据，casts 使用 JSON 保存预报日列表
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeatherForecastCache = sequelize.define('WeatherForecastCache', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  adcode: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  province: { type: DataTypes.STRING(50), allowNull: true },
  city: { type: DataTypes.STRING(50), allowNull: false },
  report_time: { type: DataTypes.DATE, allowNull: true },
  casts: { type: DataTypes.JSON, allowNull: false },
  source: { type: DataTypes.ENUM('amap', 'fallback'), allowNull: false, defaultValue: 'amap' },
  raw_payload: { type: DataTypes.JSON, allowNull: true },
  fetched_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'weather_forecast_cache',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = WeatherForecastCache;
