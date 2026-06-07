/**
 * Image Service - 图片浏览服务
 * 提供图片列表、详情、浏览记录、相关推荐等功能
 */

const { Op, Sequelize } = require("sequelize");
const {
  sequelize,
  Image,
  Category,
  Tag,
  Favorite,
  ImageViewRecord,
  UserStat,
} = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { HttpError, badRequest, notFound } = require("../../utils/httpError");
const {
  imageThumbnailUrl,
  imageVariantUrl,
  normalizeImageUrl,
} = require("../../utils/imageUrl");
const {
  ensureVariant,
  isLocalUploadUrl,
  isSharpEnabled,
  localUploadPathFromUrl,
  sanitizeFormat,
  sanitizeQuality,
  sanitizeWidth,
} = require("../imageVariantService");

// 图片查询时的默认关联配置
const imageInclude = [
  { model: Category, as: "category", attributes: ["id", "name"] },
  {
    model: Tag,
    as: "tags",
    attributes: ["id", "name", "color"],
    through: { attributes: [] },
  },
];

// 图片排序方式映射
const sortMap = {
  latest: [["created_at", "DESC"]],
  hot: [["view_count", "DESC"]],
  downloads: [["download_count", "DESC"]],
  favorites: [["favorite_count", "DESC"]],
  weight: [
    ["display_weight", "DESC"],
    ["created_at", "DESC"],
  ],
};

/**
 * 序列化图片信息（用于 API 响应）
 * @param {Image} image - 图片实例
 * @param {Set} favoriteIds - 用户收藏的图片ID集合
 * @returns {Object} 序列化后的图片信息
 */
const serializeImage = (image, favoriteIds = new Set()) => ({
  id: image.id,
  title: image.title,
  description: image.description,
  image_url: normalizeImageUrl(image.image_url),
  thumbnail_url: imageThumbnailUrl(image, 420),
  aspect_ratio: image.aspect_ratio,
  category: image.category
    ? { id: image.category.id, name: image.category.name }
    : null,
  tags: (image.tags || []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    color: tag.color,
  })),
  view_count: image.view_count,
  download_count: image.download_count,
  favorite_count: image.favorite_count,
  is_favorited: favoriteIds.has(Number(image.id)),
  created_at: image.created_at,
});

/**
 * 构建公开图片查询条件
 * @param {Object} query - 查询参数
 * @returns {Object} Sequelize 查询条件
 */
const buildPublicWhere = (query) => {
  const where = { status: "public", deleted_at: null };
  if (query.categoryId || query.category_id)
    where.category_id = query.categoryId || query.category_id;
  if (query.aspect_ratio) where.aspect_ratio = query.aspect_ratio;
  return where;
};

/**
 * 构建关键词模糊搜索条件
 * 搜索标题、描述及关联标签名称
 * @param {string} keyword - 搜索关键词
 * @returns {Object|null} Sequelize OR 查询条件
 */
const keywordFilter = (keyword) => {
  if (!keyword) return null;
  return {
    [Op.or]: [
      { title: { [Op.like]: `%${keyword}%` } },
      { description: { [Op.like]: `%${keyword}%` } },
      Sequelize.literal(`EXISTS (
        SELECT 1 FROM image_tags it
        INNER JOIN tags t ON t.id = it.tag_id
        WHERE it.image_id = Image.id
        AND t.deleted_at IS NULL
        AND t.name LIKE ${sequelize.escape(`%${keyword}%`)}
      )`),
    ],
  };
};

/**
 * 获取用户收藏的指定图片ID集合
 * @param {number} userId - 用户ID
 * @param {number[]} imageIds - 图片ID数组
 * @returns {Promise<Set>} 收藏的图片ID集合
 */
const getFavoriteIds = async (userId, imageIds) => {
  if (!userId || !imageIds.length) return new Set();
  const rows = await Favorite.findAll({
    where: { user_id: userId, image_id: imageIds },
    attributes: ["image_id"],
  });
  return new Set(rows.map((row) => Number(row.image_id)));
};

/**
 * 获取图片列表（分页）
 * @param {Object} query - 查询参数 {page, pageSize, keyword, categoryId, tagIds, sort}
 * @param {Object} user - 当前用户对象（可选）
 * @returns {Promise<Object>} 分页结果
 */
const listImages = async (query, user) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const where = buildPublicWhere(query);
  const keywordWhere = keywordFilter(query.keyword);
  if (keywordWhere) Object.assign(where, keywordWhere);

  const include = [...imageInclude];
  const tagIds = query.tagIds || query.tag_ids || query.tag_id;
  if (tagIds) {
    const ids = String(tagIds)
      .split(",")
      .map((id) => Number(id))
      .filter(Boolean);
    if (ids.length) {
      include[1] = { ...include[1], where: { id: ids }, required: true };
    }
  }

  const result = await Image.findAndCountAll({
    where,
    include,
    distinct: true,
    order: sortMap[query.sort] || sortMap.weight,
    limit,
    offset,
  });
  const favoriteIds = await getFavoriteIds(
    user?.id,
    result.rows.map((item) => item.id),
  );
  return paged(
    result.rows.map((item) => serializeImage(item, favoriteIds)),
    result.count,
    page,
    pageSize,
  );
};

/**
 * 获取图片详情
 * @param {number} id - 图片ID
 * @param {Object} user - 当前用户对象（可选）
 * @returns {Promise<Object>} 图片详情
 */
