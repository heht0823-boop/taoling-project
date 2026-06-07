/**
 * AiMemory 模型 - AI 记忆模型
 * 保存会话短期摘要和用户长期偏好，用于增强 AI 对话的上下文理解能力
 *
 * @property {number} id - 记录ID（主键）
 * @property {number} user_id - 用户ID（关联 users.id）
 * @property {number|null} conversation_id - 会话ID（关联 ai_conversations.id，长期记忆可为null）
 * @property {string} memory_type - 记忆类型：short（短期记忆）、long（长期记忆）
 * @property {string} content - 记忆内容（会话摘要或用户偏好描述）
 * @property {Date} created_at - 创建时间
 * @property {Date} updated_at - 更新时间
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AiMemory = sequelize.define(
  "AiMemory",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    conversation_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    memory_type: {
      type: DataTypes.ENUM("short", "long"),
      allowNull: false,
    },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "ai_memories",
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

module.exports = AiMemory;
