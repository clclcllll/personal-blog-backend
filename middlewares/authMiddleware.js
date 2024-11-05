// middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // 从请求头中获取 Authorization 字段
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ error: '未提供认证令牌（Authorization header missing）' });
    }

    // 检查令牌格式是否正确，通常为 'Bearer token'
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ error: '令牌格式错误（Invalid token format）' });
    }

    const token = tokenParts[1];

    try {
        // 验证令牌
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 将解码后的用户信息附加到请求对象上
        req.user = decoded;
        console.log('req.user:', req.user);
        next();
    } catch (error) {
        return res.status(401).json({ error: '无效的令牌（Invalid token）' });
    }
};

module.exports = authMiddleware;
