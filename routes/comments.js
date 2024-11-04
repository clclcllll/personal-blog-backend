const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware'); // 引入 adminMiddleware
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
    body('parentId')
        .optional({ nullable: true })
        .custom((value) => {
            if (value === null) return true;
            return /^[0-9a-fA-F]{24}$/.test(value);
        })
        .withMessage('无效的父评论ID'),
], commentController.addComment);

// 获取所有文章的所有评论（仅管理员可访问）
router.get('/admin/all', authMiddleware, adminMiddleware, commentController.getAllComments);


// 删除评论（需要认证和管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, [
    param('id').isMongoId().withMessage('无效的评论ID'),
], commentController.deleteComment);

module.exports = router;
