/**
 * Profile Service - 用户资料服务
 * 提供个人资料修改、密码修改和头像上传功能
 */

const bcrypt = require("bcryptjs");
const fs = require("fs/promises");
const path = require("path");
const { Op } = require("sequelize");
const env = require("../../config/env");
const { User } = require("../../models");
const { badRequest, conflict, unauthorized } = require("../../utils/httpError");
const { normalizeImageUrl } = require("../../utils/imageUrl");
const authService = require("./authService");
const { writeLog } = require("../logService");
const {
  generateUploadVariants,
  publicUploadUrl,
} = require("../imageVariantService");

/**
 * 更新个人资料
 * @param {number} userId - 用户ID
 * @param {Object} payload - 请求载荷 {username, email, avatar_url}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 更新后的用户信息
 */
const updateProfile = async (userId, payload, req) => {
  const updates = {};
  ["username", "email", "avatar_url"].forEach((key) => {
    if (payload[key] === undefined) return;
    updates[key] = key === "avatar_url"
      ? normalizeImageUrl(payload[key]) || null
      : payload[key] || null;
  });
  if (!Object.keys(updates).length)
    throw badRequest("请至少提交一个需要修改的资料字段");

  if (updates.username || updates.email) {
    const duplicate = await User.findOne({
      where: {
        id: { [Op.ne]: userId },
        deleted_at: null,
        [Op.or]: [
          ...(updates.username ? [{ username: updates.username }] : []),
          ...(updates.email ? [{ email: updates.email }] : []),
        ],
      },
    });
    if (duplicate?.username === updates.username)
      throw conflict("用户名已被使用");
    if (updates.email && duplicate?.email === updates.email)
      throw conflict("邮箱已被使用");
  }

  const user = await User.findByPk(userId);
  await user.update(updates);
  await writeLog({
    actor: user,
    action_type: "USER_PROFILE_UPDATE",
    target_type: "user",
    target_id: userId,
    title: "修改个人资料",
    content: `${user.username} 修改了个人资料`,
    ip: req.ip,
  });
  return authService.getUserWithStats(userId);
};

/**
 * 修改密码
 * @param {number} userId - 用户ID
 * @param {Object} payload - 请求载荷 {old_password, new_password}
 * @returns {Promise<Object>} 空对象
 */
const updatePassword = async (userId, payload) => {
  const { old_password, new_password } = payload;
  if (!old_password || !new_password)
    throw badRequest("旧密码和新密码不能为空");
  if (new_password.length < 6) throw badRequest("新密码长度不能少于 6 位");
  const user = await User.findByPk(userId);
  const matched = await bcrypt.compare(old_password, user.password_hash);
  if (!matched) throw unauthorized("旧密码不正确");
  await user.update({ password_hash: await bcrypt.hash(new_password, 10) });
  return {};
};

/**
 * 标准化上传文件URL（内部方法）
 * @param {Object} file - 上传文件对象
 * @returns {string} 完整的访问URL
 */
const normalizeUploadUrl = (file) =>
  `${env.appUrl.replace(/\/$/, "")}/uploads/${file.filename}`;

const allowedAvatarTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

const downloadRemoteAvatar = async (avatarUrl) => {
  const response = await fetch(avatarUrl);
  if (!response.ok) throw badRequest("头像外链下载失败，请更换后重试");
  const contentType = String(response.headers.get("content-type") || "").split(
    ";",
  )[0];
  const ext = allowedAvatarTypes.get(contentType);
  if (!ext) throw badRequest("头像外链仅支持 jpg、png、webp 图片");

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > env.upload.maxSizeMb * 1024 * 1024) {
    throw badRequest(`头像文件不能超过 ${env.upload.maxSizeMb}MB`);
  }

  const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
  const filePath = path.resolve(__dirname, "..", "..", "uploads", filename);
  await fs.writeFile(filePath, buffer);
  return {
    filename,
    path: filePath,
    mimetype: contentType,
    size: buffer.length,
  };
};

/**
 * 更新头像
 * @param {number} userId - 用户ID
 * @param {Object} payload - 请求载荷
 * @param {Object} file - 上传的文件对象
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 更新后的用户信息和审核结果
 */
const updateAvatar = async (userId, payload, file, req) => {
  const remoteAvatarUrl =
    !file && payload.avatar_url ? normalizeImageUrl(payload.avatar_url) : "";
  const avatarUrl = file ? normalizeUploadUrl(file) : remoteAvatarUrl;
  if (!avatarUrl) throw badRequest("请上传头像文件或提交 avatar_url");

  const localFile =
    file ||
    (remoteAvatarUrl ? await downloadRemoteAvatar(remoteAvatarUrl) : null);
  const variants = localFile
    ? await generateUploadVariants(localFile, "avatar")
    : {
        image_url: normalizeImageUrl(avatarUrl),
        thumbnail_url: "",
        thumbnail_srcset: "",
        processor_enabled: false,
      };
  const storedAvatarUrl = localFile
    ? publicUploadUrl(localFile.filename)
    : normalizeImageUrl(avatarUrl);

  const user = await User.findByPk(userId);
  await user.update({ avatar_url: storedAvatarUrl });
  await writeLog({
    actor: user,
    action_type: "USER_AVATAR_UPDATE",
    target_type: "user",
    target_id: userId,
    title: "修改头像",
    content: `${user.username} 修改了头像`,
    ip: req.ip,
  });

  return {
    ...(await authService.getUserWithStats(userId)),
    avatar_upload: {
      avatar_url: storedAvatarUrl,
      avatar_thumbnail_url: variants.thumbnail_url || null,
      avatar_srcset: variants.thumbnail_srcset || null,
      processor_enabled: variants.processor_enabled,
    },
  };
};

module.exports = { updateProfile, updatePassword, updateAvatar };
