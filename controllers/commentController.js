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


        // 为每个顶级评论平铺所有嵌套的二级及后续评论
        const commentsWithFlattenedReplies = await Promise.all(
            topComments.map(async (comment) => {
                const flattenedReplies = await getFlattenedReplies(comment._id);
                return {
                    ...comment.toObject(),
                    replies: flattenedReplies, // 将所有嵌套评论平铺在二级评论的同一层级
                };
            })
        );

        // // 在这里打印出生成的评论列表数据
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


// 获取平铺的回复（从二级评论开始，将后续所有层级平铺到二级评论层级下）
async function getFlattenedReplies(commentId) {
    const replies = await Comment.find({ parent: commentId })
        .populate('user', 'username')
        .sort({ createdAt: -1 });

    let flattenedReplies = [];

    // 遍历每个二级评论，递归获取所有嵌套评论，并标注 replyToUsername
    for (const reply of replies) {
        const replyObject = reply.toObject();
        replyObject.replies = []; // 清空嵌套评论，防止继续递归

        // 获取当前评论的嵌套评论并设置 replyToUsername
        const nestedReplies = await getNestedReplies(reply._id, reply.user.username);
        flattenedReplies.push({
            ...replyObject,
            replies: [], // 清空嵌套层级的 `replies`
        });

        // 将嵌套的评论直接追加到平铺数组中
        flattenedReplies = flattenedReplies.concat(nestedReplies);
    }

    return flattenedReplies;
}

// 递归获取三级及以上评论，将三级及更深层级的评论平铺并设置 replyToUsername
async function getNestedReplies(commentId, parentUsername) {
    const replies = await Comment.find({ parent: commentId })
        .populate('user', 'username')
        .sort({ createdAt: -1 });

    // 将三级及更深层级的评论标记 replyToUsername，并平铺为二级评论的同级
    const flattenedNestedReplies = replies.map(reply => ({
        ...reply.toObject(),
        replyToUsername: parentUsername,
        replies: [], // 清空嵌套层级的 `replies`
    }));

    return flattenedNestedReplies;
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


