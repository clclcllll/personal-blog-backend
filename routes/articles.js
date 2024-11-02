// routes/articles.js

const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body, param, query } = require('express-validator');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// 获取文章列表
router.get('/', [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('category').optional().isMongoId(),
    query('tag').optional().isMongoId(),
    query('keyword').optional().trim().escape(),
], articleController.getArticles);

// 获取文章详情
router.get('/:id', [
    param('id').isMongoId().withMessage('无效的文章ID'),
], articleController.getArticleById);

// 创建文章（需要认证）
router.post('/', authMiddleware, [
    body('title').notEmpty().withMessage('标题不能为空').trim().escape(),
    body('content').notEmpty().withMessage('内容不能为空'),
    body('category').optional().isMongoId().withMessage('无效的分类ID'),
    body('tags').optional().isArray(),
], articleController.createArticle);

// 编辑文章（需要认证）
router.put('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('无效的文章ID'),
    body('title').notEmpty().withMessage('标题不能为空').trim().escape(),
    body('content').notEmpty().withMessage('内容不能为空'),
    body('category').optional().isMongoId().withMessage('无效的分类ID'),
    body('tags').optional().isArray(),
], articleController.updateArticle);

// 删除文章（需要认证）
router.delete('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('无效的文章ID'),
], articleController.deleteArticle);

// 上传Markdown文件发布文章（需要认证）
router.post('/:id/upload', authMiddleware, upload.single('file'), [
    param('id').isMongoId().withMessage('无效的文章ID'),
], articleController.uploadMarkdown);

module.exports = router;
