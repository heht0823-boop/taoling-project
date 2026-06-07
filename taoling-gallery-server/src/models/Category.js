/**
 * Category 模型 - 分类模型
 * 存储图片分类信息
 * 
 * @property {number} id - 分类ID（主键）
 * @property {string} name - 分类名称（唯一）
 * @property {number} sort_order - 排序顺序（数值越小越靠前）
 * @property {string} status - 状态：normal（正常）、disabled（禁用）
 * @property {Date} deleted_at - 删除时间（软删除标记）
 * @property {Date} created_at - 创建时间
 * @property {Date} updated_at - 更新时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM('normal', 'disabled'), allowNull: false, defaultValue: 'normal' },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'categories',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Category;
