/**
 * Content Security Service - 内容安全服务
 * 封装阿里云内容安全API，提供文本和图片审核功能
 */

const crypto = require("crypto");
const https = require("https");
const env = require("../config/env");
const { badRequest } = require("../utils/httpError");

/**
 * URL编码（符合阿里云签名要求）
 * @param {string} value - 待编码值
 * @returns {string} 编码后的字符串
 */
const percentEncode = (value) =>
  encodeURIComponent(value)
    .replace(/\+/g, "%20")
    .replace(/\*/g, "%2A")
    .replace(/%7E/g, "~");

/**
 * 解析JSON（安全处理）
 * @param {string} value - JSON字符串
 * @returns {Object} 解析结果
 */
const parseJson = (value) => {
  if (!value || typeof value !== "string") return value || {};
  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
};

/**
 * 规范化审核结果
 * 统一不同API返回格式
 * @param {Object} raw - 原始响应
 * @returns {Object} 规范化结果 {passed, status, score, raw}
 */
const normalizeResult = (raw) => {
  const data = raw.Data || raw.data || {};
  const parsedData = parseJson(data);
  const firstResult =
    parsedData.Result?.[0] ||
    parsedData.result?.[0] ||
    parsedData.Results?.[0] ||
    parsedData.results?.[0] ||
    {};
  const labels = [
    parsedData.Label,
    parsedData.label,
    parsedData.RiskLevel,
    parsedData.riskLevel,
    parsedData.suggestion,
    parsedData.Suggestion,
    firstResult.label,
    firstResult.riskLevel,
    firstResult.suggestion,
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase());
  const score =
    Number(
      parsedData.Score ??
        parsedData.score ??
        parsedData.RiskScore ??
        parsedData.riskScore ??
        firstResult.score ??
        0,
    ) || 0;
  const blocked =
    labels.some((item) => ["block", "high", "deny", "review"].includes(item)) ||
    score >= 80;

  return {
    passed: !blocked,
    status: blocked ? "block" : "success",
    score,
    raw,
  };
};

/**
 * 发送阿里云API请求（内部方法）
 * @param {string} action - API动作
 * @param {string} serviceName - 服务名称
 * @param {Object} serviceParameters - 服务参数
 * @returns {Promise<Object>} API响应
 */
const requestAliyun = (action, serviceName, serviceParameters) => {
  const config = env.aliContentSecurity;
  if (!config.accessKeyId || !config.accessKeySecret) {
    throw badRequest("阿里云内容安全 AccessKey 未配置");
  }

  const params = {
    Action: action,
    Version: config.apiVersion,
    Format: "JSON",
    AccessKeyId: config.accessKeyId,
    SignatureMethod: "HMAC-SHA1",
    SignatureVersion: "1.0",
    SignatureNonce: crypto.randomUUID(),
    Timestamp: new Date().toISOString(),
    RegionId: config.regionId,
    Service: serviceName,
    ServiceParameters: JSON.stringify(serviceParameters),
  };

  const canonicalized = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");
  const stringToSign = `POST&${percentEncode("/")}&${percentEncode(canonicalized)}`;
  const signature = crypto
    .createHmac("sha1", `${config.accessKeySecret}&`)
    .update(stringToSign)
    .digest("base64");
  const body = `${canonicalized}&Signature=${percentEncode(signature)}`;

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: config.endpoint,
        method: "POST",
        path: "/",
        timeout: config.timeoutMs,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let payload = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          payload += chunk;
        });
        res.on("end", () => {
          try {
            const json = JSON.parse(payload || "{}");
            if (
              res.statusCode >= 400 ||
              (json.Code && String(json.Code) !== "200")
            ) {
              return reject(
                badRequest(
                  json.Message ||
                    json.Msg ||
                    json.message ||
                    json.msg ||
                    "阿里云内容安全审核失败",
                  json,
                ),
              );
            }
            return resolve(json);
          } catch (error) {
            return reject(error);
          }
        });
      },
    );
    req.on("timeout", () => req.destroy(badRequest("阿里云内容安全审核超时")));
    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

/**
 * 文本内容审核
 * @param {Object} params - 参数
 * @param {string} params.content - 待审核文本
 * @param {string} params.dataId - 数据标识
 * @param {number} params.userId - 用户ID
 * @returns {Promise<Object>} 审核结果
 */
const checkText = async ({ content, dataId, userId }) => {
  const raw = await requestAliyun(
    env.aliContentSecurity.textAction,
    env.aliContentSecurity.textServiceName,
    {
      content,
      dataId: String(dataId || Date.now()),
      accountId: userId ? String(userId) : undefined,
    },
  );
  return normalizeResult(raw);
};

/**
 * 图片内容审核
 * @param {Object} params - 参数
 * @param {string} params.imageUrl - 图片URL
 * @param {string} params.dataId - 数据标识
 * @param {number} params.userId - 用户ID
 * @returns {Promise<Object>} 审核结果
 */
const checkImage = async ({ imageUrl, dataId, userId }) => {
  const raw = await requestAliyun(
    "ImageModeration",
    env.aliContentSecurity.imageServiceName,
    {
      imageUrl,
      dataId: String(dataId || Date.now()),
      accountId: userId ? String(userId) : undefined,
    },
  );
  return normalizeResult(raw);
};

module.exports = { checkText, checkImage };
