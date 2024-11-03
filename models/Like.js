// models/Like.js

const mongoose = require('mongoose');

const likeSchema =new mongoose.Schema({
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// 添加唯一索引，防止重复点赞
likeSchema.index({ article: 1, user: 1 }, { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } });
likeSchema.index({ article: 1, ipAddress: 1 }, { unique: true, partialFilterExpression: { ipAddress: { $type: 'string' } } });

module.exports = mongoose.model('Like', likeSchema);
