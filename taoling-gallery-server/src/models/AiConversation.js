/**
 * AiConversation 模型 - AI会话模型
 * 存储用户与AI助手的会话信息
 * 
 * @property {number} id - 会话ID（主键）
 * @property {number} user_id - 用户ID（关联 users.id）
 * @property {string} title - 会话标题（默认为"新的对话"）
 * @property {Date} deleted_at - 删除时间（软删除标记）
 * @property {Date} created_at - 创建时间
 * @property {Date} updated_at - 更新时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AiConversation = sequelize.define('AiConversation', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  title: { type: DataTypes.STRING(200), allowNull: false, defaultValue: '新的对话' },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'ai_conversations',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = AiConversation;
