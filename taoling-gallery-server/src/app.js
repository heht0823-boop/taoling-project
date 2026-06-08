/**
 * Express Application - Express 应用入口
 * 配置 Express 中间件、路由和错误处理
 */

const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const env = require("./config/env");

/**
 * Express 应用实例
 * @type {express.Application}
 */
const app = express();

// 配置信任代理：仅信任第一层反向代理，避免限流中间件的 permissive trust proxy 警告
app.set("trust proxy", 1);

// 安全中间件：设置安全相关的 HTTP 响应头
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// 跨域中间件：允许前端携带 HttpOnly Cookie 访问 API
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.cors.origins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("当前来源不允许访问 API"));
    },
    credentials: true,
  }),
);

// JSON 解析中间件：限制请求体大小为 2MB
app.use(express.json({ limit: "2mb" }));

// URL 编码解析中间件：支持复杂请求参数
app.use(express.urlencoded({ extended: true }));

// 日志中间件：开发环境下输出请求日志
app.use(morgan("dev"));

// 请求限流中间件：每分钟最多 300 次请求
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// 静态文件服务：提供 uploads 目录下的文件访问，并开启长缓存降低重复图片载荷
app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "..", "uploads"), {
    immutable: true,
    maxAge: "30d",
  }),
);

// 健康检查接口
app.get("/health", (req, res) =>
  res.json({ code: 200, message: "success", data: { status: "ok" } }),
);

// API 路由
app.use("/api", routes);

// 404 处理：未匹配到任何路由
app.use((req, res) => {
  res
    .status(404)
    .json({ code: 404, message: "接口不存在，请检查请求路径和方法", data: {} });
});

// 全局错误处理中间件
app.use(errorHandler);

module.exports = app;
