/**
 * UserStat 模型 - 用户统计模型
 * 存储用户的业务统计数据，与 users 表分离以降低主表读写压力
 * 
 * @property {number} id - 统计ID（主键）
 * @property {number} user_id - 用户ID（唯一，关联 users.id）
 * @property {number} favorite_count - 收藏数量
 * @property {number} download_count - 下载数量
 * @property {number} view_count - 浏览数量
 * @property {number} ai_conversation_count - AI会话数量
 * @property {number} ai_message_count - AI消息数量
 * @property {Date} created_at - 创建时间
 * @property {Date} updated_at - 更新时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserStat = sequelize.define('UserStat', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true },
  favorite_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  download_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  view_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  ai_conversation_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
  ai_message_count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
}, {
  tableName: 'user_stats',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserStat;
