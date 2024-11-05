// controllers/commentController.js

const { validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Article = require('../models/Article');

// 获取评论列表
exports.getComments = async (req, res, next) => {
    try {
        const { articleId, page = 1, limit = 10 } = req.query;

        // 获取顶级评论
        const total = await Comment.countDocuments({ article: articleId, parent: null });
        const topComments = await Comment.find({ article: articleId, parent: null })
            .populate('user', 'username')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));


        // 为每个顶级评论递归构建平铺的评论结构
        const commentsWithFlattenedReplies = await Promise.all(
            topComments.map(async (comment) => {
                const flattenedReplies = await buildFlattenedCommentTree(comment._id);
                return {
                    ...comment.toObject(),
                    replies: flattenedReplies,
                };
            })
        );

        // 在这里打印出生成的评论列表数据
        // console.log(JSON.stringify({
        //     comments: commentsWithFlattenedReplies,
        //     total,
        //     page: parseInt(page),
        //     pages: Math.ceil(total / limit),
        // }, null, 2));  // 使用JSON.stringify并设置缩进格式方便阅读

        res.json({
            comments: commentsWithFlattenedReplies,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });

    } catch (err) {
        next(err);
    }
};


// 递归构建平铺评论树的辅助函数，将所有嵌套评论平铺到顶级评论的 replies 数组
async function buildFlattenedCommentTree(commentId, parentUsername = null) {
    const replies = await Comment.find({ parent: commentId })
        .populate('user', 'username')
        .sort({ createdAt: -1 });

    let flattenedReplies = [];

    for (const reply of replies) {
        const replyObject = reply.toObject();
        replyObject.replies = []; // 清空嵌套评论的 `replies`

        // 设置 `replyToUsername` 为传入的父用户名
        replyObject.replyToUsername = parentUsername;

        // 递归获取所有子级评论
        const nestedReplies = await buildFlattenedCommentTree(reply._id,reply.user.username);

        // 将当前回复以及其所有嵌套回复平铺到顶层结构中
        flattenedReplies.push(replyObject);

        // 将递归生成的子评论加入到平铺结构中
        flattenedReplies = flattenedReplies.concat(nestedReplies);
    }

    return flattenedReplies;
}


// 添加评论
exports.addComment = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);// 获取验证结果
        //打印验证结果
        if (!errors.isEmpty()) { // 如果验证结果不为空
            return res.status(400).json({ errors: errors.array() });// 返回错误信息
        }

        const { articleId, content, parentId } = req.body;

        // 检查文章是否存在
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        let replyToUsername = '';

        if (parentId) {
            const parentComment = await Comment.findById(parentId).populate('user', 'username parent');
            if (!parentComment) {
                return res.status(404).json({ error: '父评论不存在' });
            }
            if (parentComment.parent) {
                // 如果父评非顶级评论，则设置 replyToUsername
                replyToUsername = parentComment.user.username;
            } else {
                // 父评论是顶级评论，不设置 replyToUsername
                replyToUsername = '';
            }
        }

        const comment = new Comment({
            article: articleId,
            user: req.user.id,
            content,
            parent: parentId || null, // 设置为直接的 parentId
        });


        await comment.save();

        // 更新文章的评论数量
        article.comments += 1;
        await article.save();

        // 填充用户信息
        await comment.populate('user', 'username');

        console.log(JSON.stringify(comment, null, 2));  // 使用JSON.stringify并设置缩进格式方便阅读


        res.status(201).json({ message: '评论添加成功', comment, replyToUsername });
    } catch (err) {
        next(err);
    }
};

// 删除评论
exports.deleteComment = async (req, res, next) => {
    try {
        const commentId = req.params.id;
        console.log(`删除评论ID: ${commentId}`);

        const comment = await Comment.findById(commentId);
        if (!comment) {
            console.log('评论不存在');
            return res.status(404).json({ error: '评论不存在' });
        }

        // 检查用户是否有权限删除评论（只有博主或管理员可以删除）
        if (req.user.role !== 'admin') {
            console.log('无权删除此评论');
            return res.status(403).json({ error: '无权删除此评论' });
        }

        const articleId = comment.article;
        await Comment.deleteOne({ _id: commentId }); // 使用 deleteOne 替代 remove
        console.log('评论已成功删除');

        // 更新文章的评论数量
        const article = await Article.findById(articleId);
        if (article) {
            article.comments -= 1;
            await article.save();
            console.log('文章评论数量已更新');
        }

        res.json({ message: '评论已删除' });
    } catch (err) {
        console.error('删除评论时出错:', err);
        next(err);
    }
};


// 获取所有文章的所有评论（管理员专用）
exports.getAllComments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const total = await Comment.countDocuments({});
        const comments = await Comment.find({})
            .populate('user', 'username')
            .populate('article', 'title') // 显示文章标题
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


