# 图片压缩服务器

使用 Sharp 进行高性能图片压缩的 Express API 服务器。

## 🚀 Vercel 部署

这个后端服务已配置为可以直接部署到 Vercel。

### 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/image-compressor)

### 手动部署步骤

1. 将此 `server` 文件夹推送到 GitHub 仓库
2. 在 [Vercel](https://vercel.com/) 中导入仓库
3. 配置项目设置：
   - Root Directory: `server`（如果整个项目在一个仓库中）
   - Framework: Other
   - Build Command: 留空
   - Install Command: `pnpm install`

## 📡 API 端点

### POST /api/compress

压缩图片

**请求格式**: `multipart/form-data`

**参数**:

- `image`: 图片文件
- `format`: 输出格式 (webp/jpeg/png)
- `quality`: 压缩质量 (1-100)
- `maxWidth`: 最大宽度 (可选)
- `maxHeight`: 最大高度 (可选)
- `maintainAspectRatio`: 是否保持宽高比 (true/false)

### GET /api/health

健康检查

## 🛠️ 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 启动生产服务器
pnpm start
```

## 🔧 技术栈

- **Express**: Web 框架
- **Sharp**: 高性能图片处理
- **Multer**: 文件上传处理
- **CORS**: 跨域资源共享

## 📝 环境要求

- Node.js >= 18
- pnpm >= 9
