/**
 * Dashboard Service - 仪表盘服务（管理员端）
 * 提供系统统计数据和操作日志查询功能
 */

const { Op } = require("sequelize");
const { Image, User, AiConversation, AdminLog } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");

/**
 * 获取系统统计数据
 * @returns {Promise<Object>} 统计信息
 */
const stats = async () => {
  const [
    image_count,
    user_count,
    total_view_count,
    total_download_count,
    total_favorite_count,
    ai_conversation_count,
  ] = await Promise.all([
    Image.count({
      where: { deleted_at: null, status: { [Op.ne]: "deleted" } },
    }),
    User.count({ where: { deleted_at: null } }),
    Image.sum("view_count", { where: { deleted_at: null } }),
    Image.sum("download_count", { where: { deleted_at: null } }),
    Image.sum("favorite_count", { where: { deleted_at: null } }),
    AiConversation.count({ where: { deleted_at: null } }),
  ]);
  return {
    image_count,
    user_count,
    total_view_count: total_view_count || 0,
    total_download_count: total_download_count || 0,
    total_favorite_count: total_favorite_count || 0,
    ai_conversation_count,
  };
};

/**
 * 获取操作日志列表
 * @param {Object} query - 查询参数 {action_type, target_type}
 * @returns {Promise<Object>} 分页结果
 */
const logs = async (query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const where = {};
  if (query.action_type) where.action_type = query.action_type;
  if (query.target_type) where.target_type = query.target_type;
  const result = await AdminLog.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return paged(result.rows, result.count, page, pageSize);
};

module.exports = { stats, logs };
