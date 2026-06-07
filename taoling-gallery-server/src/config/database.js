/**
 * Database Configuration - 数据库配置
 * 创建 Sequelize 实例，配置数据库连接和连接池
 * 
 * 安全说明：Sequelize 使用参数绑定生成 SQL，接口层不拼接原始 SQL，降低 SQL 注入风险
 */

const { Sequelize } = require('sequelize');
const env = require('./env');

/**
 * Sequelize 实例
 * @type {Sequelize}
 */
const sequelize = new Sequelize(env.db.database, env.db.username, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  timezone: '+08:00',
  logging: env.nodeEnv === 'development' ? false : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
