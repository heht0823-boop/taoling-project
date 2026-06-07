/**
 * Download Service - 图片下载服务
 * 提供图片下载、下载记录查询和管理功能
 */

const { sequelize, Image, DownloadRecord, UserStat } = require("../../models");
const { getPagination, paged } = require("../../utils/pagination");
const { notFound } = require("../../utils/httpError");
const { normalizeImageUrl } = require("../../utils/imageUrl");
const { writeLog } = require("../logService");

/**
 * 处理图片下载
 * @param {Object} user - 当前用户对象
 * @param {number} imageId - 图片ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 下载结果
 */
const downloadImage = async (user, imageId, req) => {
  const image = await Image.findOne({
    where: { id: imageId, status: "public", deleted_at: null },
  });
  if (!image) throw notFound("图片不存在或暂未公开，无法下载");

  await sequelize.transaction(async (transaction) => {
    await DownloadRecord.create(
      {
        user_id: user.id,
        image_id: image.id,
        image_title: image.title,
        image_url: normalizeImageUrl(image.image_url),
      },
      { transaction },
    );
    await image.increment("download_count", { by: 1, transaction });
    await UserStat.increment("download_count", {
      by: 1,
      where: { user_id: user.id },
      transaction,
    });
  });
  await image.reload();
  await writeLog({
    actor: user,
    action_type: "DOWNLOAD_IMAGE",
    target_type: "download",
    target_id: image.id,
    title: "下载图片",
    content: `${user.username} 下载了图片《${image.title}》`,
    ip: req.ip,
  });
  return {
    image_id: image.id,
    download_url: normalizeImageUrl(image.image_url),
    download_count: image.download_count,
  };
};

/**
 * 获取用户下载记录列表
 * @param {Object} user - 当前用户对象
 * @param {Object} query - 查询参数
 * @returns {Promise<Object>} 分页结果
 */
const listDownloads = async (user, query) => {
  const { page, pageSize, limit, offset } = getPagination(query);
  const result = await DownloadRecord.findAndCountAll({
    where: { user_id: user.id, deleted_at: null },
    attributes: ["id", "image_id", "image_title", "image_url", "created_at"],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  return paged(
    result.rows.map((row) => ({
      ...row.toJSON(),
      image_url: normalizeImageUrl(row.image_url),
    })),
    result.count,
    page,
    pageSize,
  );
};

/**
 * 删除单条下载记录
 * @param {Object} user - 当前用户对象
 * @param {number} recordId - 下载记录ID
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 空对象
 */
const deleteDownload = async (user, recordId, req) => {
  const [affected] = await DownloadRecord.update(
    { deleted_at: new Date() },
    { where: { id: recordId, user_id: user.id, deleted_at: null } },
  );
  if (!affected) throw notFound("下载记录不存在或已删除");
  await writeLog({
    actor: user,
    action_type: "DOWNLOAD_RECORD_DELETE",
    target_type: "download",
    target_id: recordId,
    title: "删除下载记录",
    content: `${user.username} 删除了一条下载记录`,
    ip: req.ip,
  });
  return {};
};

/**
 * 清空用户所有下载记录
 * @param {Object} user - 当前用户对象
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 空对象
 */
const clearDownloads = async (user, req) => {
  await DownloadRecord.update(
    { deleted_at: new Date() },
    { where: { user_id: user.id, deleted_at: null } },
  );
  await writeLog({
    actor: user,
    action_type: "DOWNLOAD_RECORD_CLEAR",
    target_type: "download",
    target_id: null,
    title: "清空下载记录",
    content: `${user.username} 清空了下载记录`,
    ip: req.ip,
  });
  return {};
};

module.exports = {
  downloadImage,
  listDownloads,
  deleteDownload,
  clearDownloads,
};
