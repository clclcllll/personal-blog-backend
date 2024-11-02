// routes/tags.js

const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body, param } = require('express-validator');

// 获取标签列表
router.get('/', tagController.getTags);

// 创建标签（需要认证）
router.post('/', authMiddleware, [
    body('name').notEmpty().withMessage('标签名称不能为空').trim().escape(),
], tagController.createTag);

// 编辑标签（需要认证）
router.put('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('无效的标签ID'),
    body('name').notEmpty().withMessage('标签名称不能为空').trim().escape(),
], tagController.updateTag);

// 删除标签（需要认证）
router.delete('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('无效的标签ID'),
], tagController.deleteTag);

module.exports = router;
