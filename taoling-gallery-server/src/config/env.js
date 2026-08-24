/**
 * Environment Configuration - 环境配置
 * 统一加载并管理所有环境变量，避免各模块重复读取 .env 文件
 */

const path = require('path');
const dotenv = require('dotenv');

// 加载 .env 文件中的环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEFAULT_AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 敏感配置不允许回退到仓库内默认值，避免示例凭据进入公开环境。
 * @param {string} name 环境变量名
 * @returns {string} 已校验的环境变量值
 */
const requireEnv = (name) => {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`缺少必需环境变量：${name}`);
  }
  return value;
};

const parseAuthCookieMaxAgeMs = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value * 1000;
  if (!value || typeof value !== 'string') return DEFAULT_AUTH_COOKIE_MAX_AGE_MS;

  const matched = value.trim().match(/^(\d+)\s*([smhd])?$/i);
  if (!matched) return DEFAULT_AUTH_COOKIE_MAX_AGE_MS;

  const amount = Number(matched[1]);
  const unit = (matched[2] || 's').toLowerCase();
  const unitMs = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitMs[unit];
};

/**
 * 环境配置对象
 * @type {Object}
 * @property {string} nodeEnv - 运行环境（development/production/test）
 * @property {number} port - 服务端口
 * @property {string} appUrl - 应用 URL
 * @property {Object} db - 数据库配置
 * @property {Object} jwt - JWT 配置
 * @property {Object} admin - 管理员默认配置
 * @property {Object} upload - 文件上传配置
 * @property {Object} aliContentSecurity - 阿里云内容安全配置
 * @property {Object} ai - AI 服务配置
 */
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || 'taoling_gallery',
    username: process.env.DB_USER || 'root',
    password: requireEnv('DB_PASSWORD'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookie: {
    name: process.env.AUTH_COOKIE_NAME || 'taoling_auth',
    sameSite: process.env.AUTH_COOKIE_SAMESITE || 'lax',
    secure:
      process.env.AUTH_COOKIE_SECURE === 'true' ||
      (process.env.AUTH_COOKIE_SECURE !== 'false' && process.env.NODE_ENV === 'production'),
    domain: process.env.AUTH_COOKIE_DOMAIN || '',
    maxAgeMs: parseAuthCookieMaxAgeMs(
      process.env.AUTH_COOKIE_MAX_AGE || process.env.JWT_EXPIRES_IN || '7d',
    ),
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'hetao',
    email: process.env.ADMIN_EMAIL || 'admin@taoling.local',
    password: requireEnv('ADMIN_PASSWORD'),
  },
  upload: {
    maxSizeMb: Number(process.env.UPLOAD_MAX_SIZE_MB || 20),
  },
  imageOptimizer: {
    queryTemplate: process.env.IMAGE_OPTIMIZER_QUERY_TEMPLATE || '',
    urlTemplate: process.env.IMAGE_OPTIMIZER_URL_TEMPLATE || '',
    format: process.env.IMAGE_OPTIMIZER_FORMAT || 'webp',
    quality: Number(process.env.IMAGE_OPTIMIZER_QUALITY || 78),
    listWidth: Number(process.env.IMAGE_THUMBNAIL_WIDTH || 420),
    detailPreviewWidth: Number(process.env.IMAGE_DETAIL_PREVIEW_WIDTH || 520),
  },
  aliContentSecurity: {
    accessKeyId: process.env.ALI_ACCESS_KEY_ID || process.env.ALIBABA_CLOUD_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.ALI_ACCESS_KEY_SECRET || process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET || '',
    regionId: process.env.ALI_REGION_ID || 'cn-shanghai',
    endpoint: process.env.ALI_ENDPOINT || 'green-cip.cn-shanghai.aliyuncs.com',
    apiVersion: process.env.ALI_API_VERSION || '2022-03-02',
    textAction: process.env.ALI_TEXT_ACTION || 'TextModerationPlus',
    textServiceName: process.env.ALI_SERVICE_NAME || 'ugc_moderation_byllm_pro',
    imageServiceName: process.env.ALI_IMAGE_SERVICE_NAME || process.env.ALI_AVATAR_SERVICE_NAME || 'profilePhotoCheck',
    timeoutMs: Number(process.env.ALI_TIMEOUT_MS || 15000),
  },
  amap: {
    key: process.env.AMAP_KEY || '',
    liveCacheMinutes: Number(process.env.AMAP_LIVE_CACHE_MINUTES || 30),
    forecastCacheMinutes: Number(process.env.AMAP_FORECAST_CACHE_MINUTES || 360),
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'dashscope',
    apiKey: process.env.DASHSCOPE_API_KEY || process.env.AI_API_KEY || '',
    baseUrl: process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: process.env.DASHSCOPE_MODEL || 'qwen-plus',
    visionModel: process.env.DASHSCOPE_VISION_MODEL || process.env.AI_VISION_MODEL || 'qwen-vl-plus',
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || 30000),
  },
};

module.exports = env;
