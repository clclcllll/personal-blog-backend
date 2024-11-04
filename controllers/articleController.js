// controllers/articleController.js

const { validationResult } = require('express-validator');
const Article = require('../models/Article');
const User = require('../models/User');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Like = require('../models/Like'); // 引入 Like 模型
const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');
const md = new markdownIt();

// 获取文章列表
exports.getArticles = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, tag, keyword } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (tag) filter.tags = tag;
        if (keyword) {
            filter.$or = [
                { title: new RegExp(keyword, 'i') },
                { content: new RegExp(keyword, 'i') },
            ];
        }

        const total = await Article.countDocuments(filter);
        const articles = await Article.find(filter)
            .populate('author', 'username')
            .populate('category', 'name')
            .populate('tags', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            articles,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        next(err);
    }
};

// 获取文章详情
exports.getArticleById = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'username')
            .populate('category', 'name')
            .populate('tags', 'name');


        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        // 判断当前用户是否已经点赞
        let liked = false;
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.ip;

        if (userId) {
            // 用户已登录，按 userId 查找
            const existingLike = await Like.findOne({ article: article._id, user: userId });
            if (existingLike) liked = true;
        } else {
            // 用户未登录，按 ipAddress 查找
            const existingLike = await Like.findOne({ article: article._id, ipAddress: ipAddress });
            if (existingLike) liked = true;
        }

        // 增加阅读次数
        article.views += 1;
        await article.save();

        res.json({ article , liked});
    } catch (err) {
        next(err);
    }
};

// 创建文章
exports.createArticle = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content, category, tags } = req.body;

        // 解析 Markdown 内容为 HTML
        const htmlContent = md.render(content);

        const article = new Article({
            title,
            content,
            htmlContent,
            author: req.user.id,
            category,
            tags,
        });

        await article.save();

        res.status(201).json({ message: '文章创建成功', article });
    } catch (err) {
        next(err);
    }
};

// 编辑文章
exports.updateArticle = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content, category, tags } = req.body;

        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        // 检查用户是否有权限编辑文章（可选，根据需要）
        if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: '无权编辑此文章' });
        }

        // 更新文章内容
        article.title = title;
        article.content = content;
        article.htmlContent = md.render(content);
        article.category = category;
        article.tags = tags;

        await article.save();

        res.json({ message: '文章更新成功', article });
    } catch (err) {
        next(err);
    }
};

// 删除文章
exports.deleteArticle = async (req, res, next) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        // 检查用户是否有权限删除文章
        if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: '无权删除此文章' });
        }

        // 使用 findByIdAndDelete 来删除文档
        await Article.findByIdAndDelete(req.params.id);

        res.json({ message: '文章已删除' });
    } catch (err) {
        console.error('Error deleting article:', err); // 输出详细的错误信息
        next(err);
    }
};

// 上传 Markdown 文件发布文章
exports.uploadMarkdown = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '未上传文件' });
        }

        const filePath = path.join(__dirname, '..', req.file.path);
        const content = fs.readFileSync(filePath, 'utf-8');

        // 删除临时文件
        fs.unlinkSync(filePath);

        // 解析 Markdown 内容为 HTML
        const htmlContent = md.render(content);

        // 更新文章内容
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        article.content = content;
        article.htmlContent = htmlContent;

        await article.save();

        res.json({ message: '文章更新成功', article });
    } catch (err) {
        next(err);
    }
};
