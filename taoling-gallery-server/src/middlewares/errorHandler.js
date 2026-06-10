/**
 * Error Handler Middleware - 错误处理中间件
 * 集中处理所有控制器抛出的错误，保证接口返回统一的 code/message/data 三段式格式
 */

const { HttpError } = require("../utils/httpError");

/**
 * 全局错误处理中间件
 * @param {Error} err - 错误对象
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - 下一个中间件
 */
const errorHandler = (err, req, res) => {
  // 处理自定义 HttpError
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      data: err.details || {},
    });
  }

  // 处理 Sequelize 唯一约束错误
  if (err.name === "SequelizeUniqueConstraintError") {
    return res
      .status(409)
      .json({ code: 409, message: "数据已存在，请检查唯一字段", data: {} });
  }

  // 处理 Sequelize 验证错误
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      code: 400,
      message: "参数校验失败",
      data: { errors: err.errors.map((item) => item.message) },
    });
  }

  // 处理带有 statusCode 的自定义错误（如 Service 层抛出的错误）
  if (err.statusCode && typeof err.statusCode === "number") {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      data: {},
    });
  }

  // 未知错误，记录日志并返回通用错误
  console.error(err);
  return res
    .status(500)
    .json({ code: 500, message: "服务器内部错误，请稍后再试", data: {} });
};

module.exports = errorHandler;
