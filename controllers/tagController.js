// controllers/tagController.js

const { validationResult } = require('express-validator');
const Tag = require('../models/Tag');
const Article = require('../models/Article'); // 添加这行代码

// 获取标签列表
exports.getTags = async (req, res, next) => {
    try {
        const tags = await Tag.find().sort({ createdAt: -1 });
        res.json({ tags });
    } catch (err) {
        next(err);
    }
};

// 获取单个标签详情
exports.getTagById = async (req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ error: '标签未找到' });

        }
        res.json({ tag });
    }
    catch (err) {
        next(err);
    }

};

// 创建标签
exports.createTag = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.body;

        // 检查标签是否已存在
        const existingTag = await Tag.findOne({ name });
        if (existingTag) {
            return res.status(400).json({ error: '标签已存在' });
        }

        const tag = new Tag({ name });
        await tag.save();

        res.status(201).json({ message: '标签创建成功', tag });
    } catch (err) {
        next(err);
    }
};

// 编辑标签
exports.updateTag = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name } = req.body;

        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({ error: '标签不存在' });
        }

        tag.name = name;
        await tag.save();

        res.json({ message: '标签更新成功', tag });
    } catch (err) {
        next(err);
    }
};

// 删除标签
exports.deleteTag = async (req, res, next) => {
    try {
        const tagId = req.params.id;
        const articlesUsingTag = await Article.countDocuments({ tags: tagId });

        if (articlesUsingTag > 0) {
            return res.status(400).json({ message: '该标签正在被其他文章引用，无法删除' });
        }

        const tag = await Tag.findByIdAndDelete(tagId);
        if (!tag) {
            return res.status(404).json({ message: '标签未找到' });
        }

        res.status(200).json({ message: '标签删除成功' });
    } catch (error) {
        console.error('删除标签失败:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};
