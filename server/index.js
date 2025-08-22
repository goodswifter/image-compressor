/**
 * 图片压缩服务器
 * 使用 Express + Sharp 实现服务端图片压缩
 */

import process from 'node:process'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import sharp from 'sharp'

const app = express()
const PORT = process.env.PORT || 3001

/**
 * 根据文件大小自适应调整压缩质量
 *
 * @param {number} fileSize 文件大小(字节)
 * @param {number} requestedQuality 用户请求的质量
 * @returns {number} 调整后的质量
 */
const getAdaptiveQuality = (fileSize, requestedQuality) => {
  // 小于100KB：降低质量避免增大
  if (fileSize < 100 * 1024) {
    return Math.min(requestedQuality, 60)
  }

  // 100KB-500KB：稍微降低质量
  if (fileSize < 500 * 1024) {
    return Math.min(requestedQuality, 70)
  }
  // 大于500KB：使用请求的质量
  return requestedQuality
}

// 中间件配置
app.use(cors())
app.use(express.json())

// 配置multer用于文件上传
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('只支持图片文件'), false)
    }
  },
})

/**
 * 图片压缩API
 */
app.post('/api/compress', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传图片文件' })
    }

    const {
      format = 'webp',
      quality = 80,
      maxWidth,
      maxHeight,
      maintainAspectRatio = true,
    } = req.body

    // 解析参数
    const qualityNumber = Number.parseInt(quality, 10)
    const maxWidthNumber = maxWidth ? Number.parseInt(maxWidth, 10) : undefined
    const maxHeightNumber = maxHeight ? Number.parseInt(maxHeight, 10) : undefined
    const originalSize = req.file.buffer.length

    // 智能压缩策略：小文件跳过压缩
    const SMALL_FILE_THRESHOLD = 50 * 1024 // 50KB
    if (originalSize < SMALL_FILE_THRESHOLD) {
      // 小文件直接返回原图
      const originalFormat = req.file.mimetype.split('/')[1]
      return res.json({
        success: true,
        data: {
          compressedImage: req.file.buffer.toString('base64'),
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 0,
          format: originalFormat,
          message: '文件已经足够小，跳过压缩',
          skipped: true,
        },
      })
    }

    // 创建sharp实例
    let sharpInstance = sharp(req.file.buffer)

    // 获取原始图片信息
    const metadata = await sharpInstance.metadata()

    // 计算新的尺寸
    let newWidth = metadata.width
    let newHeight = metadata.height

    if (maxWidthNumber || maxHeightNumber) {
      if (maintainAspectRatio === true || maintainAspectRatio === 'true') {
        // 保持宽高比
        const aspectRatio = metadata.width / metadata.height

        if (maxWidthNumber && maxHeightNumber) {
          if (newWidth > maxWidthNumber || newHeight > maxHeightNumber) {
            if (newWidth / maxWidthNumber > newHeight / maxHeightNumber) {
              newWidth = maxWidthNumber
              newHeight = Math.round(newWidth / aspectRatio)
            } else {
              newHeight = maxHeightNumber
              newWidth = Math.round(newHeight * aspectRatio)
            }
          }
        } else if (maxWidthNumber && newWidth > maxWidthNumber) {
          newWidth = maxWidthNumber
          newHeight = Math.round(newWidth / aspectRatio)
        } else if (maxHeightNumber && newHeight > maxHeightNumber) {
          newHeight = maxHeightNumber
          newWidth = Math.round(newHeight * aspectRatio)
        }
      } else {
        // 不保持宽高比
        if (maxWidthNumber) newWidth = Math.min(newWidth, maxWidthNumber)
        if (maxHeightNumber) newHeight = Math.min(newHeight, maxHeightNumber)
      }

      // 调整尺寸
      sharpInstance = sharpInstance.resize(newWidth, newHeight)
    }

    // 根据文件大小动态调整质量
    const adaptiveQuality = getAdaptiveQuality(originalSize, qualityNumber)

    // 根据格式进行压缩
    let compressedBuffer
    switch (format) {
      case 'webp': {
        compressedBuffer = await sharpInstance
          .webp({
            quality: adaptiveQuality,
            effort: originalSize > 500 * 1024 ? 6 : 4, // 大文件用更高effort
          })
          .toBuffer()
        break
      }

      case 'jpeg': {
        compressedBuffer = await sharpInstance
          .jpeg({
            quality: adaptiveQuality,
            mozjpeg: true, // 使用更好的JPEG编码器
          })
          .toBuffer()
        break
      }

      case 'png': {
        compressedBuffer = await sharpInstance
          .png({
            quality: adaptiveQuality,
            compressionLevel: 9, // 最高PNG压缩
          })
          .toBuffer()
        break
      }

      default: {
        throw new Error(`不支持的格式: ${format}`)
      }
    }

    // 计算压缩比例
    const compressedSize = compressedBuffer.length
    const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100)

    // 智能判断：如果压缩后没有明显减小，返回原图
    if (compressedSize >= originalSize * 0.95) {
      const originalFormat = req.file.mimetype.split('/')[1]
      return res.json({
        success: true,
        data: {
          compressedImage: req.file.buffer.toString('base64'),
          originalSize,
          compressedSize: originalSize,
          compressionRatio: 0,
          format: originalFormat,
          message: '原图已经足够优化，保持原格式',
          fallbackToOriginal: true,
        },
      })
    }

    // 返回压缩结果
    res.json({
      success: true,
      data: {
        compressedImage: compressedBuffer.toString('base64'),
        originalSize,
        compressedSize,
        compressionRatio,
        format,
        dimensions: {
          width: newWidth,
          height: newHeight,
        },
        qualityUsed: adaptiveQuality,
      },
    })
  } catch (error) {
    console.error('图片压缩错误:', error)
    res.status(500).json({
      success: false,
      error: error.message || '图片压缩失败',
    })
  }
})

/**
 * 健康检查API
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '图片压缩服务运行正常' })
})

/**
 * 错误处理中间件
 */
app.use((error, req, res) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: '文件大小超过限制(50MB)' })
  }
  console.error('服务器错误:', error)
  res.status(500).json({ error: error.message || '服务器内部错误' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 图片压缩服务器启动成功`)
  console.log(`📍 服务地址: http://localhost:${PORT}`)
  console.log(`🔗 健康检查: http://localhost:${PORT}/api/health`)
})
