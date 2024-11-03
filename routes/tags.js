///routes/tags.js
const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware'); // 引入 adminMiddleware
const { body, param } = require('express-validator');

// 获取标签列表
router.get('/', tagController.getTags);

// 获取标签详情
router.get('/:id', [
    param('id').isMongoId().withMessage('无效的标签ID'),
], tagController.getTagById);

// 创建标签（需要认证和管理员权限）
router.post('/', authMiddleware, adminMiddleware, [
    body('name').notEmpty().withMessage('标签名称不能为空').trim().escape(),
], tagController.createTag);

// 编辑标签（需要认证和管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, [
    param('id').isMongoId().withMessage('无效的标签ID'),
    body('name').notEmpty().withMessage('标签名称不能为空').trim().escape(),
], tagController.updateTag);

// 删除标签（需要认证和管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, [
    param('id').isMongoId().withMessage('无效的标签ID'),
], tagController.deleteTag);

module.exports = router;
