# 图片压缩替代架构方案

## 1. 纯前端方案 (无需Express)

### WebAssembly + Sharp移植版

```bash
# 安装WASM版本的图像处理库
npm install @squoosh/lib
```

```javascript
// 使用Squoosh (Google开发的WASM压缩库)
import { ImagePool } from '@squoosh/lib'

const imagePool = new ImagePool()
const image = imagePool.ingestImage(file)

await image.encode({
  webp: { quality: 75 },
})
```

**优缺点:**

- ✅ 无需后端服务器
- ✅ 压缩质量接近Sharp
- ❌ WASM文件大(~2MB)
- ❌ 首次加载慢

### 原生浏览器API方案

```javascript
// 使用OffscreenCanvas (更好的性能)
const canvas = new OffscreenCanvas(width, height)
const ctx = canvas.getContext('2d')

// 或使用 createImageBitmap
const bitmap = await createImageBitmap(file)
```

## 2. Serverless方案 (云函数)

### Vercel Edge Functions

```javascript
// api/compress.js
import sharp from 'sharp'

export default async function handler(req, res) {
  const buffer = await sharp(req.body).webp({ quality: 80 }).toBuffer()

  res.json({ compressed: buffer.toString('base64') })
}
```

### AWS Lambda + Sharp Layer

```yaml
# serverless.yml
functions:
  compress:
    handler: compress.handler
    layers:
      - arn:aws:lambda:region:account:layer:sharp:1
```

## 3. 微服务容器方案

### Docker + Sharp服务

```dockerfile
FROM node:18-alpine
RUN apk add --no-cache vips-dev
COPY . .
RUN npm install
EXPOSE 3001
CMD ["node", "server.js"]
```

## 4. Progressive Web App方案

### Service Worker + Sharp WASM

```javascript
// sw.js
importScripts('/sharp.wasm')

self.addEventListener('message', async event => {
  if (event.data.type === 'COMPRESS') {
    const compressed = await processWithSharp(event.data.file)
    event.ports[0].postMessage(compressed)
  }
})
```

## 选择建议

| 需求场景   | 推荐方案        | 理由           |
| ---------- | --------------- | -------------- |
| 快速原型   | Canvas API      | 开发最快       |
| 高质量压缩 | Sharp + Express | 效果最佳       |
| 无服务器   | Squoosh WASM    | 性能和便利平衡 |
| 企业级     | 云函数/容器     | 可扩展性好     |
