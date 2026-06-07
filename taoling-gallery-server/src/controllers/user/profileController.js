const { success } = require('../../utils/response');
const authService = require('../../services/user/authService');
const profileService = require('../../services/user/profileService');

exports.profile = async (req, res) => success(res, await authService.getUserWithStats(req.user.id));
exports.summary = async (req, res) => success(res, await authService.getUserWithStats(req.user.id));
exports.updateProfile = async (req, res) => success(res, await profileService.updateProfile(req.user.id, req.body, req), '资料修改成功');
exports.updatePassword = async (req, res) => success(res, await profileService.updatePassword(req.user.id, req.body), '密码修改成功');
exports.updateAvatar = async (req, res) => success(res, await profileService.updateAvatar(req.user.id, req.body, req.file, req), '头像修改成功');
