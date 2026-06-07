/**
 * Async Handler Middleware - 异步处理中间件
 * 统一处理 Express 异步路由处理函数的异常，自动将异常传递给错误处理中间件
 * 
 * @param {Function} handler - 异步路由处理函数
 * @returns {Function} Express 中间件函数
 */

module.exports = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
