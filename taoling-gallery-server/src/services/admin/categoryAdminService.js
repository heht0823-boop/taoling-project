/**
 * Category Admin Service - 分类管理服务（管理员端）
 * 提供分类的增删改查功能
 */

const { Op } = require("sequelize");
const { Category, Image } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { badRequest, conflict, notFound } = require("../../utils/httpError");
const { writeLog } = require("../logService");

/**
 * 获取分类列表
 * @param {Object} query - 查询参数 {keyword, status}
 * @returns {Promise<Object>} 分页结果
 */
const list = async (query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const where = { deleted_at: null };
  if (query.keyword) where.name = { [Op.like]: `%${query.keyword}%` };
  if (query.status) where.status = query.status;
  const result = await Category.findAndCountAll({
    where,
    order: [
      ["sort_order", "DESC"],
      ["created_at", "DESC"],
    ],
    limit,
    offset,
  });
  const rows = await Promise.all(
    result.rows.map(async (category) => ({
      ...category.toJSON(),
      image_count: await Image.count({
        where: {
          category_id: category.id,
          deleted_at: null,
          status: { [Op.ne]: "deleted" },
        },
      }),
    })),
  );
  return paged(rows, result.count, page, pageSize);
};

/**
 * 创建分类
 * @param {Object} admin - 管理员对象
 * @param {Object} payload - 分类数据 {name, sort_order, status}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Category>} 创建的分类
 */
const create = async (admin, payload, req) => {
  if (!payload.name) throw badRequest("分类名称不能为空");
  const exists = await Category.findOne({
    where: { name: payload.name, deleted_at: null },
  });
  if (exists) throw conflict("分类名称已存在");
  const category = await Category.create({
    name: payload.name,
    sort_order: payload.sort_order || 0,
    status: payload.status || "normal",
  });
  await writeLog({
    actor: admin,
    action_type: "CATEGORY_CREATE",
    target_type: "category",
    target_id: category.id,
    title: "新增分类",
    content: `${admin.username} 新增分类 ${category.name}`,
    ip: req.ip,
  });
  return category;
};

/**
 * 更新分类
 * @param {Object} admin - 管理员对象
 * @param {number} id - 分类ID
 * @param {Object} payload - 更新数据 {name, sort_order, status}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Category>} 更新后的分类
 */
const update = async (admin, id, payload, req) => {
  const category = await Category.findOne({ where: { id, deleted_at: null } });
  if (!category) throw notFound("分类不存在");
  if (payload.name) {
    const exists = await Category.findOne({
      where: { id: { [Op.ne]: id }, name: payload.name, deleted_at: null },
    });
    if (exists) throw conflict("分类名称已存在");
  }
  await category.update({
    name: payload.name ?? category.name,
    sort_order: payload.sort_order ?? category.sort_order,
    status: payload.status ?? category.status,
  });
  await writeLog({
    actor: admin,
    action_type: "CATEGORY_UPDATE",
    target_type: "category",
    target_id: category.id,
    title: "编辑分类",
    content: `${admin.username} 编辑分类 ${category.name}`,
    ip: req.ip,
  });
  return category;
};

/**
 * 删除分类
 * @param {Object} admin - 管理员对象
 * @param {number} id - 分类ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 空对象
 */
const remove = async (admin, id, req) => {
  const category = await Category.findOne({ where: { id, deleted_at: null } });
  if (!category) throw notFound("分类不存在");
  const imageCount = await Image.count({
    where: {
      category_id: id,
      deleted_at: null,
      status: { [Op.ne]: "deleted" },
    },
  });
  if (imageCount > 0)
    throw badRequest("该分类下仍有图片，请先转移图片后再删除");
  await category.update({ deleted_at: new Date(), status: "disabled" });
  await writeLog({
    actor: admin,
    action_type: "CATEGORY_DELETE",
    target_type: "category",
    target_id: category.id,
    title: "删除分类",
    content: `${admin.username} 删除分类 ${category.name}`,
    ip: req.ip,
  });
  return {};
};

module.exports = { list, create, update, remove };
