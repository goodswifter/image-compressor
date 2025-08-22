# 🖼️ 智能图片压缩工具

一个基于 Vue 3 + browser-image-compression 的纯前端图片压缩应用，支持多种格式转换和批量处理。

## ✨ 特性

- 🚀 **纯前端压缩**: 使用 browser-image-compression 实现高质量压缩
- 🔧 **Web Worker**: 多线程处理，不阻塞 UI
- 🎯 **智能优化**: 根据文件大小自适应压缩策略
- 📱 **响应式设计**: 支持移动端和桌面端
- 🔄 **批量处理**: 支持拖拽上传和批量压缩
- 📦 **ZIP 下载**: 批量文件自动打包下载
- 🎨 **多格式支持**: WebP、JPEG、PNG 互转
- ⚡ **实时预览**: 即时查看压缩效果和文件大小对比
- 🛡️ **隐私保护**: 完全客户端处理，文件不上传到服务器

## 🌐 在线体验

- **GitHub Pages**: [https://goodswifter.github.io/image-compressor/](https://goodswifter.github.io/image-compressor/)

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/goodswifter/image-compressor.git
cd image-compressor

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

访问 [http://localhost:5678/image-compressor](http://localhost:5678/image-compressor)

### 构建部署

```bash
# 生产环境构建
pnpm run build:prod

# 预览构建结果
pnpm run preview
```

## 🛠️ 技术栈

### 前端
- **Vue 3** + **TypeScript** + **Vite**
- **Element Plus** UI 组件库
- **UnoCSS** 原子化 CSS
- **Pinia** 状态管理
- **browser-image-compression** 图片压缩
- **JSZip** 文件压缩

## 📊 压缩效果

- **WebP 格式**: 相比 JPEG 减少 25-50% 文件大小
- **智能策略**: 小文件（<50KB）自动跳过，避免增大
- **质量控制**: 1-100% 可调节压缩质量
- **尺寸调整**: 支持限制最大宽高，保持宽高比
- **Web Worker**: 后台处理，界面响应流畅

## 🔧 压缩策略

| 文件大小 | 处理策略 | 说明 |
|---------|---------|------|
| **< 50KB** | ⏭️ 跳过压缩 | 小文件通常已优化，压缩可能增大 |
| **≥ 50KB** | ✅ 智能压缩 | 根据质量设置进行压缩 |
| **压缩率 < 5%** | 🔄 返回原图 | 压缩效果不明显时保持原图 |

## 🔧 项目结构

```
image-compressor/
├── src/                  # 前端源码
│   ├── components/       # 组件
│   │   └── image-compressor/  # 主压缩组件
│   ├── utils/           # 工具函数
│   │   └── image-compressor.ts  # 压缩逻辑
│   ├── types/           # 类型定义
│   └── assets/          # 静态资源
├── .github/workflows/   # GitHub Actions
├── dist/               # 构建输出
└── docs/               # 文档
```

## 📝 开发指南

### 环境要求

- Node.js >= 22
- pnpm >= 9

### 开发命令

```bash
# 开发环境
pnpm run dev

# 生产环境预览
pnpm run dev:prod

# 代码格式化
pnpm run format

# ESLint 检查
pnpm run lint

# StyleLint 检查
pnpm run lint:stylelint
```

### 核心配置

#### 压缩选项

```typescript
interface CompressionOptions {
  format: 'webp' | 'jpeg' | 'png'    // 输出格式
  quality: number                     // 压缩质量 (0-1)
  maxWidth?: number                   // 最大宽度
  maxHeight?: number                  // 最大高度
  maintainAspectRatio: boolean        // 保持宽高比
}
```

#### 优化配置

- **Web Worker**: 自动启用，提升大文件处理性能
- **智能压缩**: 自动跳过小文件和低效压缩
- **内存优化**: 及时释放 URL 对象和文件引用

## 🎯 使用场景

- **网站图片优化**: 减少页面加载时间
- **移动端适配**: 压缩图片适应移动设备
- **批量处理**: 设计师批量优化图片资源
- **格式转换**: 将旧格式图片转为现代格式
- **隐私保护**: 本地处理，无需上传敏感图片

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

[MIT License](./LICENSE)

## 🙏 致谢

- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) - 纯前端图片压缩
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [GitHub Pages](https://pages.github.com/) - 免费静态网站托管

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！