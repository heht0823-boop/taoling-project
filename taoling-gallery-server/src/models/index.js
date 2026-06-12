/**
 * 模型索引文件
 * 统一管理所有 Sequelize 模型的导入和关联关系定义
 * 关联关系统一放在此处，避免模型文件之间互相 require 造成循环依赖
 */

const sequelize = require('../config/database');
const User = require('./User');
const UserStat = require('./UserStat');
const Category = require('./Category');
const Tag = require('./Tag');
const Image = require('./Image');
const ImageTag = require('./ImageTag');
const Favorite = require('./Favorite');
const DownloadRecord = require('./DownloadRecord');
const ImageViewRecord = require('./ImageViewRecord');
const AiConversation = require('./AiConversation');
const AiMessage = require('./AiMessage');
const AiMemory = require('./AiMemory');
const AdminLog = require('./AdminLog');
const UserMessage = require('./UserMessage');
const WeatherLiveCache = require('./WeatherLiveCache');
const WeatherForecastCache = require('./WeatherForecastCache');

// 用户与用户统计关联
User.hasOne(UserStat, { foreignKey: 'user_id', as: 'stats' });
UserStat.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 分类与图片关联
Category.hasMany(Image, { foreignKey: 'category_id', as: 'images' });
Image.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// 图片与标签多对多关联
Image.belongsToMany(Tag, { through: ImageTag, foreignKey: 'image_id', otherKey: 'tag_id', as: 'tags' });
Tag.belongsToMany(Image, { through: ImageTag, foreignKey: 'tag_id', otherKey: 'image_id', as: 'images' });
Image.hasMany(ImageTag, { foreignKey: 'image_id', as: 'imageTags' });
ImageTag.belongsTo(Image, { foreignKey: 'image_id', as: 'image' });
ImageTag.belongsTo(Tag, { foreignKey: 'tag_id', as: 'tag' });

// 用户收藏关联
User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Favorite.belongsTo(Image, { foreignKey: 'image_id', as: 'image' });

// 用户下载记录关联
User.hasMany(DownloadRecord, { foreignKey: 'user_id', as: 'downloads' });
DownloadRecord.belongsTo(Image, { foreignKey: 'image_id', as: 'image' });

// 图片浏览记录关联
Image.hasMany(ImageViewRecord, { foreignKey: 'image_id', as: 'viewRecords' });
ImageViewRecord.belongsTo(Image, { foreignKey: 'image_id', as: 'image' });

// AI 会话关联
User.hasMany(AiConversation, { foreignKey: 'user_id', as: 'aiConversations' });
AiConversation.hasMany(AiMessage, { foreignKey: 'conversation_id', as: 'messages' });
AiMessage.belongsTo(AiConversation, { foreignKey: 'conversation_id', as: 'conversation' });
User.hasMany(AiMemory, { foreignKey: 'user_id', as: 'aiMemories' });
AiConversation.hasMany(AiMemory, { foreignKey: 'conversation_id', as: 'memories' });
AiMemory.belongsTo(AiConversation, { foreignKey: 'conversation_id', as: 'conversation' });

// 用户留言关联
User.hasMany(UserMessage, { foreignKey: 'user_id', as: 'messages' });
UserMessage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserMessage.hasMany(UserMessage, { foreignKey: 'parent_id', as: 'replies' });
UserMessage.belongsTo(UserMessage, { foreignKey: 'parent_id', as: 'parent' });

module.exports = {
  sequelize,
  User,
  UserStat,
  Category,
  Tag,
  Image,
  ImageTag,
  Favorite,
  DownloadRecord,
  ImageViewRecord,
  AiConversation,
  AiMessage,
  AiMemory,
  AdminLog,
  UserMessage,
  WeatherLiveCache,
  WeatherForecastCache,
};
