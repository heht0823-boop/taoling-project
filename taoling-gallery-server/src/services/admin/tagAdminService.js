/**
 * Tag Admin Service - 标签管理服务（管理员端）
 * 提供标签的增删改查功能
 */

const { Op } = require("sequelize");
const { Tag, ImageTag } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { badRequest, conflict, notFound } = require("../../utils/httpError");
const { writeLog } = require("../logService");

/**
 * 获取标签列表
 * @param {Object} query - 查询参数 {keyword, status}
 * @returns {Promise<Object>} 分页结果
 */
const list = async (query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const where = { deleted_at: null };
  if (query.keyword) where.name = { [Op.like]: `%${query.keyword}%` };
  if (query.status) where.status = query.status;
  const result = await Tag.findAndCountAll({
    where,
    order: [
      ["usage_count", "DESC"],
      ["created_at", "DESC"],
    ],
    limit,
    offset,
  });
  return paged(result.rows, result.count, page, pageSize);
};

/**
 * 创建标签
 * @param {Object} admin - 管理员对象
 * @param {Object} payload - 标签数据 {name, color, status}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Tag>} 创建的标签
 */
const create = async (admin, payload, req) => {
  if (!payload.name) throw badRequest("标签名称不能为空");
  const exists = await Tag.findOne({
    where: { name: payload.name, deleted_at: null },
  });
  if (exists) throw conflict("标签名称已存在");
  const tag = await Tag.create({
    name: payload.name,
    color: payload.color || null,
    status: payload.status || "normal",
  });
  await writeLog({
    actor: admin,
    action_type: "TAG_CREATE",
    target_type: "tag",
    target_id: tag.id,
    title: "新增标签",
    content: `${admin.username} 新增标签 ${tag.name}`,
    ip: req.ip,
  });
  return tag;
};

/**
 * 更新标签
 * @param {Object} admin - 管理员对象
 * @param {number} id - 标签ID
 * @param {Object} payload - 更新数据 {name, color, status}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Tag>} 更新后的标签
 */
const update = async (admin, id, payload, req) => {
  const tag = await Tag.findOne({ where: { id, deleted_at: null } });
  if (!tag) throw notFound("标签不存在");
  if (payload.name) {
    const exists = await Tag.findOne({
      where: { id: { [Op.ne]: id }, name: payload.name, deleted_at: null },
    });
    if (exists) throw conflict("标签名称已存在");
  }
  await tag.update({
    name: payload.name ?? tag.name,
    color: payload.color ?? tag.color,
    status: payload.status ?? tag.status,
  });
  await writeLog({
    actor: admin,
    action_type: "TAG_UPDATE",
    target_type: "tag",
    target_id: tag.id,
    title: "编辑标签",
    content: `${admin.username} 编辑标签 ${tag.name}`,
    ip: req.ip,
  });
  return tag;
};

/**
 * 删除标签
 * @param {Object} admin - 管理员对象
 * @param {number} id - 标签ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 空对象
 */
const remove = async (admin, id, req) => {
  const tag = await Tag.findOne({ where: { id, deleted_at: null } });
  if (!tag) throw notFound("标签不存在");
  const used = await ImageTag.count({ where: { tag_id: id } });
  if (used > 0) throw badRequest("该标签正在被图片使用，请先移除关联后再删除");
  await tag.update({ deleted_at: new Date(), status: "disabled" });
  await writeLog({
    actor: admin,
    action_type: "TAG_DELETE",
    target_type: "tag",
    target_id: tag.id,
    title: "删除标签",
    content: `${admin.username} 删除标签 ${tag.name}`,
    ip: req.ip,
  });
  return {};
};

module.exports = { list, create, update, remove };
