// controllers/categoryController.js

const { validationResult } = require('express-validator');
const Category = require('../models/Category');

// 获取分类列表
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json({ categories });
    } catch (err) {
        next(err);
    }
};

// 获取分类详情
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }
        //后台打印
        console.log(category);

        res.json({ category });
    } catch (err) {
        next(err);
    }
};

// 创建分类
exports.createCategory = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.body;

        // 检查分类是否已存在
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: '分类已存在' });
        }

        const category = new Category({ name });
        await category.save();

        res.status(201).json({ message: '分类创建成功', category });
    } catch (err) {
        next(err);
    }
};

// 编辑分类
exports.updateCategory = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }

        category.name = name;
        await category.save();

        res.json({ message: '分类更新成功', category });
    } catch (err) {
        next(err);
    }
};

// 删除分类
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }

        await category.remove();

        res.json({ message: '分类已删除' });
    } catch (err) {
        next(err);
    }
};
