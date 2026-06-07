/**
 * Favorite 模型 - 收藏模型
 * 存储用户对图片的收藏关系
 * 
 * @property {number} id - 收藏ID（主键）
 * @property {number} user_id - 用户ID（关联 users.id）
 * @property {number} image_id - 图片ID（关联 images.id）
 * @property {Date} created_at - 创建时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  image_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
}, {
  tableName: 'favorites',
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Favorite;
