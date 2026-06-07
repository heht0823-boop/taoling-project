/**
 * AiMessage 模型 - AI消息模型
 * 存储AI会话中的消息内容
 * 
 * @property {number} id - 消息ID（主键）
 * @property {number} conversation_id - 会话ID（关联 ai_conversations.id）
 * @property {number} user_id - 用户ID（关联 users.id）
 * @property {string} role - 角色：user（用户）、assistant（助手）
 * @property {string} content - 消息内容
 * @property {Object} recommended_tags - AI推荐的标签（JSON格式）
 * @property {number[]} recommended_image_ids - AI推荐的图片ID列表（JSON格式）
 * @property {Date} deleted_at - 删除时间（软删除标记）
 * @property {Date} created_at - 创建时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AiMessage = sequelize.define('AiMessage', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  conversation_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'assistant'), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  recommended_tags: { type: DataTypes.JSON, allowNull: true },
  recommended_image_ids: { type: DataTypes.JSON, allowNull: true },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'ai_messages',
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AiMessage;
