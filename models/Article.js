// models/Article.js

const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    htmlContent: { type: String }, // Markdown 渲染的 HTML 内容
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
