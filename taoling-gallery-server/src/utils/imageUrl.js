/**
 * Image URL helpers
 * 通过 CDN/OSS 图片处理参数生成小尺寸展示图，避免头像等小 UI 下载原图。
 */

const env = require("../config/env");

const normalizeImageUrl = (url) => {
  const source = String(url || "").trim();
  if (!source) return "";
  return source.replace(/\/+([?#]|$)/, "$1");
};

const isHttpUrl = (url) => /^https?:\/\//i.test(normalizeImageUrl(url));

const appendQuery = (url, query) => {
  const source = normalizeImageUrl(url);
  if (!source || !query) return source;
  const glue = source.includes("?") ? "&" : "?";
  return `${source}${glue}${query.replace(/^\?/, "")}`;
};

const compileTemplate = (template, values) =>
  String(template || "").replace(/\{(\w+)\}/g, (_, key) =>
    encodeURIComponent(values[key] ?? ""),
  );

const localVariantUrl = (url, width, format, quality) => {
  const source = normalizeImageUrl(url);
  const marker = "/uploads/";
  const index = source.indexOf(marker);
  if (index === -1) return "";
  const filename = decodeURIComponent(source.slice(index + marker.length).split(/[?#]/)[0]);
  if (!filename || filename.includes("/")) return "";
  const base = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "");
  return `${env.appUrl.replace(/\/$/, "")}/uploads/variants/${base}-${width}w-q${quality}.${format === "jpeg" ? "jpg" : format}`;
};

const imageVariantUrl = (url, options = {}) => {
  const source = normalizeImageUrl(url);
  if (!source) return "";
  const width = Number(options.width || 0);
  const height = Number(options.height || width || 0);
  const format = options.format || env.imageOptimizer.format;
  const quality = Number(options.quality || env.imageOptimizer.quality || 78);

  if (!isHttpUrl(source)) return source;

  if (env.imageOptimizer.urlTemplate) {
    return compileTemplate(env.imageOptimizer.urlTemplate, {
      url: source,
      width,
      height,
      format,
    });
  }

  if (env.imageOptimizer.queryTemplate) {
    return appendQuery(
      source,
      compileTemplate(env.imageOptimizer.queryTemplate, {
        width,
        height,
        format,
      }),
    );
  }

  const local = localVariantUrl(source, width, format, quality);
  if (local) return local;

  return source;
};

const imageDynamicVariantUrl = (imageId, options = {}) => {
  if (!imageId) return "";
  const width = Number(options.width || env.imageOptimizer.listWidth || 420);
  const format = options.format || env.imageOptimizer.format;
  const quality = Number(options.quality || env.imageOptimizer.quality || 78);
  return `${env.appUrl.replace(/\/$/, "")}/api/images/${imageId}/thumbnail?w=${width}&format=${encodeURIComponent(format)}&q=${quality}`;
};

const avatarVariants = (avatarUrl) => {
  const source = normalizeImageUrl(avatarUrl);
  if (!source) {
    return {
      avatar_thumbnail_url: null,
      avatar_srcset: null,
    };
  }
  const small = imageVariantUrl(source, { width: 80, height: 80 });
  const large = imageVariantUrl(source, { width: 160, height: 160 });
  if (small === source && large === source) {
    return {
      avatar_thumbnail_url: null,
      avatar_srcset: null,
    };
  }
  return {
    avatar_thumbnail_url: small,
    avatar_srcset: small && large ? `${small} 1x, ${large} 2x` : null,
  };
};

const imageThumbnailUrl = (image, width = env.imageOptimizer.listWidth || 420) => {
  if (!image) return "";
  const imageUrl = normalizeImageUrl(typeof image === "string" ? image : image.image_url);
  const thumbnailUrl = normalizeImageUrl(typeof image === "string" ? "" : image.thumbnail_url);
  if (thumbnailUrl && thumbnailUrl !== imageUrl) {
    return imageVariantUrl(thumbnailUrl, { width, height: width });
  }
  return imageDynamicVariantUrl(typeof image === "string" ? null : image.id, { width });
};

module.exports = {
  normalizeImageUrl,
  imageDynamicVariantUrl,
  imageVariantUrl,
  avatarVariants,
  imageThumbnailUrl,
};