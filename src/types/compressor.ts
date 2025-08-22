/**
 * 图片压缩相关类型定义
 */

export interface ImageFile {
  /** 文件ID */
  id: string
  /** 原始文件 */
  file: File
  /** 原始文件大小（字节） */
  originalSize: number
  /** 压缩后文件大小（字节） */
  compressedSize?: number
  /** 压缩比例 (0-100) */
  compressionRatio?: number
  /** 压缩状态 */
  status: 'pending' | 'processing' | 'success' | 'error'
  /** 错误信息 */
  error?: string
  /** 原始图片预览URL */
  originalPreview: string
  /** 压缩后的Blob */
  compressedBlob?: Blob
  /** 压缩后的预览URL */
  compressedPreview?: string
  /** 压缩进度 (0-100) */
  progress: number
}

export interface CompressionOptions {
  /** 目标格式 */
  format: 'webp' | 'jpeg' | 'png'
  /** 压缩质量 (0-1) */
  quality: number
  /** 最大宽度 */
  maxWidth?: number
  /** 最大高度 */
  maxHeight?: number
  /** 是否保持宽高比 */
  maintainAspectRatio: boolean
}

export interface CompressionResult {
  /** 压缩后的Blob */
  blob: Blob
  /** 压缩比例 */
  compressionRatio: number
  /** 压缩后大小 */
  size: number
}
