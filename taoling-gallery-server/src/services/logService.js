/**
 * Log Service - 日志服务
 * 提供统一的管理员操作日志记录功能
 * 日志写入失败不会影响主业务流程
 */

const { AdminLog } = require('../models');

/**
 * 写入管理员操作日志
 * @param {Object} params - 日志参数
 * @param {Object} params.actor - 操作者信息
 * @param {string} params.action_type - 操作类型
 * @param {string} params.target_type - 目标类型
 * @param {number|null} params.target_id - 目标ID
 * @param {string} params.title - 操作标题
 * @param {string} params.content - 操作内容描述
 * @param {string} params.ip - 操作者IP
 */
const writeLog = async ({ actor, action_type, target_type, target_id = null, title, content, ip }) => {
  try {
    await AdminLog.create({
      actor_id: actor?.id || null,
      actor_name: actor?.username || actor?.actor_name || 'system',
      actor_role: actor?.role || 'system',
      action_type,
      target_type,
      target_id,
      title,
      content,
      ip_address: ip || null,
    });
  } catch (error) {
    console.error('admin log write failed:', error.message);
  }
};

module.exports = { writeLog };
