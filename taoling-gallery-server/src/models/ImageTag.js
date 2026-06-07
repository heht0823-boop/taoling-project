/**
 * ImageTag 模型 - 图片标签关联模型
 * 图片与标签的多对多关联中间表
 * 
 * @property {number} id - 关联ID（主键）
 * @property {number} image_id - 图片ID（关联 images.id）
 * @property {number} tag_id - 标签ID（关联 tags.id）
 * @property {Date} created_at - 创建时间
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImageTag = sequelize.define('ImageTag', {
  id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
  image_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  tag_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
}, {
  tableName: 'image_tags',
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = ImageTag;
