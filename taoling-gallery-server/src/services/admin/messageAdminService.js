/**
 * Message Admin Service - 留言管理服务（管理员端）
 * 提供留言列表、详情、回复和屏蔽功能
 */

const { Op } = require("sequelize");
const { UserMessage, User } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { badRequest, notFound } = require("../../utils/httpError");
const { writeLog } = require("../logService");
const { serialize } = require("../user/messageService");

/**
 * 用户关联查询配置（内部方法）
 * @returns {Array} Sequelize include 配置
 */
const includeUser = () => [
  {
    model: User,
    as: "user",
    attributes: ["id", "username", "avatar_url", "role"],
  },
];

/**
 * 获取留言列表
 * @param {Object} query - 查询参数 {check_status, parent_id, keyword}
 * @returns {Promise<Object>} 分页结果
 */
const list = async (query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const where = { deleted_at: null };
  if (query.check_status) where.check_status = query.check_status;
  if (query.parent_id !== undefined) where.parent_id = query.parent_id || null;
  if (query.keyword) where.content = { [Op.like]: `%${query.keyword}%` };

  const result = await UserMessage.findAndCountAll({
    where,
    include: includeUser(),
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return paged(result.rows.map(serialize), result.count, page, pageSize);
};

/**
 * 获取留言详情
 * @param {number} id - 留言ID
 * @returns {Promise<Object>} 留言详情（包含回复）
 */
const detail = async (id) => {
  // 将id转换为数字类型，确保正确查询
  const messageId = Number(id);
  if (isNaN(messageId)) throw badRequest("无效的留言ID");

  const message = await UserMessage.findOne({
    where: { id: messageId, deleted_at: null },
    include: [
      ...includeUser(),
      {
        model: UserMessage,
        as: "replies",
        where: { deleted_at: null },
        required: false,
        separate: true,
        include: includeUser(),
        order: [["created_at", "ASC"]],
      },
    ],
  });
  if (!message) throw notFound("留言不存在");
  return {
    ...serialize(message),
    replies: (message.replies || []).map(serialize),
  };
};

/**
 * 回复留言
 * @param {Object} admin - 管理员对象
 * @param {number} id - 留言ID
 * @param {Object} payload - 请求载荷 {content}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 回复的留言信息
 */
const reply = async (admin, id, payload, req) => {
  const content = String(payload.content || "").trim();
  if (!content) throw badRequest("回复内容不能为空");
  if (content.length > 2000) throw badRequest("回复内容不能超过 2000 个字符");

  const parent = await UserMessage.findOne({ where: { id, deleted_at: null } });
  if (!parent) throw notFound("留言不存在");

  const message = await UserMessage.create({
    user_id: admin.id,
    parent_id: parent.id,
    content,
    check_status: "success",
    ip_address: req.ip || null,
    user_agent: String(req.headers["user-agent"] || "").slice(0, 255) || null,
  });

  await writeLog({
    actor: admin,
    action_type: "USER_MESSAGE_REPLY",
    target_type: "user_message",
    target_id: parent.id,
    title: "回复用户留言",
    content: `${admin.username} 回复了留言 ${parent.id}`,
    ip: req.ip,
  });

  return serialize(
    await UserMessage.findByPk(message.id, { include: includeUser() }),
  );
};

/**
 * 屏蔽留言
 * @param {Object} admin - 管理员对象
 * @param {number} id - 留言ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 更新后的留言信息
 */
const block = async (admin, id, req) => {
  const message = await UserMessage.findOne({
    where: { id, deleted_at: null },
  });
  if (!message) throw notFound("留言不存在");

  await message.update({ check_status: "block" });
  await writeLog({
    actor: admin,
    action_type: "USER_MESSAGE_BLOCK",
    target_type: "user_message",
    target_id: message.id,
    title: "屏蔽用户留言",
    content: `${admin.username} 屏蔽了留言 ${message.id}`,
    ip: req.ip,
  });

  return serialize(
    await UserMessage.findByPk(message.id, { include: includeUser() }),
  );
};

module.exports = { list, detail, reply, block };
