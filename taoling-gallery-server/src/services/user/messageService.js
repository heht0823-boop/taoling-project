/**
 * Message Service - 用户留言服务
 * 提供留言板、用户留言和发布留言功能
 */

const { UserMessage, User } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { badRequest } = require("../../utils/httpError");
const { avatarVariants, normalizeImageUrl } = require("../../utils/imageUrl");
const contentSecurity = require("../contentSecurityService");

const serializeMessageUser = (user) =>
  user
    ? {
        id: user.id,
        username: user.username,
        avatar_url: normalizeImageUrl(user.avatar_url),
        ...avatarVariants(user.avatar_url),
      }
    : null;

/**
 * 序列化留言信息（管理员视图）
 * @param {UserMessage} message - 留言实例
 * @returns {Object} 序列化后的留言信息
 */
const serialize = (message) => ({
  id: message.id,
  user_id: message.user_id,
  username: message.user?.username || null,
  parent_id: message.parent_id,
  content: message.content,
  check_status: message.check_status,
  check_score: message.check_score,
  check_result: message.check_result,
  ip_address: message.ip_address,
  user_agent: message.user_agent,
  created_at: message.created_at,
  updated_at: message.updated_at,
});

/**
 * 序列化留言信息（公开视图）
 * @param {UserMessage} message - 留言实例
 * @returns {Object} 序列化后的留言信息
 */
const serializePublic = (message) => ({
  id: message.id,
  user_id: message.user_id,
  user: serializeMessageUser(message.user),
  parent_id: message.parent_id,
  content: message.content,
  created_at: message.created_at,
  updated_at: message.updated_at,
  replies: (message.replies || []).map((reply) => ({
    id: reply.id,
    user_id: reply.user_id,
    user: serializeMessageUser(reply.user),
    parent_id: reply.parent_id,
    content: reply.content,
    created_at: reply.created_at,
    updated_at: reply.updated_at,
  })),
});

/**
 * 用户关联查询配置（内部方法）
 * @returns {Array} Sequelize include 配置
 */
const userInclude = () => [
  { model: User, as: "user", attributes: ["id", "username", "avatar_url"] },
];

/**
 * 获取留言板列表（公开）
 * @param {Object} query - 查询参数 {page, pageSize, parent_id}
 * @returns {Promise<Object>} 分页结果
 */
const listBoard = async (query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const where = { check_status: "success", deleted_at: null };
  if (query.parent_id !== undefined) where.parent_id = query.parent_id || null;
  else where.parent_id = null;

  const result = await UserMessage.findAndCountAll({
    where,
    include: [
      ...userInclude(),
      {
        model: UserMessage,
        as: "replies",
        where: { check_status: "success", deleted_at: null },
        required: false,
        separate: true,
        include: userInclude(),
        order: [["created_at", "ASC"]],
      },
    ],
    distinct: true,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return paged(result.rows.map(serializePublic), result.count, page, pageSize);
};

/**
 * 获取当前用户的留言列表
 * @param {number} userId - 用户ID
 * @param {Object} query - 查询参数
 * @returns {Promise<Object>} 分页结果
 */
const listMine = async (userId, query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const result = await UserMessage.findAndCountAll({
    where: { user_id: userId, check_status: "success", deleted_at: null },
    include: userInclude(),
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return paged(result.rows.map(serializePublic), result.count, page, pageSize);
};

/**
 * 创建新留言（需审核）
 * @param {Object} user - 当前用户对象
 * @param {Object} payload - 请求载荷 {content, parent_id}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 提交结果
 */
const create = async (user, payload, req) => {
  const content = String(payload.content || "").trim();
  if (!content) throw badRequest("留言内容不能为空");
  if (content.length > 2000) throw badRequest("留言内容不能超过 2000 个字符");

  const message = await UserMessage.create({
    user_id: user.id,
    parent_id: payload.parent_id || null,
    content,
    check_status: "pending",
    ip_address: req.ip || null,
    user_agent: String(req.headers["user-agent"] || "").slice(0, 255) || null,
  });

  const result = await contentSecurity.checkText({
    content,
    dataId: `message-${message.id}`,
    userId: user.id,
  });
  await message.update({
    check_status: result.status,
    check_score: result.score,
    check_result: result.raw,
  });

  return { submitted: true };
};

module.exports = { listBoard, listMine, create, serialize, serializePublic };
