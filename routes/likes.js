// routes/likes.js

const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { param } = require('express-validator');
const optionalAuthMiddleware = require("../middlewares/optionalAuthMiddleware");

// 点赞文章
router.post('/:articleId',
    optionalAuthMiddleware, // 可选认证
    [
        param('articleId').isMongoId().withMessage('无效的文章ID'),
    ],
    likeController.likeArticle
);


// 取消点赞
router.delete('/:articleId',
    optionalAuthMiddleware, // 可选认证
    [
        param('articleId').isMongoId().withMessage('无效的文章ID'),
    ],
    likeController.unlikeArticle
);

module.exports = router;
