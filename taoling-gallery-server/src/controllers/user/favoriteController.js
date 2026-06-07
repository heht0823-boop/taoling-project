const { success, created } = require('../../utils/response');
const service = require('../../services/user/favoriteService');

exports.add = async (req, res) => created(res, await service.addFavorite(req.user, req.params.id || req.body.image_id || req.body.imageId, req), '收藏成功');
exports.remove = async (req, res) => success(res, await service.removeFavorite(req.user, req.params.id || req.params.imageId, req), '取消收藏成功');
exports.list = async (req, res) => success(res, await service.listFavorites(req.user, req.query));
