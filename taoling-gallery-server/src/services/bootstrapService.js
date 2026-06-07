/**
 * Bootstrap Service - 启动引导服务
 * 服务启动时执行的初始化操作
 */

const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { sequelize, User, UserStat } = require('../models');
const { writeLog } = require('./logService');

const ensureAiMemoryTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS ai_memories (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      conversation_id BIGINT UNSIGNED NULL,
      memory_type ENUM('short','long') NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uniq_ai_memory_scope (user_id, conversation_id, memory_type),
      KEY idx_ai_memories_user_type (user_id, memory_type),
      KEY idx_ai_memories_conversation (conversation_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
};

/**
 * 确保管理员账号存在
 * 服务启动时检查，不存在则创建默认管理员
 * @returns {Promise<User>} 管理员用户实例
 */
const ensureAdminUser = async () => {
  await ensureAiMemoryTable();

  const exists = await User.findOne({ where: { role: 'admin', deleted_at: null } });
  if (exists) return exists;

  const password_hash = await bcrypt.hash(env.admin.password, 10);
  const admin = await User.create({
    username: env.admin.username,
    email: env.admin.email,
    password_hash,
    role: 'admin',
    status: 'normal',
  });
  await UserStat.create({ user_id: admin.id });
  await writeLog({
    actor: { role: 'system', actor_name: 'system' },
    action_type: 'ADMIN_BOOTSTRAP',
    target_type: 'auth',
    target_id: admin.id,
    title: '初始化管理员账号',
    content: `系统创建默认管理员 ${admin.username}`,
  });
  return admin;
};

module.exports = { ensureAdminUser, ensureAiMemoryTable };
