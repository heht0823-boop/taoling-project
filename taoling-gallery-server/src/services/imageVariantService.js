/**
 * Image Variant Service
 * 使用 sharp 生成本地上传图片的 WebP/AVIF 缩略图。sharp 未安装时保持显式不可用。
 */

const fs = require("fs/promises");
const path = require("path");
const env = require("../config/env");
const { badRequest } = require("../utils/httpError");
const { normalizeImageUrl } = require("../utils/imageUrl");

let sharp = null;
try {
  // sharp 是可选运行时依赖；部署安装后自动启用真实压缩缩略图。
  sharp = require("sharp");
} catch (error) {
  sharp = null;
}

const uploadRoot = path.resolve(__dirname, "..", "uploads");
const variantRoot = path.resolve(uploadRoot, "variants");

const variantWidths = {
  image: [420, 520],
  avatar: [80, 160],
};

const allowedFormats = new Set(["webp", "avif", "jpg", "jpeg", "png"]);

const isSharpEnabled = () => Boolean(sharp);

const publicUploadUrl = (filename) =>
  `${env.appUrl.replace(/\/$/, "")}/uploads/${filename}`;

const publicVariantUrl = (filename) =>
  `${env.appUrl.replace(/\/$/, "")}/uploads/variants/${filename}`;

const sanitizeFormat = (format) => {
  const value = String(format || env.imageOptimizer.format || "webp").toLowerCase();
  return allowedFormats.has(value) ? value : "webp";
};

const sanitizeWidth = (width, fallback = 420) => {
  const value = Number(width || fallback);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), 32), 2000);
};

const sanitizeQuality = (quality) => {
  const value = Number(quality || 78);
  if (!Number.isFinite(value)) return 78;
  return Math.min(Math.max(Math.round(value), 35), 95);
};

const baseName = (filename) =>
  path.basename(filename, path.extname(filename)).replace(/[^a-zA-Z0-9_-]/g, "");

const variantFilename = ({ filename, width, format, quality }) =>
  `${baseName(filename)}-${width}w-q${quality}.${format === "jpeg" ? "jpg" : format}`;

const localUploadPathFromUrl = (url) => {
  const source = normalizeImageUrl(url);
  const marker = "/uploads/";
  const index = source.indexOf(marker);
  if (index === -1) return null;
  const relative = decodeURIComponent(source.slice(index + marker.length).split(/[?#]/)[0]);
  const resolved = path.resolve(uploadRoot, relative);
  return resolved.startsWith(uploadRoot) ? resolved : null;
};

const isLocalUploadUrl = (url) => Boolean(localUploadPathFromUrl(url));

const getSharpPipeline = (input, format, quality) => {
  const pipeline = sharp(input).rotate();
  if (format === "avif") return pipeline.avif({ quality });
  if (format === "jpg" || format === "jpeg") return pipeline.jpeg({ quality, mozjpeg: true });
  if (format === "png") return pipeline.png({ quality });
  return pipeline.webp({ quality });
};

const ensureVariant = async ({ inputPath, filename, width, format = "webp", quality = 78 }) => {
  if (!sharp) throw badRequest("图片压缩服务未启用，请安装 sharp 后重试");
  const safeWidth = sanitizeWidth(width);
  const safeFormat = sanitizeFormat(format);
  const safeQuality = sanitizeQuality(quality);
  await fs.mkdir(variantRoot, { recursive: true });
  const outputName = variantFilename({
    filename,
    width: safeWidth,
    format: safeFormat,
    quality: safeQuality,
  });
  const outputPath = path.resolve(variantRoot, outputName);
  await fs.access(outputPath).catch(async () => {
    await getSharpPipeline(inputPath, safeFormat, safeQuality)
      .resize({ width: safeWidth, withoutEnlargement: true })
      .toFile(outputPath);
  });
  return {
    filename: outputName,
    path: outputPath,
    url: publicVariantUrl(outputName),
    width: safeWidth,
    format: safeFormat,
    quality: safeQuality,
  };
};

const generateUploadVariants = async (file, type = "image") => {
  if (!file) throw badRequest("请上传图片文件");
  const imageUrl = publicUploadUrl(file.filename);
  const widths = variantWidths[type] || variantWidths.image;

  if (!sharp) {
    return {
      image_url: imageUrl,
      thumbnail_url: "",
      thumbnail_srcset: "",
      variants: [],
      processor_enabled: false,
    };
  }

  const variants = [];
  for (const width of widths) {
    variants.push(
      await ensureVariant({
        inputPath: file.path,
        filename: file.filename,
        width,
        format: env.imageOptimizer.format,
        quality: env.imageOptimizer.quality,
      }),
    );
  }
  return {
    image_url: imageUrl,
    thumbnail_url: variants[0]?.url || "",
    thumbnail_srcset: variants.map((item) => `${item.url} ${item.width}w`).join(", "),
    variants,
    processor_enabled: true,
  };
};

module.exports = {
  ensureVariant,
  generateUploadVariants,
  isLocalUploadUrl,
  isSharpEnabled,
  localUploadPathFromUrl,
  publicUploadUrl,
  sanitizeFormat,
  sanitizeQuality,
  sanitizeWidth,
};
