/**
 * Image 模型 - 图片模型
 * 存储图片的基本信息和统计数据
 * 
 * @property {number} id - 图片ID（主键）
 * @property {string} title - 图片标题
 * @property {string} description - 图片描述（可选）
 * @property {string} image_url - 图片URL
 * @property {string} thumbnail_url - 缩略图URL（可选）
 * @property {number} category_id - 分类ID（关联 categories.id，可选）
 * @property {string} aspect_ratio - 宽高比（可选）
 * @property {string} status - 状态：public（公开）、private（私有）、draft（草稿）、deleted（已删除）
 * @property {number} display_weight - 展示权重（用于排序）
 * @property {number} view_count - 浏览次数
 * @property {number} download_count - 下载次数
 * @property {number} favorite_count - 收藏次数
 * @property {Date} deleted_at - 删除时间（软删除标记）
 * @property {Date} created_at - 创建时间
 * @property {Date} updated_at - 更新时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Image = sequelize.define('Image', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  image_url: { type: DataTypes.STRING(500), allowNull: false },
  thumbnail_url: { type: DataTypes.STRING(500), allowNull: true },
  category_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  aspect_ratio: { type: DataTypes.STRING(20), allowNull: true },
  status: { type: DataTypes.ENUM('public', 'private', 'draft', 'deleted'), allowNull: false, defaultValue: 'draft' },
  display_weight: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  view_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  download_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  favorite_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'images',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Image;
