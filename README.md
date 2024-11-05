# Node.js + Express 博客系统后端

本后端服务采用 Node.js + Express 框架，结合 MongoDB 进行数据持久化，为 Vue3 前端提供 RESTful API 接口服务。该后端具备用户管理、文章管理、评论系统、点赞功能等核心模块，并通过 JWT 实现用户身份验证。

## 技术栈

- **后端框架**：Node.js + Express
- **数据库**：MongoDB
- **用户身份验证**：JWT（JSON Web Token）

## 功能模块

- 用户系统：用户注册、登录、身份验证与权限控制
- 文章管理：文章创建、更新、删除及获取
- 评论系统：支持多层嵌套回复功能
- 点赞系统：支持访客和已登录用户对文章点赞
- 搜索功能：支持关键字搜索和分页功能

## 环境依赖

- Node.js >= 14.0
- MongoDB >= 4.0

## 快速开始

### 1. 克隆仓库

```
git clone https://github.com/yourusername/yourproject-backend.git
```

### 2. 安装依赖

进入项目目录并安装依赖：

```
cd yourproject-backend
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env` 文件，并配置以下内容：

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/yourdbname
JWT_SECRET=your_jwt_secret
```

### 4. 启动服务

使用以下命令启动开发服务器：

```
npm run dev
```

服务器将会在 `http://localhost:5000` 运行。

## API 说明

### 用户认证

- **注册用户**：`POST /api/users/register`
- **用户登录**：`POST /api/users/login`
- **获取用户信息**：`GET /api/users/me` （需登录）

### 文章管理

- **获取文章列表**：`GET /api/articles`
- **获取文章详情**：`GET /api/articles/:id`
- **创建文章**：`POST /api/articles` （管理员权限）
- **更新文章**：`PUT /api/articles/:id` （管理员权限）
- **删除文章**：`DELETE /api/articles/:id` （管理员权限）

### 评论系统

- **获取文章评论**：`GET /api/comments?articleId=:id`
- **添加评论**：`POST /api/comments` （需登录）
- **删除评论**：`DELETE /api/comments/:id` （管理员权限）

### 点赞功能

- **点赞文章**：`POST /api/likes/:articleId`
- **取消点赞**：`DELETE /api/likes/:articleId`

## 数据库结构

### 用户 (User)

- **username**：用户名，唯一
- **password**：加密后的密码
- **role**：用户角色，默认为普通用户

### 文章 (Article)

- **title**：文章标题
- **content**：文章内容（支持 Markdown 格式）
- **author**：作者，关联到 User
- **likes**：点赞数量

### 评论 (Comment)

- **content**：评论内容
- **user**：评论用户，关联到 User
- **article**：关联的文章
- **parent**：父评论，用于嵌套回复

### 点赞 (Like)

- **article**：点赞的文章
- **user**：点赞的用户（若已登录）
- **ipAddress**：访客的 IP 地址（未登录）

## 中间件

- **身份验证中间件**：确保用户登录状态
- **可选身份验证**：支持访客和已登录用户使用
- **管理员权限中间件**：控制文章创建、编辑和删除权限

## 项目结构

```
├── controllers    # 业务逻辑控制器
├── middlewares    # 自定义中间件
├── models         # 数据库模型
├── routes         # API 路由
├── config         # 配置文件
├── utils          # 工具函数
└── app.js         # 入口文件
```

## 运行测试

配置测试数据库后，使用以下命令运行测试：

```
npm run test
```

## 贡献指南

欢迎对项目提出改进建议或反馈。

## 许可证

MIT License