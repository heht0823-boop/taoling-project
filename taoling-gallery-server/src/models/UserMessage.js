/**
 * UserMessage 模型 - 用户留言模型
 * 存储用户在留言板的留言内容，支持回复层级结构
 * 
 * @property {number} id - 留言ID（主键）
 * @property {number} user_id - 用户ID（关联 users.id）
 * @property {number} parent_id - 父留言ID（关联 user_messages.id，回复时使用）
 * @property {string} content - 留言内容
 * @property {string} check_status - 审核状态：pending（待审核）、success（通过）、block（屏蔽）
 * @property {number} check_score - 内容安全审核分数
 * @property {Object} check_result - 审核结果详情（JSON格式）
 * @property {string} ip_address - 发布者IP地址
 * @property {string} user_agent - 发布者浏览器信息
 * @property {Date} deleted_at - 删除时间（软删除标记）
 * @property {Date} created_at - 创建时间
 * @property {Date} updated_at - 更新时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserMessage = sequelize.define('UserMessage', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  parent_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  check_status: { type: DataTypes.ENUM('pending', 'success', 'block'), allowNull: false, defaultValue: 'pending' },
  check_score: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
  check_result: { type: DataTypes.JSON, allowNull: true },
  ip_address: { type: DataTypes.STRING(50), allowNull: true },
  user_agent: { type: DataTypes.STRING(255), allowNull: true },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'user_messages',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserMessage;
