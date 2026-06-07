/**
 * Tag 模型 - 标签模型
 * 存储图片标签信息，通过 ImageTag 中间表与图片多对多关联
 * 
 * @property {number} id - 标签ID（主键）
 * @property {string} name - 标签名称（唯一）
 * @property {string} color - 标签颜色（可选，用于前端展示）
 * @property {number} usage_count - 使用次数（关联图片数量）
 * @property {string} status - 状态：normal（正常）、disabled（禁用）
 * @property {Date} deleted_at - 删除时间（软删除标记）
 * @property {Date} created_at - 创建时间
 * @property {Date} updated_at - 更新时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tag = sequelize.define('Tag', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  color: { type: DataTypes.STRING(32), allowNull: true },
  usage_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM('normal', 'disabled'), allowNull: false, defaultValue: 'normal' },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'tags',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Tag;