const getImageDetail = async (id, user) => {
  const image = await Image.findOne({
    where: { id, status: "public", deleted_at: null },
    include: imageInclude,
  });
  if (!image) throw notFound("图片不存在或暂未公开");
  const favoriteIds = await getFavoriteIds(user?.id, [image.id]);
  return serializeImage(image, favoriteIds);
};

const getImageThumbnail = async (id, query) => {
  const image = await Image.findOne({
    where: { id, status: "public", deleted_at: null },
    attributes: ["id", "image_url", "thumbnail_url", "title"],
  });
  if (!image) throw notFound("图片不存在或暂未公开");

  const width = sanitizeWidth(query.w || query.width, 420);
  const format = sanitizeFormat(query.format);
  const quality = sanitizeQuality(query.q || query.quality);
  const imageUrl = normalizeImageUrl(image.image_url);
  const thumbnailUrl = normalizeImageUrl(image.thumbnail_url);
  const sourceUrl =
    thumbnailUrl && thumbnailUrl !== imageUrl
      ? thumbnailUrl
      : imageUrl;

  if (isLocalUploadUrl(sourceUrl) && isSharpEnabled()) {
    const inputPath = localUploadPathFromUrl(sourceUrl);
    const filename = inputPath.split(/[\\/]/).pop();
    const variant = await ensureVariant({
      inputPath,
      filename,
      width,
      format,
      quality,
    });
    return {
      type: "file",
      path: variant.path,
      contentType: `image/${variant.format === "jpg" ? "jpeg" : variant.format}`,
    };
  }

  const optimizedUrl = imageVariantUrl(sourceUrl, { width, height: width, format });
  if (optimizedUrl && optimizedUrl !== sourceUrl) {
    return { type: "redirect", url: optimizedUrl };
  }

  throw new HttpError(
    503,
    "图片压缩服务未启用：请安装 sharp 或配置 IMAGE_OPTIMIZER_QUERY_TEMPLATE / IMAGE_OPTIMIZER_URL_TEMPLATE",
  );
};

/**
 * 记录图片浏览
 * @param {number} id - 图片ID
 * @param {Object} payload - 请求载荷 {visitor_id}
 * @param {Object} user - 当前用户对象（可选）
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 图片ID和浏览数
 */
const recordView = async (id, payload, user, req) => {
  const image = await Image.findOne({
    where: { id, status: "public", deleted_at: null },
  });
  if (!image) throw notFound("图片不存在或暂未公开，无法记录浏览");

  await sequelize.transaction(async (transaction) => {
    await ImageViewRecord.create(
      {
        user_id: user?.id || null,
        image_id: image.id,
        visitor_id: payload.visitor_id || null,
        image_title: image.title,
        ip_address: req.ip,
        user_agent: req.headers["user-agent"] || null,
      },
      { transaction },
    );
    await image.increment("view_count", { by: 1, transaction });
    if (user?.id)
      await UserStat.increment("view_count", {
        by: 1,
        where: { user_id: user.id },
        transaction,
      });
  });

  await image.reload();
  return { image_id: image.id, view_count: image.view_count };
};

/**
 * 获取相关推荐图片
 * 基于当前图片的标签和分类，推荐相似图片
 * @param {number} id - 当前图片ID
 * @param {Object} query - 查询参数 {limit}
 * @param {Object} user - 当前用户对象（可选）
 * @returns {Promise<Image[]>} 相关图片数组
 */
const relatedImages = async (id, query, user) => {
  const limit = Math.min(Number(query.limit || 6), 20);
  const current = await Image.findOne({
    where: { id, status: "public", deleted_at: null },
    include: imageInclude,
  });
  if (!current) throw notFound("图片不存在或暂未公开");
  const tagIds = (current.tags || []).map((tag) => tag.id);

  const include = [...imageInclude];
  if (tagIds.length)
    include[1] = { ...include[1], where: { id: tagIds }, required: false };
  const rows = await Image.findAll({
    where: {
      id: { [Op.ne]: id },
      status: "public",
      deleted_at: null,
      ...(current.category_id ? { category_id: current.category_id } : {}),
    },
    include,
    distinct: true,
    order: [
      ["display_weight", "DESC"],
      ["created_at", "DESC"],
    ],
    limit,
  });
  const favoriteIds = await getFavoriteIds(
    user?.id,
    rows.map((item) => item.id),
  );
  return rows.map((item) => serializeImage(item, favoriteIds));
};

/**
 * 获取分类列表
 * @returns {Promise<Category[]>} 分类数组
 */
const listCategories = async () => {
  return Category.findAll({
    where: { status: "normal", deleted_at: null },
    attributes: ["id", "name", "sort_order"],
    order: [
      ["sort_order", "DESC"],
      ["created_at", "DESC"],
    ],
  });
};

/**
 * 获取标签列表
 * @param {Object} query - 查询参数 {keyword, limit}
 * @returns {Promise<Tag[]>} 标签数组
 */
const listTags = async (query) => {
  const where = { status: "normal", deleted_at: null };
  if (query.keyword) where.name = { [Op.like]: `%${query.keyword}%` };
  const limit = Math.min(Number(query.limit || 50), 100);
  return Tag.findAll({
    where,
    attributes: ["id", "name", "color", "usage_count"],
    order: [
      ["usage_count", "DESC"],
      ["created_at", "DESC"],
    ],
    limit,
  });
};

module.exports = {
  listImages,
  getImageDetail,
  getImageThumbnail,
  recordView,
  relatedImages,
  listCategories,
  listTags,
  serializeImage,
  imageInclude,
  keywordFilter,
};
