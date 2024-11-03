const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware'); // 引入 adminMiddleware
const { body, param } = require('express-validator');

// 获取分类列表
router.get('/', categoryController.getCategories);

// 获取分类详情
router.get('/:id', [
    param('id').isMongoId().withMessage('无效的分类ID'),
], categoryController.getCategoryById);


// 创建分类（需要认证和管理员权限）
router.post('/', authMiddleware, adminMiddleware, [
    body('name').notEmpty().withMessage('分类名称不能为空').trim().escape(),
], categoryController.createCategory);

// 编辑分类（需要认证和管理员权限）
router.put('/:id', authMiddleware, adminMiddleware, [
    param('id').isMongoId().withMessage('无效的分类ID'),
    body('name').notEmpty().withMessage('分类名称不能为空').trim().escape(),
], categoryController.updateCategory);

// 删除分类（需要认证和管理员权限）
router.delete('/:id', authMiddleware, adminMiddleware, [
    param('id').isMongoId().withMessage('无效的分类ID'),
], categoryController.deleteCategory);

module.exports = router;
