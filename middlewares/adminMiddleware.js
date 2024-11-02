// middlewares/adminMiddleware.js

module.exports = (req, res, next) => {
    //if (req.user && req.user.role === 'admin') {
        // 用户已登录且具有管理员角色
        next();
    //} else {
     //   return res.status(403).json({ error: '无权访问此资源' });
    //}
};
