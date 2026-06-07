/**
 * Image Controller - 图片浏览控制器
 * 处理图片列表、详情、浏览记录等请求
 */

const { success } = require('../../utils/response');
const service = require('../../services/user/imageService');

/**
 * 获取图片列表（分页）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.list = async (req, res) => success(res, await service.listImages(req.query, req.user));

/**
 * 获取图片详情
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.detail = async (req, res) => success(res, await service.getImageDetail(req.params.id, req.user));

/**
 * 获取图片缩略图变体
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.thumbnail = async (req, res) => {
  const result = await service.getImageThumbnail(req.params.id, req.query);
  res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
  if (result.type === 'redirect') return res.redirect(302, result.url);
  if (result.contentType) res.setHeader('Content-Type', result.contentType);
  return res.sendFile(result.path);
};

/**
 * 记录图片浏览
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.view = async (req, res) => success(res, await service.recordView(req.params.id, req.body, req.user, req), '浏览记录已保存');

/**
 * 获取相关推荐图片
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.related = async (req, res) => success(res, await service.relatedImages(req.params.id, req.query, req.user));

/**
 * 获取分类列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.categories = async (req, res) => success(res, await service.listCategories());

/**
 * 获取标签列表
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
exports.tags = async (req, res) => success(res, await service.listTags(req.query));
