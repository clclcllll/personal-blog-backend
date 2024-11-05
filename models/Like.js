//moudels/Like.js
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ipAddress: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// // 添加唯一索引，防止重复点赞
// // 若 `user` 存在，则在 `article` 和 `user` 组合上建立唯一索引
// likeSchema.index(
//     { article: 1, user: 1 },
//     { unique: true, partialFilterExpression: { user: { $exists: true } } }
// );
//
// // 若 `ipAddress` 存在，则在 `article` 和 `ipAddress` 组合上建立唯一索引
// likeSchema.index(
//     { article: 1, ipAddress: 1 },
//     { unique: true, partialFilterExpression: { ipAddress: { $exists: true } } }
// );

module.exports = mongoose.model('Like', likeSchema);
