/**
 * Image Admin Service - 图片管理服务（管理员端）
 * 提供图片的增删改查和状态管理功能
 */

const { Op } = require("sequelize");
const { sequelize, Image, Category, Tag, ImageTag } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { badRequest, notFound } = require("../../utils/httpError");
const { normalizeImageUrl } = require("../../utils/imageUrl");
const { writeLog } = require("../logService");
const { generateUploadVariants } = require("../imageVariantService");
const {
  imageInclude,
  serializeImage,
  keywordFilter,
} = require("../user/imageService");

// 允许的图片状态集合
const allowedStatus = new Set(["public", "private", "draft", "deleted"]);

/**
 * 标准化标签ID数组（内部方法）
 * @param {any} tag_ids - 标签ID
 * @returns {number[]} 去重后的数字ID数组
 */
const normalizeTagIds = (tag_ids = []) => [
  ...new Set(
    (Array.isArray(tag_ids) ? tag_ids : []).map(Number).filter(Boolean),
  ),
];

/**
 * 调整标签使用计数（内部方法）
 * @param {number[]} addIds - 新增关联的标签ID
 * @param {number[]} removeIds - 移除关联的标签ID
 * @param {Object} transaction - 数据库事务
 */
const adjustTagUsage = async (addIds, removeIds, transaction) => {
  if (addIds.length)
    await Tag.increment("usage_count", {
      by: 1,
      where: { id: addIds },
      transaction,
    });
  if (removeIds.length) {
    await Tag.decrement("usage_count", {
      by: 1,
      where: { id: removeIds },
      transaction,
    });
    await Tag.update(
      { usage_count: sequelize.literal("GREATEST(usage_count, 0)") },
      { where: { id: removeIds }, transaction },
    );
  }
};

/**
 * 同步图片标签关联（内部方法）
 * @param {number} imageId - 图片ID
 * @param {number[]} nextTagIds - 新的标签ID数组
 * @param {Object} transaction - 数据库事务
 */
const syncTags = async (imageId, nextTagIds, transaction) => {
  const current = await ImageTag.findAll({
    where: { image_id: imageId },
    attributes: ["tag_id"],
    transaction,
  });
  const currentIds = current.map((row) => Number(row.tag_id));
  const addIds = nextTagIds.filter((id) => !currentIds.includes(id));
  const removeIds = currentIds.filter((id) => !nextTagIds.includes(id));
  if (addIds.length)
    await ImageTag.bulkCreate(
      addIds.map((tag_id) => ({ image_id: imageId, tag_id })),
      { transaction },
    );
  if (removeIds.length)
    await ImageTag.destroy({
      where: { image_id: imageId, tag_id: removeIds },
      transaction,
    });
  await adjustTagUsage(addIds, removeIds, transaction);
};

/**
 * 验证图片数据载荷（内部方法）
 * @param {Object} payload - 数据载荷
 * @param {boolean} partial - 是否为部分更新
 */
const validateImagePayload = (payload, partial = false) => {
  const required = ["title", "image_url"];
  if (!partial) {
    required.forEach((field) => {
      if (!payload[field]) throw badRequest(`${field} 不能为空`);
    });
  }
  if (payload.status && !allowedStatus.has(payload.status))
    throw badRequest("图片状态只能是 public、private、draft、deleted");
};

/**
 * 创建图片
 * @param {Object} admin - 管理员对象
 * @param {Object} payload - 图片数据
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 创建的图片信息
 */
const createImage = async (admin, payload, req) => {
  validateImagePayload(payload);
  const tagIds = normalizeTagIds(payload.tag_ids || payload.tagIds);
  const image = await sequelize.transaction(async (transaction) => {
    const created = await Image.create(
      {
        title: payload.title,
        description: payload.description || null,
        image_url: normalizeImageUrl(payload.image_url),
        thumbnail_url: normalizeImageUrl(payload.thumbnail_url) || null,
        category_id: payload.category_id || payload.categoryId || null,
        aspect_ratio: payload.aspect_ratio || null,
        status: payload.status || "draft",
        display_weight: payload.display_weight || 0,
      },
      { transaction },
    );
    await syncTags(created.id, tagIds, transaction);
    return created;
  });
  await writeLog({
    actor: admin,
    action_type: "IMAGE_UPLOAD",
    target_type: "image",
    target_id: image.id,
    title: "上传图片",
    content: `${admin.username} 创建了图片《${image.title}》`,
    ip: req.ip,
  });
  return getImage(image.id);
};

/**
 * 获取图片列表（管理端）
 * @param {Object} query - 查询参数
 * @returns {Promise<Object>} 分页结果
 */
const listImages = async (query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const where = {};
  if (query.status === "deleted") {
    where[Op.or] = [{ status: "deleted" }, { deleted_at: { [Op.ne]: null } }];
  } else {
    where.deleted_at = null;
    if (query.status) where.status = query.status;
  }
  if (query.category_id || query.categoryId)
    where.category_id = query.category_id || query.categoryId;
  const keywordWhere = keywordFilter(query.keyword);
  if (keywordWhere) Object.assign(where, keywordWhere);

  const include = [...imageInclude];
  const tagId = query.tag_id || query.tagId;
  if (tagId)
    include[1] = { ...include[1], where: { id: tagId }, required: true };
  const sortMap = {
    latest: [["created_at", "DESC"]],
    views: [["view_count", "DESC"]],
    downloads: [["download_count", "DESC"]],
    favorites: [["favorite_count", "DESC"]],
    weight: [
      ["display_weight", "DESC"],
      ["created_at", "DESC"],
    ],
  };
  const result = await Image.findAndCountAll({
    where,
    include,
    distinct: true,
    order: sortMap[query.sort] || sortMap.latest,
    limit,
    offset,
  });
  return paged(
    result.rows.map((image) => ({
      ...serializeImage(image),
      status: image.status,
      display_weight: image.display_weight,
      deleted_at: image.deleted_at,
    })),
    result.count,
    page,
    pageSize,
  );
};

