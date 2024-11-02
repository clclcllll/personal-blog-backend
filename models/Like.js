// models/Like.js

const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 登录用户可关联用户ID
    ipAddress: { type: String }, // 未登录用户的IP地址
}, { timestamps: true });

// 唯一索引，防止同一用户或 IP 对同一文章重复点赞
likeSchema.index({ article: 1, user: 1 }, { unique: true, sparse: true });
likeSchema.index({ article: 1, ipAddress: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Like', likeSchema);
