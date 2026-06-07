/**
 * User 模型 - 用户模型
 * 用户表只保存账号身份信息，业务统计数据拆分到 user_stats 表
 * 
 * @property {number} id - 用户ID（主键）
 * @property {string} username - 用户名（唯一）
 * @property {string} email - 邮箱（唯一，可选）
 * @property {string} password_hash - 密码哈希值
 * @property {string} role - 用户角色：admin（管理员）、user（普通用户）
 * @property {string} status - 用户状态：normal（正常）、disabled（禁用）
 * @property {string} avatar_url - 头像URL（可选）
 * @property {Date} last_login_at - 最后登录时间（可选）
 * @property {Date} deleted_at - 删除时间（软删除标记）
 * @property {Date} created_at - 创建时间
 * @property {Date} updated_at - 更新时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(128), allowNull: true, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'user'), allowNull: false, defaultValue: 'user' },
  status: { type: DataTypes.ENUM('normal', 'disabled'), allowNull: false, defaultValue: 'normal' },
  avatar_url: { type: DataTypes.STRING(500), allowNull: true },
  last_login_at: { type: DataTypes.DATE, allowNull: true },
  deleted_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'users',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = User;