/**
 * 获取单张图片详情
 * @param {number} id - 图片ID
 * @returns {Promise<Object>} 图片详情
 */
const getImage = async (id) => {
  const image = await Image.findOne({ where: { id }, include: imageInclude });
  if (!image) throw notFound("图片不存在");
  const json = image.toJSON();
  json.image_url = normalizeImageUrl(json.image_url);
  json.thumbnail_url = normalizeImageUrl(json.thumbnail_url) || null;
  json.tag_ids = (json.tags || []).map((tag) => tag.id);
  return json;
};

/**
 * 更新图片信息
 * @param {Object} admin - 管理员对象
 * @param {number} id - 图片ID
 * @param {Object} payload - 更新数据
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 更新后的图片信息
 */
const updateImage = async (admin, id, payload, req) => {
  validateImagePayload(payload, true);
  const image = await Image.findByPk(id);
  if (!image) throw notFound("图片不存在");
  const tagIds =
    payload.tag_ids !== undefined || payload.tagIds !== undefined
      ? normalizeTagIds(payload.tag_ids || payload.tagIds)
      : null;

  await sequelize.transaction(async (transaction) => {
    const updates = {};
    [
      "title",
      "description",
      "image_url",
      "thumbnail_url",
      "aspect_ratio",
      "status",
      "display_weight",
    ].forEach((key) => {
      if (payload[key] === undefined) return;
      updates[key] = ["image_url", "thumbnail_url"].includes(key)
        ? normalizeImageUrl(payload[key]) || null
        : payload[key];
    });
    if (payload.category_id !== undefined || payload.categoryId !== undefined) {
      updates.category_id = payload.category_id || payload.categoryId || null;
    }
    if (updates.status && updates.status !== "deleted")
      updates.deleted_at = null;
    await image.update(updates, { transaction });
    if (tagIds) await syncTags(image.id, tagIds, transaction);
  });
  await writeLog({
    actor: admin,
    action_type: "IMAGE_UPDATE",
    target_type: "image",
    target_id: image.id,
    title: "编辑图片",
    content: `${admin.username} 编辑了图片《${image.title}》`,
    ip: req.ip,
  });
  return getImage(id);
};

/**
 * 变更图片状态
 * @param {Object} admin - 管理员对象
 * @param {number} id - 图片ID
 * @param {string} status - 新状态
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 更新后的图片信息
 */
const changeStatus = async (admin, id, status, req) => {
  if (!allowedStatus.has(status))
    throw badRequest("图片状态只能是 public、private、draft、deleted");
  const image = await Image.findByPk(id);
  if (!image) throw notFound("图片不存在");
  await image.update({
    status,
    deleted_at: status === "deleted" ? new Date() : null,
  });
  await writeLog({
    actor: admin,
    action_type: "IMAGE_STATUS_CHANGE",
    target_type: "image",
    target_id: image.id,
    title: "修改图片状态",
    content: `${admin.username} 将图片《${image.title}》状态改为 ${status}`,
    ip: req.ip,
  });
  return getImage(id);
};

/**
 * 删除图片（软删除）
 * @param {Object} admin - 管理员对象
 * @param {number} id - 图片ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 空对象
 */
const deleteImage = async (admin, id, req) => {
  const image = await Image.findByPk(id);
  if (!image) throw notFound("图片不存在");
  await image.update({ status: "deleted", deleted_at: new Date() });
  await writeLog({
    actor: admin,
    action_type: "IMAGE_DELETE",
    target_type: "image",
    target_id: image.id,
    title: "删除图片",
    content: `${admin.username} 删除了图片《${image.title}》`,
    ip: req.ip,
  });
  return {};
};

/**
 * 恢复已删除的图片
 * @param {Object} admin - 管理员对象
 * @param {number} id - 图片ID
 * @param {string} status - 恢复后的状态
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 恢复后的图片信息
 */
const restoreImage = async (admin, id, status, req) => {
  const image = await Image.findByPk(id);
  if (!image) throw notFound("图片不存在");
  const nextStatus = status || "draft";
  if (!["draft", "private", "public"].includes(nextStatus))
    throw badRequest("恢复后的状态只能是 draft、private、public");
  await image.update({ status: nextStatus, deleted_at: null });
  await writeLog({
    actor: admin,
    action_type: "IMAGE_RESTORE",
    target_type: "image",
    target_id: image.id,
    title: "恢复图片",
    content: `${admin.username} 恢复了图片《${image.title}》`,
    ip: req.ip,
  });
  return getImage(id);
};

/**
 * 处理上传文件并返回图片URL
 * @param {Object} file - 上传的文件对象
 * @param {string} appUrl - 应用基础URL
 * @returns {Object} 图片URL信息
 */
const uploadedFile = async (file) => {
  if (!file) throw badRequest("请上传图片文件");
  const result = await generateUploadVariants(file, "image");
  return {
    image_url: normalizeImageUrl(result.image_url),
    thumbnail_url: normalizeImageUrl(result.thumbnail_url),
    thumbnail_srcset: result.thumbnail_srcset,
    variants: result.variants,
    processor_enabled: result.processor_enabled,
  };
};

module.exports = {
  createImage,
  listImages,
  getImage,
  updateImage,
  changeStatus,
  deleteImage,
  restoreImage,
  uploadedFile,
};
