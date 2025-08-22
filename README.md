# 🖼️ 智能图片压缩工具

一个基于 Vue 3 + Sharp 的高性能图片压缩应用，支持多种格式转换和批量处理。

## ✨ 特性

- 🚀 **高性能压缩**: 服务端 Sharp + 客户端 Canvas 双重保障
- 🎯 **智能优化**: 根据文件大小自适应压缩策略
- 📱 **响应式设计**: 支持移动端和桌面端
- 🔄 **批量处理**: 支持拖拽上传和批量压缩
- 📦 **ZIP 下载**: 批量文件自动打包下载
- 🎨 **多格式支持**: WebP、JPEG、PNG 互转
- ⚡ **实时预览**: 即时查看压缩效果和文件大小对比

## 🌐 在线体验

- **前端应用**: [https://your-username.github.io/image-compressor/](https://your-username.github.io/image-compressor/)
- **API 服务**: [https://your-backend.vercel.app](https://your-backend.vercel.app)

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/image-compressor.git
cd image-compressor

# 安装依赖
pnpm install
pnpm run server:install

# 启动开发服务器
pnpm run dev
```

访问 [http://localhost:5678/image-compressor](http://localhost:5678/image-compressor)

### 部署到线上

详细部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ 技术栈

### 前端

- **Vue 3** + **TypeScript** + **Vite**
- **Element Plus** UI 组件库
- **UnoCSS** 原子化 CSS
- **Pinia** 状态管理
- **JSZip** 文件压缩

### 后端

- **Express** + **Sharp** 高性能图片处理
- **Multer** 文件上传处理
- **CORS** 跨域支持

## 📊 压缩效果

- **WebP 格式**: 相比 JPEG 减少 25-50% 文件大小
- **智能策略**: 小文件自动跳过，避免增大
- **质量控制**: 1-100% 可调节压缩质量
- **尺寸调整**: 支持限制最大宽高，保持宽高比

## 🔧 项目结构

```
image-compressor/
├── src/                  # 前端源码
│   ├── components/       # 组件
│   ├── utils/           # 工具函数
│   ├── types/           # 类型定义
│   └── assets/          # 静态资源
├── server/              # 后端源码
│   ├── index.js         # Express 服务器
│   ├── vercel.json      # Vercel 配置
│   └── package.json     # 后端依赖
├── .github/workflows/   # GitHub Actions
├── dist/               # 构建输出
└── docs/               # 文档
```

## 📝 开发指南

### 环境要求

- Node.js >= 22
- pnpm >= 9

### 构建命令

```bash
# 开发环境构建
pnpm run build

# 生产环境构建
pnpm run build:prod

# 预览构建结果
pnpm run preview
```

### 代码规范

```bash
# 代码格式化
pnpm run format

# ESLint 检查
pnpm run lint

# StyleLint 检查
pnpm run lint:stylelint
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

[MIT License](./LICENSE)

## 🙏 致谢

- [Sharp](https://sharp.pixelplumbing.com/) - 高性能图片处理
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vercel](https://vercel.com/) - 部署平台

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
