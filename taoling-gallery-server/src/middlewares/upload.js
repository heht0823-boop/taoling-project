/**
 * Upload Middleware - 文件上传中间件
 * 提供图片上传功能，支持 jpg、png、webp 格式
 */

const path = require('path');
const multer = require('multer');
const env = require('../config/env');
const { badRequest } = require('../utils/httpError');

/**
 * Multer 磁盘存储配置
 * 文件存储到 uploads 目录，文件名格式为 时间戳-随机串.扩展名
 */
const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '..', '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`);
  },
});

/**
 * 允许的图片 MIME 类型
 */
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

/**
 * 图片上传中间件
 * - 限制文件大小（通过配置）
 * - 只允许 jpg、png、webp 格式
 */
const uploadImage = multer({
  storage,
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) return cb(badRequest('仅支持 jpg、png、webp 图片文件'));
    return cb(null, true);
  },
});

module.exports = { uploadImage };
