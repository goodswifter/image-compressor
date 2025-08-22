# 图片压缩应用部署指南

这是一个纯前端图片压缩应用，基于 Vue 3 + browser-image-compression。无需后端服务器，可以部署到任何静态网站托管平台。

## 🚀 快速部署

### 1. GitHub Pages 部署（推荐）

项目已配置 GitHub Actions 自动部署。

#### 启用 GitHub Pages
1. 在 GitHub 仓库中进入 **Settings → Pages**
2. **Source** 选择 **"GitHub Actions"**
3. 推送代码到 main/master 分支会自动触发部署

#### 访问地址
- `https://your-username.github.io/image-compressor/`

### 2. 其他平台部署

#### Vercel
1. 访问 [vercel.com](https://vercel.com/)
2. 导入 GitHub 仓库
3. 无需额外配置，自动部署

#### Netlify
1. 访问 [netlify.com](https://netlify.com/)
2. 拖拽 `dist` 文件夹到部署区域
3. 或连接 GitHub 仓库自动部署

#### Firebase Hosting
```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录并初始化
firebase login
firebase init hosting

# 构建并部署
pnpm run build:prod
firebase deploy
```

## 📝 本地构建

```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm run build:prod

# 预览构建结果
pnpm run preview
```

构建产物在 `dist` 目录中，可以直接部署到任何静态网站托管服务。

## 🛠️ 本地开发

```bash
# 启动开发服务器
pnpm run dev

# 访问
# http://localhost:5678/image-compressor
```

## ⚙️ 配置说明

### 环境变量

项目不再需要环境变量配置，因为：
- ✅ 纯前端压缩，无需 API 服务器
- ✅ 所有处理在浏览器中完成
- ✅ 支持离线使用

### 构建配置

在 `vite.config.ts` 中的关键配置：

```typescript
export default {
  base: '/image-compressor/',  // GitHub Pages 子路径
  build: {
    target: 'es2015',
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
  }
}
```

## 📦 项目结构

```
image-compressor/
├── src/                    # 源代码
├── dist/                   # 构建输出
├── .github/workflows/      # GitHub Actions
├── public/                 # 静态资源
└── package.json           # 项目配置
```

## 🔧 GitHub Actions 配置

项目包含自动部署配置 (`.github/workflows/deploy.yml`)：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
      
      - name: Install and Build
        run: |
          pnpm install --no-frozen-lockfile
          pnpm run build:prod
      
      - name: Deploy to Pages
        uses: actions/deploy-pages@v4
        with:
          path: './dist'
```

## 🎯 部署优化

### 性能优化
- ✅ **Gzip 压缩**: 自动启用
- ✅ **代码分割**: 按需加载组件
- ✅ **图片优化**: WebP 格式优先
- ✅ **缓存策略**: 静态资源长期缓存

### SEO 优化
- ✅ **Meta 标签**: 完整的页面元信息
- ✅ **结构化数据**: 支持搜索引擎索引
- ✅ **移动适配**: 响应式设计

## 🔗 访问地址

- **GitHub Pages**: https://goodswifter.github.io/image-compressor/
- **本地开发**: http://localhost:5678/image-compressor

## 📊 部署要求

### 最低要求
- ✅ 静态文件托管即可
- ✅ 支持 HTTPS（推荐）
- ✅ 支持现代浏览器

### 浏览器支持
- ✅ Chrome 61+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+

## 🛡️ 隐私说明

- ✅ **完全离线**: 所有处理在本地浏览器完成
- ✅ **无数据上传**: 图片不会发送到任何服务器
- ✅ **隐私保护**: 适合处理敏感图片内容

## 🆘 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 清理缓存重新安装
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   pnpm run build:prod
   ```

2. **GitHub Pages 404**
   - 确保仓库 Settings → Pages 已启用
   - 确保选择了 "GitHub Actions" 作为源

3. **压缩功能异常**
   - 检查浏览器控制台错误
   - 确保浏览器支持 Web Workers

### 调试模式

```bash
# 开发模式，包含详细日志
pnpm run dev

# 构建并预览，接近生产环境
pnpm run build:prod && pnpm run preview
```

---

✨ 现在你的图片压缩工具已经是纯前端应用，部署更加简单！