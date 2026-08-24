/**
 * Auth Cookie Utilities - 认证 Cookie 工具
 * 统一管理 JWT Cookie 的读写和过期时间换算
 */

const env = require("../config/env");

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.cookie.secure,
  sameSite: env.cookie.sameSite,
  maxAge: env.cookie.maxAgeMs,
  path: "/",
  ...(env.cookie.domain ? { domain: env.cookie.domain } : {}),
});

const getClearCookieOptions = () => {
  const { _maxAge, ...options } = getCookieOptions();
  return options;
};

const parseCookieHeader = (header = "") =>
  header.split(";").reduce((cookies, part) => {
    const index = part.indexOf("=");
    if (index === -1) return cookies;

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});

const readAuthCookie = (req) => {
  const cookies = parseCookieHeader(req.headers.cookie || "");
  return cookies[env.cookie.name] || null;
};

const setAuthCookie = (res, token) => {
  res.cookie(env.cookie.name, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
  res.clearCookie(env.cookie.name, getClearCookieOptions());
};

module.exports = {
  readAuthCookie,
  setAuthCookie,
  clearAuthCookie,
};
