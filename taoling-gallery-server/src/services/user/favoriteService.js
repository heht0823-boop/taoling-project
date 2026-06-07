/**
 * Favorite Service - 图片收藏服务
 * 提供收藏、取消收藏和收藏列表查询功能
 */

const { sequelize, Image, Favorite, UserStat } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { conflict, notFound } = require("../../utils/httpError");
const { imageThumbnailUrl, normalizeImageUrl } = require("../../utils/imageUrl");
const { writeLog } = require("../logService");

/**
 * 获取公开图片（内部方法）
 * @param {number} imageId - 图片ID
 * @returns {Promise<Image>} 图片实例
 */
const findPublicImage = async (imageId) => {
  const image = await Image.findOne({
    where: { id: imageId, status: "public", deleted_at: null },
  });
  if (!image) throw notFound("图片不存在或暂未公开，无法收藏");
  return image;
};

/**
 * 添加图片收藏
 * @param {Object} user - 当前用户对象
 * @param {number} imageId - 图片ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 收藏结果
 */
const addFavorite = async (user, imageId, req) => {
  const image = await findPublicImage(imageId);
  const exists = await Favorite.findOne({
    where: { user_id: user.id, image_id: image.id },
  });
  if (exists) throw conflict("你已经收藏过这张图片");

  await sequelize.transaction(async (transaction) => {
    await Favorite.create(
      { user_id: user.id, image_id: image.id },
      { transaction },
    );
    await image.increment("favorite_count", { by: 1, transaction });
    await UserStat.increment("favorite_count", {
      by: 1,
      where: { user_id: user.id },
      transaction,
    });
  });
  await image.reload();
  await writeLog({
    actor: user,
    action_type: "FAVORITE_CREATE",
    target_type: "favorite",
    target_id: image.id,
    title: "收藏图片",
    content: `${user.username} 收藏了图片《${image.title}》`,
    ip: req.ip,
  });
  return {
    image_id: image.id,
    is_favorited: true,
    favorite_count: image.favorite_count,
  };
};

/**
 * 取消图片收藏
 * @param {Object} user - 当前用户对象
 * @param {number} imageId - 图片ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 取消结果
 */
const removeFavorite = async (user, imageId, req) => {
  const image = await findPublicImage(imageId);
  const favorite = await Favorite.findOne({
    where: { user_id: user.id, image_id: image.id },
  });
  if (!favorite)
    return {
      image_id: image.id,
      is_favorited: false,
      favorite_count: image.favorite_count,
    };

  await sequelize.transaction(async (transaction) => {
    await favorite.destroy({ transaction });
    await image.decrement("favorite_count", { by: 1, transaction });
    await UserStat.decrement("favorite_count", {
      by: 1,
      where: { user_id: user.id },
      transaction,
    });
  });
  await Image.update(
    { favorite_count: sequelize.literal("GREATEST(favorite_count, 0)") },
    { where: { id: image.id } },
  );
  await UserStat.update(
    { favorite_count: sequelize.literal("GREATEST(favorite_count, 0)") },
    { where: { user_id: user.id } },
  );
  await image.reload();
  await writeLog({
    actor: user,
    action_type: "FAVORITE_CANCEL",
    target_type: "favorite",
    target_id: image.id,
    title: "取消收藏",
    content: `${user.username} 取消收藏图片《${image.title}》`,
    ip: req.ip,
  });
  return {
    image_id: image.id,
    is_favorited: false,
    favorite_count: image.favorite_count,
  };
};

/**
 * 获取用户收藏列表
 * @param {Object} user - 当前用户对象
 * @param {Object} query - 查询参数
 * @returns {Promise<Object>} 分页结果
 */
const listFavorites = async (user, query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const result = await Favorite.findAndCountAll({
    where: { user_id: user.id },
    include: [
      {
        model: Image,
        as: "image",
        where: { status: "public", deleted_at: null },
        attributes: [
          "id",
          "title",
          "thumbnail_url",
          "image_url",
          "view_count",
          "download_count",
          "favorite_count",
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return paged(
    result.rows.map((row) => ({
      favorite_id: row.id,
      created_at: row.created_at,
      image: row.image
        ? {
            ...row.image.toJSON(),
            image_url: normalizeImageUrl(row.image.image_url),
            thumbnail_url: imageThumbnailUrl(row.image, 420),
          }
        : null,
    })),
    result.count,
    page,
    pageSize,
  );
};

module.exports = { addFavorite, removeFavorite, listFavorites };
