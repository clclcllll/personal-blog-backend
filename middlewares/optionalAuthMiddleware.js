// middlewares/optionalAuthMiddleware.js

const jwt = require('jsonwebtoken');

const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (authHeader) {
        const tokenParts = authHeader.split(' ');
        if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
            const token = tokenParts[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } catch (err) {
                // 令牌无效，忽略并继续
                console.warn('无效的令牌，继续作为未认证用户处理');
            }
        }
    }
    next();
};

module.exports = optionalAuthMiddleware;
