/**
 * Auth Service - 用户认证服务
 * 提供用户注册、登录、登出及用户信息获取功能
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const env = require("../../config/env");
const { User, UserStat } = require("../../models");
const { badRequest, conflict, unauthorized } = require("../../utils/httpError");
const { avatarVariants, normalizeImageUrl } = require("../../utils/imageUrl");
const { writeLog } = require("../logService");

// 公开的用户信息字段列表
const publicUserFields = [
  "id",
  "username",
  "email",
  "role",
  "status",
  "avatar_url",
  "last_login_at",
  "created_at",
];

/**
 * 序列化用户公开信息
 * @param {User} user - 用户实例
 * @returns {Object} 用户公开信息对象
 */
const serializeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  status: user.status,
  avatar_url: normalizeImageUrl(user.avatar_url),
  ...avatarVariants(user.avatar_url),
  last_login_at: user.last_login_at,
  created_at: user.created_at,
});

/**
 * 序列化用户统计数据
 * @param {UserStat} stats - 用户统计实例
 * @returns {Object} 用户统计对象
 */
const serializeStats = (stats) => ({
  favorite_count: stats?.favorite_count || 0,
  download_count: stats?.download_count || 0,
  view_count: stats?.view_count || 0,
  ai_conversation_count: stats?.ai_conversation_count || 0,
  ai_message_count: stats?.ai_message_count || 0,
});

const signAuthToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

/**
 * 获取用户信息及统计数据
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 用户信息及统计数据
 */
const getUserWithStats = async (userId) => {
  const user = await User.findOne({
    where: { id: userId, deleted_at: null },
    attributes: publicUserFields,
    include: [{ model: UserStat, as: "stats" }],
  });
  if (!user) throw unauthorized("当前登录用户不存在");
  return { user: serializeUser(user), stats: serializeStats(user.stats) };
};

/**
 * 用户注册
 * @param {Object} payload - 注册信息 {username, email, password}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} token 和新用户信息
 */
const register = async (payload, req) => {
  const { username, email, password } = payload;
  if (!username || !password) throw badRequest("用户名和密码不能为空");
  if (password.length < 6) throw badRequest("密码长度不能少于 6 位");

  const duplicate = await User.findOne({
    where: {
      deleted_at: null,
      [Op.or]: [{ username }, ...(email ? [{ email }] : [])],
    },
  });
  if (duplicate?.username === username) throw conflict("用户名已被使用");
  if (email && duplicate?.email === email) throw conflict("邮箱已被使用");

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email: email || null,
    password_hash,
    role: "user",
    status: "normal",
  });
  await UserStat.create({ user_id: user.id });
  await writeLog({
    actor: { id: user.id, username: user.username, role: user.role },
    action_type: "USER_REGISTER",
    target_type: "auth",
    target_id: user.id,
    title: "用户注册",
    content: `${user.username} 注册了账号`,
    ip: req.ip,
  });

  const fresh = await getUserWithStats(user.id);
  return { token: signAuthToken(user), ...fresh };
};

/**
 * 用户登录
 * @param {Object} payload - 登录信息 {account, password}
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} token 和用户信息
 */
const login = async (payload, req) => {
  const { account, password } = payload;
  if (!account || !password) throw badRequest("账号和密码不能为空");

  const user = await User.findOne({
    where: {
      deleted_at: null,
      [Op.or]: [{ username: account }, { email: account }],
    },
    include: [{ model: UserStat, as: "stats" }],
  });
  if (!user) throw unauthorized("账号或密码错误");
  if (user.status !== "normal")
    throw unauthorized("账号已被禁用，请联系管理员");

  const matched = await bcrypt.compare(password, user.password_hash);
  if (!matched) throw unauthorized("账号或密码错误");

  await user.update({ last_login_at: new Date() });
  await writeLog({
    actor: user,
    action_type: "USER_LOGIN",
    target_type: "auth",
    target_id: user.id,
    title: "用户登录",
    content: `${user.username} 登录了系统`,
    ip: req.ip,
  });

  const fresh = await getUserWithStats(user.id);
  return { token: signAuthToken(user), ...fresh };
};

/**
 * 用户退出登录
 * @param {Object} user - 当前用户对象
 * @param {Object} req - Express 请求对象
 * @returns {Promise<Object>} 空对象
 */
const logout = async (user, req) => {
  if (!user) return {};

  await writeLog({
    actor: user,
    action_type: "USER_LOGOUT",
    target_type: "auth",
    target_id: user.id,
    title: "退出登录",
    content: `${user.username} 退出登录`,
    ip: req.ip,
  });
  return {};
};

module.exports = {
  register,
  login,
  logout,
  getUserWithStats,
  serializeUser,
  serializeStats,
};
