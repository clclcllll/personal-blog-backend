// controllers/authController.js

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 用户注册
exports.register = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // 检查用户名或邮箱是否已存在
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: '用户名或邮箱已被注册' });
        }

        const user = new User({ username, email, password });
        await user.save();

        res.status(201).json({ message: '注册成功，请登录' });
    } catch (err) {
        next(err);
    }
};

// 用户登录
exports.login = async (req, res, next) => {
    try {
        // 检查验证结果
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // 查找用户
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: '邮箱或密码错误' });
        }

        // 验证密码
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: '邮箱或密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // 令牌有效期 1 天
        );

        res.json({
            message: '登录成功',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

// 获取当前用户信息
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        res.json({ user });
    } catch (err) {
        next(err);
    }
};

// 获取用户列表（仅管理员）
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, keyword } = req.query;
        const query = {};

        if (keyword) {
            query.$or = [
                { username: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
            ];
        }

        const total = await User.countDocuments(query);
        const pages = Math.ceil(total / limit);
        const users = await User.find(query)
            .select('-password') // 不返回密码字段
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            users,
            total,
            page: parseInt(page),
            pages,
        });
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({ error: '服务器错误' });
    }
};

// 用户注销（可选，前端清除令牌即可）
exports.logout = (req, res) => {
    res.json({ message: '已注销' });
};
