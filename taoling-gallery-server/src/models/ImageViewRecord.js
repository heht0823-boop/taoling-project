/**
 * ImageViewRecord 模型 - 图片浏览记录模型
 * 记录图片的浏览历史，支持匿名用户和登录用户
 * 
 * @property {number} id - 记录ID（主键）
 * @property {number} user_id - 用户ID（关联 users.id，可选，匿名浏览时为null）
 * @property {number} image_id - 图片ID（关联 images.id）
 * @property {string} visitor_id - 访客标识（用于匿名用户去重）
 * @property {string} image_title - 浏览时的图片标题（快照）
 * @property {string} ip_address - 访问者IP地址（可选）
 * @property {string} user_agent - 访问者浏览器信息（可选）
 * @property {Date} created_at - 创建时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImageViewRecord = sequelize.define('ImageViewRecord', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  image_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  visitor_id: { type: DataTypes.STRING(100), allowNull: true },
  image_title: { type: DataTypes.STRING(200), allowNull: false },
  ip_address: { type: DataTypes.STRING(64), allowNull: true },
  user_agent: { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'image_view_records',
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = ImageViewRecord;
