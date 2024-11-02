// routes/likes.js

const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');
const { param } = require('express-validator');

// 点赞文章
router.post('/:articleId', [
    param('articleId').isMongoId().withMessage('无效的文章ID'),
], likeController.likeArticle);

// 取消点赞
router.delete('/:articleId', [
    param('articleId').isMongoId().withMessage('无效的文章ID'),
], likeController.unlikeArticle);

module.exports = router;
