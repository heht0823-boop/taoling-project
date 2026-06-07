/**
 * Server Entry - 服务入口文件
 * 启动桃灵图库后端服务，包括数据库连接和管理员用户初始化
 */

const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');
const { ensureAdminUser } = require('./services/bootstrapService');

/**
 * 启动服务
 * 1. 验证数据库连接
 * 2. 确保管理员用户存在
 * 3. 启动 Express 服务器
 */
const start = async () => {
  // 验证数据库连接
  await sequelize.authenticate();
  
  // 确保管理员用户存在（首次启动时创建）
  await ensureAdminUser();
  
  // 启动服务器
  app.listen(env.port, () => {
    console.log(`桃灵图库后端服务已启动：http://localhost:${env.port}`);
  });
};

// 启动服务并处理启动失败
start().catch((error) => {
  console.error('桃灵图库后端服务启动失败：', error);
  process.exit(1);
});
