# Sharp 图片压缩功能使用指南

## 概述

本项目已集成 Sharp 进行服务端图片压缩，提供比浏览器 Canvas API 更强大的压缩能力和更好的 WebP 转换质量。

## 架构设计

- **前端**: Vue 3 + TypeScript，负责用户界面和文件上传
- **后端**: Express + Sharp，负责高质量图片压缩处理
- **降级机制**: 当后端服务不可用时，自动降级到前端 Canvas 压缩

## 功能特性

### Sharp 压缩优势

- ✅ 更高质量的 WebP 转换
- ✅ 更优的压缩算法
- ✅ 支持更多图片格式
- ✅ 更快的处理速度
- ✅ 更小的输出文件

### 支持的格式

- **输入**: JPEG, PNG, GIF, BMP, WebP, TIFF, SVG 等
- **输出**: WebP, JPEG, PNG

## 快速开始

### 1. 安装依赖

```bash
# 安装前端依赖
pnpm install

# 安装后端依赖
pnpm run server:install
```

### 2. 启动服务

```bash
# 同时启动前端和后端 (推荐)
pnpm run dev

# 或者分别启动
pnpm run dev:client  # 前端 (http://localhost:5173)
pnpm run dev:server  # 后端 (http://localhost:3001)
```

### 3. 使用压缩功能

1. 打开浏览器访问 `http://localhost:5173`
2. 上传图片文件（支持拖拽或点击上传）
3. 配置压缩选项：
   - **输出格式**: WebP（推荐）、JPEG、PNG
   - **压缩质量**: 10-100%
   - **最大尺寸**: 可选限制宽度和高度
   - **保持宽高比**: 默认开启
4. 点击"开始压缩"
5. 下载压缩后的图片

## API 接口

### 压缩接口

```
POST /api/compress
Content-Type: multipart/form-data

参数:
- image: 图片文件
- format: 输出格式 (webp|jpeg|png)
- quality: 压缩质量 (10-100)
- maxWidth: 最大宽度 (可选)
- maxHeight: 最大高度 (可选)
- maintainAspectRatio: 是否保持宽高比 (true|false)
```

### 健康检查

```
GET /api/health
```

## 配置说明

### 服务器配置

文件: `server/index.js`

- 端口: 3001 (可通过环境变量 PORT 修改)
- 上传限制: 50MB
- 请求超时: 30秒

### 前端配置

文件: `src/utils/image-compressor.ts`

- API 地址: http://localhost:3001
- 自动降级: 服务器不可用时使用 Canvas

## 压缩质量对比

| 质量设置 | 文件大小 | 视觉质量 | 适用场景           |
| -------- | -------- | -------- | ------------------ |
| 90-100%  | 较大     | 极高     | 专业摄影、印刷     |
| 70-90%   | 中等     | 高       | 网站展示、社交媒体 |
| 50-70%   | 较小     | 良好     | 移动应用、快速加载 |
| 10-50%   | 很小     | 一般     | 缩略图、预览图     |

## WebP 格式优势

- 比 JPEG 小 25-35%
- 比 PNG 小 26-35%
- 支持透明度
- 支持动画
- 现代浏览器广泛支持

## 故障排除

### 常见问题

**1. 服务器连接失败**

- 确保后端服务已启动: `pnpm run dev:server`
- 检查端口 3001 是否被占用
- 查看服务器日志输出

**2. 压缩失败**

- 检查上传的文件是否为有效图片
- 确认文件大小不超过 50MB
- 查看控制台错误信息

**3. 质量不符合预期**

- 调整压缩质量设置
- 尝试不同的输出格式
- 检查原图质量

### 开发调试

启用详细日志:

```bash
# 查看服务器日志
cd server && node index.js

# 查看前端控制台
# 打开浏览器开发者工具 Console 面板
```

## 部署说明

### 生产环境部署

1. **后端部署**:

```bash
cd server
pnpm install --prod
node index.js
```

2. **前端构建**:

```bash
pnpm run build:prod
```

3. **环境变量**:

```bash
# 后端
PORT=3001

# 前端构建时需要配置正确的 API 地址
VITE_API_BASE_URL=https://your-api-domain.com
```

### Docker 部署

可创建 Dockerfile 将前后端打包为容器镜像。

## 性能优化建议

1. **服务器端**:
   - 使用 PM2 或类似工具管理进程
   - 配置负载均衡
   - 启用压缩中间件

2. **前端**:
   - 实现图片上传进度显示
   - 添加文件大小预检查
   - 使用 Web Workers 处理大文件

## 技术栈

- **前端**: Vue 3, TypeScript, Vite, UnoCSS, Element Plus
- **后端**: Node.js, Express, Sharp, Multer
- **工具**: Axios, Concurrently, ESLint, Prettier

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目。

## 许可证

[项目许可证信息]
