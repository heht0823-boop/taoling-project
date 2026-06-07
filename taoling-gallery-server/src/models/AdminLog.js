/**
 * AdminLog 模型 - 管理员操作日志模型
 * 记录管理员的所有操作行为，用于审计和追溯
 * 
 * @property {number} id - 日志ID（主键）
 * @property {number} actor_id - 操作者ID（关联 users.id，系统操作时为null）
 * @property {string} actor_name - 操作者名称
 * @property {string} actor_role - 操作者角色：admin（管理员）、user（普通用户）、system（系统）、guest（访客）
 * @property {string} action_type - 操作类型
 * @property {string} target_type - 操作目标类型
 * @property {number} target_id - 操作目标ID
 * @property {string} title - 操作标题
 * @property {string} content - 操作详情描述
 * @property {string} ip_address - 操作者IP地址
 * @property {Date} created_at - 创建时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminLog = sequelize.define('AdminLog', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  actor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  actor_name: { type: DataTypes.STRING(100), allowNull: true },
  actor_role: { type: DataTypes.ENUM('admin', 'user', 'system', 'guest'), allowNull: false, defaultValue: 'system' },
  action_type: { type: DataTypes.STRING(64), allowNull: false },
  target_type: { type: DataTypes.STRING(64), allowNull: false },
  target_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  content: { type: DataTypes.STRING(1000), allowNull: true },
  ip_address: { type: DataTypes.STRING(64), allowNull: true },
}, {
  tableName: 'admin_logs',
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = AdminLog;
