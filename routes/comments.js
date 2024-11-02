// routes/comments.js

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body, param, query } = require('express-validator');

// 获取评论列表
router.get('/', [
    query('articleId').isMongoId().withMessage('无效的文章ID'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
], commentController.getComments);

// 添加评论（需要登录）
router.post('/', authMiddleware, [
    body('articleId').isMongoId().withMessage('无效的文章ID'),
    body('content').notEmpty().withMessage('评论内容不能为空'),
    body('parentId').optional().isMongoId().withMessage('无效的父评论ID'),
], commentController.addComment);

// 删除评论（需要认证，只有博主可以删除）
router.delete('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('无效的评论ID'),
], commentController.deleteComment);

module.exports = router;
