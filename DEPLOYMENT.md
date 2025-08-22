# 图片压缩应用部署指南

这个项目包含前端（Vue 3）和后端（Express + Sharp）两部分，需要分别部署。

## 🚀 快速部署

### 1. 后端部署到 Vercel

1. 将 `server` 文件夹推送到一个单独的 GitHub 仓库，或者在主仓库中配置 Vercel
2. 登录 [Vercel](https://vercel.com/)
3. 导入 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: 留空
   - **Output Directory**: 留空
   - **Install Command**: `pnpm install`

5. 部署后会得到一个 URL，例如：`https://your-project.vercel.app`

### 2. 更新前端配置

1. 修改 `.env.production` 文件中的 `VITE_BASE_URL` 为你的 Vercel 后端地址
2. 提交代码到 GitHub

### 3. 前端部署到 GitHub Pages

1. 在 GitHub 仓库中启用 Pages：
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

2. GitHub Actions 会自动运行，部署前端到 GitHub Pages

## 📝 环境变量配置

### 开发环境 (.env.development)

```env
VITE_PORT=5678
VITE_PUBLIC_PATH=/image-compressor/
VITE_BASE_URL=http://localhost:3001
VITE_COMPRESSION=none
VITE_ROUTER_HISTORY=hash
```

### 生产环境 (.env.production)

```env
VITE_PORT=5678
VITE_PUBLIC_PATH=/image-compressor/
VITE_BASE_URL=https://your-backend.vercel.app
VITE_COMPRESSION=gzip
VITE_ROUTER_HISTORY=hash
```

## 🛠️ 本地开发

```bash
# 安装依赖
pnpm install
pnpm run server:install

# 启动开发服务器（前端 + 后端）
pnpm run dev

# 仅启动前端
pnpm run dev:client

# 仅启动后端
pnpm run dev:server
```

## 📦 手动构建

```bash
# 构建生产版本
pnpm run build:prod

# 预览构建结果
pnpm run preview
```

## 🔗 访问地址

- **开发环境**: http://localhost:5678/image-compressor
- **GitHub Pages**: https://your-username.github.io/image-compressor/
- **后端API**: https://your-backend.vercel.app/api/health

## 注意事项

1. 确保后端先部署成功，再部署前端
2. 如果后端地址发生变化，需要更新 `.env.production` 文件并重新部署前端
3. GitHub Pages 有大小限制，单个文件不能超过 100MB，整个仓库不能超过 1GB
4. Vercel 免费版有使用限制，请注意配额
