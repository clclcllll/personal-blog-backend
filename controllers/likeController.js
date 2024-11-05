// controllers/likeController.js

const Like = require('../models/Like');
const Article = require('../models/Article');

// 点赞文章
exports.likeArticle = async (req, res, next) => {
    try {
        const { articleId } = req.params;
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.ip;

        // console.log("点赞 - 用户ID:", userId);
        // console.log("点赞 - IP地址:", ipAddress);
        // console.log("文章 ID:", articleId);


        // 构建查询条件
        let query;
        let likeData;

        if (userId) {
            // 用户已登录，按 userId 查找并存储
            query = { article: articleId, user: userId };
            likeData = { article: articleId, user: userId };
            console.log("11111111111111111");
        } else {
            // 用户未登录，按 ipAddress 查找并存储
            query = { article: articleId, ipAddress: ipAddress };
            likeData = { article: articleId, ipAddress: ipAddress };
        }

        // 检查是否已点赞
        const existingLike = await Like.findOne(query);

        if (existingLike) {
            return res.status(400).json({ error: '您已点赞过该文章' });
        }

        // 创建点赞记录
        const like = new Like(likeData);
        await like.save();

        // 更新文章的点赞数量
        const article = await Article.findById(articleId);
        if (article) {
            article.likes += 1;
            await article.save();
        }

        res.json({ message: '点赞成功', likes: article.likes, liked: true });
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
        let query;
        if (userId) {
            // 用户已登录，按 userId 查找
            query = { article: articleId, user: userId };
        } else {
            // 用户未登录，按 ipAddress 查找
            query = { article: articleId, ipAddress: ipAddress };
        }

        // 查找点赞记录
        const like = await Like.findOne(query);


        if (!like) {
            console.warn("未找到点赞记录");
            return res.status(400).json({ error: '您尚未点赞该文章' });
        }

        await like.deleteOne();


        // 更新文章的点赞数量
        const article = await Article.findById(articleId);
        if (article) {
            article.likes = Math.max(0, article.likes - 1);
            await article.save();
        }

        res.json({ message: '已取消点赞', likes: article.likes, liked: false });
    } catch (err) {
        next(err);
    }
};

