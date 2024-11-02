// routes/categories.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { body, param } = require('express-validator');

// 获取分类列表
router.get('/', categoryController.getCategories);

// 创建分类（需要认证）
router.post('/', authMiddleware, [
    body('name').notEmpty().withMessage('分类名称不能为空').trim().escape(),
], categoryController.createCategory);

// 编辑分类（需要认证）
router.put('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('无效的分类ID'),
    body('name').notEmpty().withMessage('分类名称不能为空').trim().escape(),
], categoryController.updateCategory);

// 删除分类（需要认证）
router.delete('/:id', authMiddleware, [
    param('id').isMongoId().withMessage('无效的分类ID'),
], categoryController.deleteCategory);

module.exports = router;
