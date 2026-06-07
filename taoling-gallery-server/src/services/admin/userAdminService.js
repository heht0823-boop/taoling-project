/**
 * User Admin Service - 用户管理服务（管理员端）
 * 提供用户列表、详情、状态管理和删除功能
 */

const { Op } = require("sequelize");
const { User, UserStat } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { badRequest, notFound } = require("../../utils/httpError");
const { serializeUser, serializeStats } = require("../user/authService");
const { writeLog } = require("../logService");

// 包含用户统计的关联配置
const includeStats = [{ model: UserStat, as: "stats" }];

/**
 * 序列化用户信息（包含统计）
 * @param {User} user - 用户实例
 * @returns {Object} 用户信息
 */
const serialize = (user) => ({
  ...serializeUser(user),
  stats: serializeStats(user.stats),
});

/**
 * 获取用户列表
 * @param {Object} query - 查询参数 {keyword, role, status}
 * @returns {Promise<Object>} 分页结果
 */
const list = async (query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const where = { deleted_at: null };
  if (query.keyword)
    where[Op.or] = [
      { username: { [Op.like]: `%${query.keyword}%` } },
      { email: { [Op.like]: `%${query.keyword}%` } },
    ];
  if (query.role) where.role = query.role;
  if (query.status) where.status = query.status;
  const result = await User.findAndCountAll({
    where,
    include: includeStats,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return paged(result.rows.map(serialize), result.count, page, pageSize);
};

/**
 * 获取用户详情
 * @param {number} id - 用户ID
 * @returns {Promise<Object>} 用户详情
 */
const detail = async (id) => {
  const user = await User.findOne({
    where: { id, deleted_at: null },
    include: includeStats,
  });
  if (!user) throw notFound("用户不存在");
  return serialize(user);
};

/**
 * 修改用户状态
 * @param {Object} admin - 管理员对象
 * @param {number} id - 用户ID
 * @param {string} status - 新状态
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 更新后的用户详情
 */
const updateStatus = async (admin, id, status, req) => {
  if (!["normal", "disabled"].includes(status))
    throw badRequest("用户状态只能是 normal 或 disabled");
  if (Number(admin.id) === Number(id))
    throw badRequest("管理员不能禁用自己的账号");
  const user = await User.findOne({ where: { id, deleted_at: null } });
  if (!user) throw notFound("用户不存在");
  await user.update({ status });
  await writeLog({
    actor: admin,
    action_type: "USER_STATUS_CHANGE",
    target_type: "user",
    target_id: user.id,
    title: "修改用户状态",
    content: `${admin.username} 将用户 ${user.username} 状态改为 ${status}`,
    ip: req.ip,
  });
  return detail(id);
};

/**
 * 删除用户（软删除）
 * @param {Object} admin - 管理员对象
 * @param {number} id - 用户ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 空对象
 */
const remove = async (admin, id, req) => {
  if (Number(admin.id) === Number(id))
    throw badRequest("管理员不能删除自己的账号");
  const user = await User.findOne({ where: { id, deleted_at: null } });
  if (!user) throw notFound("用户不存在");
  await user.update({ deleted_at: new Date(), status: "disabled" });
  await writeLog({
    actor: admin,
    action_type: "USER_DELETE",
    target_type: "user",
    target_id: user.id,
    title: "删除用户",
    content: `${admin.username} 删除用户 ${user.username}`,
    ip: req.ip,
  });
  return {};
};

module.exports = { list, detail, updateStatus, remove };
