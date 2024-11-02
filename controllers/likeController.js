// controllers/likeController.js

const Like = require('../models/Like');
const Article = require('../models/Article');

// 点赞文章
exports.likeArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.ip;

        // 检查是否已点赞
        const existingLike = await Like.findOne({
            article: articleId,
            $or: [
                { user: userId },
                { ipAddress: userId ? null : ipAddress },
            ],
        });

        if (existingLike) {
            return res.status(400).json({ error: '您已点赞过该文章' });
        }

        const like = new Like({
            article: articleId,
            user: userId,
            ipAddress: userId ? null : ipAddress,
        });

        await like.save();

        // 更新文章的点赞数量
        const article = await Article.findById(articleId);
        if (article) {
            article.likes += 1;
            await article.save();
        }

        res.json({ message: '点赞成功', likes: article.likes });
    } catch (err) {
        next(err);
    }
};

// 取消点赞
exports.unlikeArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.ip;

        console.log("取消点赞 - 用户ID:", userId);
        console.log("取消点赞 - IP地址:", ipAddress);

        // 查找点赞记录
        const like = await Like.findOne({
            article: articleId,
            $or: [
                { user: userId },
                { ipAddress: userId ? null : ipAddress },
            ],
        });

        if (!like) {
            console.warn("未找到点赞记录");
            return res.status(400).json({ error: '您尚未点赞该文章' });
        }

        await like.remove();

        // 更新文章的点赞数量
        const article = await Article.findById(articleId);
        if (article) {
            article.likes = Math.max(0, article.likes - 1);
            await article.save();
        }

        res.json({ message: '已取消点赞', likes: article.likes });
    } catch (err) {
        next(err);
    }
};

