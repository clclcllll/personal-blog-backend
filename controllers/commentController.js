// controllers/commentController.js

const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Article = require('../models/Article');

// 获取评论列表
exports.getComments = async (req, res, next) => {
    try {
        const { articleId, page = 1, limit = 10 } = req.query;

        const total = await Comment.countDocuments({ article: articleId });
        const comments = await Comment.find({ article: articleId })
            .populate('user', 'username')
            .populate('parent')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            comments,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        next(err);
    }
};

// 添加评论
exports.addComment = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);// 获取验证结果
        //打印验证结果
        console.log(errors);
        if (!errors.isEmpty()) { // 如果验证结果不为空
            return res.status(400).json({ errors: errors.array() });// 返回错误信息
        }

        const { articleId, content, parentId } = req.body;

        // 检查文章是否存在
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        const comment = new Comment({
            article: articleId,
            user: req.user.id,
            content,
            parent: parentId || null,
        });

        await comment.save();

        // 更新文章的评论数量
        article.comments += 1;
        await article.save();

        res.status(201).json({ message: '评论添加成功', comment });
    } catch (err) {
        next(err);
    }
};

// 删除评论
exports.deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ error: '评论不存在' });
        }

        // 检查用户是否有权限删除评论（只有博主或管理员可以删除）
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: '无权删除此评论' });
        }

        await comment.remove();

        // 更新文章的评论数量
        const article = await Article.findById(comment.article);
        if (article) {
            article.comments -= 1;
            await article.save();
        }

        res.json({ message: '评论已删除' });
    } catch (err) {
        next(err);
    }
};
