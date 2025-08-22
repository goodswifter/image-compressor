/**
 * 图片压缩工具函数 - 使用 browser-image-compression
 */

import type { CompressionOptions, CompressionResult } from '@/types/compressor'
import imageCompression from 'browser-image-compression'
import JSZip from 'jszip'

/**
 * 压缩图片（使用 browser-image-compression）
 *
 * @param file 原始文件
 * @param options 压缩选项
 * @returns 压缩结果
 */
export async function compressImage(
  file: File,
  options: CompressionOptions,
): Promise<CompressionResult> {
  // 小文件检查：小于50KB直接返回
  const SMALL_FILE_THRESHOLD = 50 * 1000 // 50KB (十进制)
  if (file.size < SMALL_FILE_THRESHOLD) {
    console.info(`文件大小 ${formatFileSize(file.size)} 小于 50KB，跳过压缩`)
    return {
      blob: file,
      compressionRatio: 0,
      size: file.size,
    }
  }

  try {
    // 配置 browser-image-compression 选项
    const compressionOptions = {
      maxSizeMB: 10, // 最大文件大小 10MB
      maxWidthOrHeight: Math.max(options.maxWidth || 1920, options.maxHeight || 1080),
      useWebWorker: true, // 使用 Web Worker 提升性能
      fileType: getImageMimeType(options.format),
      initialQuality: options.quality,
    }

    // 如果指定了具体的宽高限制
    if (options.maxWidth || options.maxHeight) {
      if (options.maxWidth && options.maxHeight) {
        // 取较小值作为限制
        compressionOptions.maxWidthOrHeight = Math.min(options.maxWidth, options.maxHeight)
      } else {
        compressionOptions.maxWidthOrHeight = options.maxWidth || options.maxHeight || 1920
      }
    }

    console.info('开始压缩图片...', {
      originalSize: formatFileSize(file.size),
      options: compressionOptions,
    })

    // 执行压缩
    const compressedFile = await imageCompression(file, compressionOptions)

    // 计算压缩比
    const originalSize = file.size
    const compressedSize = compressedFile.size
    const compressionRatio = calculateCompressionRatio(originalSize, compressedSize)

    // 智能判断：如果压缩后没有明显减小，返回原图
    if (compressedSize >= originalSize * 0.95) {
      console.info('压缩效果不明显，保持原图')
      return {
        blob: file,
        compressionRatio: 0,
        size: originalSize,
      }
    }

    console.info('压缩完成', {
      originalSize: formatFileSize(originalSize),
      compressedSize: formatFileSize(compressedSize),
      compressionRatio: `${compressionRatio}%`,
    })

    return {
      blob: compressedFile,
      compressionRatio,
      size: compressedSize,
    }
  } catch (error) {
    console.error('图片压缩失败:', error)
    throw new Error(`图片压缩失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}

/**
 * 获取图片 MIME 类型
 *
 * @param format 图片格式
 * @returns MIME 类型
 */
function getImageMimeType(format: string): string {
  switch (format.toLowerCase()) {
    case 'webp':
      return 'image/webp'
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    default:
      return 'image/jpeg' // 默认使用 JPEG
  }
}

/**
 * 计算压缩比例
 *
 * @param originalSize 原始大小
 * @param compressedSize 压缩后大小
 * @returns 压缩比例（百分比）
 */
function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0
  return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

/**
 * 格式化文件大小
 * 使用十进制单位（1000）与操作系统显示保持一致
 *
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  // 使用十进制单位（1000）与操作系统文件管理器保持一致
  const k = 1000
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化文件大小（二进制单位）
 * 使用二进制单位（1024）用于技术精确显示
 *
 * @param bytes 字节数
 * @returns 格式化后的大小字符串
 */
export function formatFileSizeBinary(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KiB', 'MiB', 'GiB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 验证文件是否为图片
 *
 * @param file 文件对象
 * @returns 是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * 获取文件扩展名
 *
 * @param filename 文件名
 * @returns 扩展名
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * 生成唯一ID
 *
 * @returns 唯一ID字符串
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * 创建文件预览URL
 *
 * @param file 文件对象
 * @returns 预览URL
 */
export function createPreviewUrl(file: File | Blob): string {
  return URL.createObjectURL(file)
}

/**
 * 释放预览URL
 *
 * @param url 预览URL
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * 下载文件
 *
 * @param blob 文件数据
 * @param filename 文件名
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.append(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * 批量下载文件（打包为ZIP）
 *
 * @param files 文件数组
 */
export async function downloadMultipleFiles(
  files: Array<{ blob: Blob; filename: string }>,
): Promise<void> {
  if (files.length === 0) {
    throw new Error('没有文件可下载')
  }

  // 如果只有一个文件，直接下载
  if (files.length === 1) {
    downloadFile(files[0].blob, files[0].filename)
    return
  }

  try {
    // 创建ZIP压缩包
    const zip = new JSZip()

    // 创建文件夹名（包含时间戳）
    const now = new Date()
    const timestamp = now
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replaceAll(/[/:]/g, '-')
      .replaceAll(/\s/g, '_')

    const folderName = `compressed_images_${timestamp}`

    // 将所有文件添加到ZIP中的指定文件夹
    for (const file of files) {
      // 确保文件名唯一，避免重名覆盖
      let finalFilename = file.filename
      let counter = 1

      // 检查是否有同名文件，如果有则添加序号
      while (zip.folder(folderName)?.file(finalFilename)) {
        const ext = finalFilename.split('.').pop()
        const nameWithoutExt = finalFilename.replace(`.${ext}`, '')
        finalFilename = `${nameWithoutExt}_${counter}.${ext}`
        counter++
      }

      // 将文件添加到文件夹中
      zip.folder(folderName)?.file(finalFilename, file.blob)
    }

    // 生成ZIP文件
    const zipBlob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6, // 中等压缩级别，平衡速度和大小
      },
    })

    // 下载ZIP文件
    const zipFilename = `${folderName}.zip`
    downloadFile(zipBlob, zipFilename)
  } catch (error) {
    console.error('创建ZIP文件失败:', error)
    throw new Error('批量下载失败，请重试')
  }
}
