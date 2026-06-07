/**
 * DownloadRecord 模型 - 下载记录模型
 * 存储用户的图片下载历史
 * 
 * @property {number} id - 记录ID（主键）
 * @property {number} user_id - 用户ID（关联 users.id）
 * @property {number} image_id - 图片ID（关联 images.id）
 * @property {string} image_title - 下载时的图片标题（快照）
 * @property {string} image_url - 下载时的图片URL（快照）
 * @property {Date} deleted_at - 删除时间（软删除标记）
 * @property {Date} created_at - 创建时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DownloadRecord = sequelize.define('DownloadRecord', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  image_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  image_title: { type: DataTypes.STRING(200), allowNull: false },
  image_url: { type: DataTypes.STRING(500), allowNull: false },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'download_records',
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = DownloadRecord;
