// models/Comment.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // 支持两级评论
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
