// middlewares/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // 如果响应头已发送，直接交给 Express 默认的错误处理器
    if (res.headersSent) {
        return next(err);
    }

    // 设置默认状态码为 500，或使用已有的状态码
    const statusCode = err.statusCode || 500;

    // 在开发环境中，返回完整的错误堆栈信息；在生产环境中，只返回错误消息
    const response = {
        message: err.message,
    };

    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
