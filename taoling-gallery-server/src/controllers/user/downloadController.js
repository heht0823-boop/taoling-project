const { success, created } = require('../../utils/response');
const service = require('../../services/user/downloadService');

exports.create = async (req, res) => created(res, await service.downloadImage(req.user, req.params.id || req.body.image_id || req.body.imageId, req), '下载记录已创建');
exports.list = async (req, res) => success(res, await service.listDownloads(req.user, req.query));
exports.remove = async (req, res) => success(res, await service.deleteDownload(req.user, req.params.id || req.params.recordId, req), '下载记录已删除');
exports.clear = async (req, res) => success(res, await service.clearDownloads(req.user, req), '下载记录已清空');
