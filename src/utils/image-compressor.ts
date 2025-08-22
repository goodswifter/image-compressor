/**
 * 图片压缩工具函数
 */

import type { CompressionOptions, CompressionResult } from '@/types/compressor'
import axios from 'axios'
import JSZip from 'jszip'

// API配置
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001'

/**
 * 压缩图片（优先使用服务端Sharp，失败时降级到Canvas）
 *
 * @param file 原始文件
 * @param options 压缩选项
 * @returns 压缩结果
 */
export async function compressImage(
  file: File,
  options: CompressionOptions,
): Promise<CompressionResult> {
  try {
    // 尝试使用服务端Sharp压缩
    return await compressImageWithSharp(file, options)
  } catch (error) {
    console.warn('服务端压缩失败，降级到客户端Canvas压缩:', error)
    // 降级到Canvas压缩
    const result = await compressImageWithCanvas(file, options)
    return result
  }
}

/**
 * 使用服务端Sharp压缩图片
 *
 * @param file 原始文件
 * @param options 压缩选项
 * @returns 压缩结果
 */
async function compressImageWithSharp(
  file: File,
  options: CompressionOptions,
): Promise<CompressionResult> {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('format', options.format)
  formData.append('quality', Math.round(options.quality * 100).toString())

  if (options.maxWidth) {
    formData.append('maxWidth', options.maxWidth.toString())
  }

  if (options.maxHeight) {
    formData.append('maxHeight', options.maxHeight.toString())
  }
  formData.append('maintainAspectRatio', options.maintainAspectRatio.toString())

  try {
    const response = await axios.post(`${API_BASE_URL}/api/compress`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30秒超时
    })

    if (!response.data.success) {
      throw new Error(response.data.error || '服务端压缩失败')
    }

    const {
      compressedImage,
      compressedSize,
      compressionRatio,
      message,
      skipped,
      fallbackToOriginal,
    } = response.data.data

    // 如果后端智能跳过了压缩，显示提示信息
    if (skipped || fallbackToOriginal) {
      console.info('智能压缩策略:', message)
    }

    // 将base64转换为Blob
    const byteCharacters = atob(compressedImage)
    const byteNumbers = Array.from({ length: byteCharacters.length })
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers as ArrayLike<number>)
    const blob = new Blob([byteArray], { type: `image/${options.format}` })

    return {
      blob,
      compressionRatio,
      size: compressedSize,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('无法连接到压缩服务器，请确保服务器已启动')
      }

      if (error.response?.status === 400) {
        throw new Error(error.response.data?.error || '请求参数错误')
      }

      if (error.response?.status && error.response.status >= 500) {
        throw new Error('服务器内部错误')
      }
    }
    throw error
  }
}

/**
 * 使用客户端Canvas压缩图片（后备方案）
 *
 * @param file 原始文件
 * @param options 压缩选项
 * @returns 压缩结果
 */
function compressImageWithCanvas(
  file: File,
  options: CompressionOptions,
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('无法获取Canvas上下文'))
          return
        }

        // 计算新的尺寸
        const { width, height } = calculateNewDimensions(
          img.width,
          img.height,
          options.maxWidth,
          options.maxHeight,
          options.maintainAspectRatio,
        )

        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为指定格式
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error('图片压缩失败'))
              return
            }

            const compressionRatio = calculateCompressionRatio(file.size, blob.size)

            resolve({
              blob,
              compressionRatio,
              size: blob.size,
            })
          },
          `image/${options.format}`,
          options.quality,
        )
      } catch (error) {
        reject(error)
      }
    })

    img.addEventListener('error', () => {
      reject(new Error('图片加载失败'))
    })

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 计算新的图片尺寸
 *
 * @param originalWidth
 * @param originalHeight
 * @param maxWidth
 * @param maxHeight
 * @param maintainAspectRatio
 */
function calculateNewDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth?: number,
  maxHeight?: number,
  maintainAspectRatio = true,
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight }

  if (!maxWidth && !maxHeight) {
    return { width, height }
  }

  if (maintainAspectRatio) {
    const aspectRatio = originalWidth / originalHeight

    if (maxWidth && maxHeight) {
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          width = maxWidth
          height = width / aspectRatio
        } else {
          height = maxHeight
          width = height * aspectRatio
        }
      }
    } else if (maxWidth && width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    } else if (maxHeight && height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }
  } else {
    if (maxWidth) width = Math.min(width, maxWidth)
    if (maxHeight) height = Math.min(height, maxHeight)
  }

  return { width: Math.round(width), height: Math.round(height) }
}

/**
 * 计算压缩比例
 *
 * @param originalSize
 * @param compressedSize
 */
function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0
  return Math.round(((originalSize - compressedSize) / originalSize) * 100)
}

/**
 * 格式化文件大小
 *
 * @param bytes
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

/**
 * 验证文件是否为图片
 *
 * @param file
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * 获取文件扩展名
 *
 * @param filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/**
 * 创建文件预览URL
 *
 * @param file
 */
export function createPreviewUrl(file: File | Blob): string {
  return URL.createObjectURL(file)
}

/**
 * 释放预览URL
 *
 * @param url
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * 下载文件
 *
 * @param blob
 * @param filename
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
 * @param files
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
