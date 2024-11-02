// middlewares/adminMiddleware.js

module.exports = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // 用户是管理员，允许继续
    } else {
        res.status(403).json({ error: '无权限访问，该操作仅限管理员' });
    }
};
