import type { CompressionOptions, ImageFile } from '@/types/compressor'
import { ElMessage } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import {
  compressImage,
  createPreviewUrl,
  downloadFile,
  downloadMultipleFiles,
  formatFileSize,
  formatTotalSize,
  generateId,
  getFileExtension,
  isImageFile,
  revokePreviewUrl,
} from '@/utils/image-compressor'

export const useImageCompressorStore = defineStore('imageCompressor', () => {
  // 响应式数据
  const isDragOver = ref(false)
  const isProcessing = ref(false)
  const imageFiles = ref<ImageFile[]>([])
  const previewDialogVisible = ref(false)
  const currentPreviewImage = ref<ImageFile | null>(null)
  const autoCompress = ref(true) // 默认启用自动压缩
  let autoCompressTimer: NodeJS.Timeout | null = null

  // 压缩选项
  const compressionOptions = reactive<CompressionOptions>({
    format: 'webp',
    quality: 0.8,
    maxWidth: undefined,
    maxHeight: undefined,
    maintainAspectRatio: true,
  })

  // 质量百分比（用于滑块显示）
  const qualityPercent = ref(100)

  // 计算属性
  const hasCompressedImages = computed(() =>
    imageFiles.value.some(img => img.status === 'success' && img.compressedBlob),
  )

  // 计算总体积统计
  const totalSizeStats = computed(() => {
    const totalOriginalSize = imageFiles.value.reduce((sum, img) => sum + img.originalSize, 0)
    const totalCompressedSize = imageFiles.value.reduce((sum, img) => {
      return sum + (img.compressedSize || img.originalSize)
    }, 0)

    const overallCompressionRatio =
      totalOriginalSize > 0
        ? Math.round(((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100)
        : 0

    const savedSpace = totalOriginalSize - totalCompressedSize

    return {
      totalOriginalSize,
      totalCompressedSize,
      overallCompressionRatio,
      savedSpace,
      totalFiles: imageFiles.value.length,
      completedFiles: imageFiles.value.filter(img => img.status === 'success').length,
    }
  })

  // 处理质量变化
  const handleQualityChange = (value: number | number[]) => {
    const numValue = Array.isArray(value) ? value[0] : value
    compressionOptions.quality = numValue / 100
  }

  // 拖拽处理
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    isDragOver.value = true
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    isDragOver.value = false
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    isDragOver.value = false

    const files = Array.from(e.dataTransfer?.files || [])
    addFiles(files)
  }

  // 添加文件
  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!isImageFile(file)) {
        ElMessage.warning(`文件 ${file.name} 不是有效的图片格式`)
        return false
      }
      return true
    })

    validFiles.forEach(file => {
      const imageFile: ImageFile = {
        id: generateId(),
        file,
        originalSize: file.size,
        status: 'pending',
        originalPreview: createPreviewUrl(file),
        progress: 0,
      }
      imageFiles.value.push(imageFile)
    })

    if (validFiles.length > 0) {
      ElMessage.success(`成功添加 ${validFiles.length} 个图片文件`)

      // 自动压缩功能
      if (autoCompress.value && !isProcessing.value) {
        // 清除之前的定时器，防止重复触发
        if (autoCompressTimer) {
          clearTimeout(autoCompressTimer)
        }

        // 延迟500ms后开始压缩，给用户一点反应时间
        autoCompressTimer = setTimeout(() => {
          if (imageFiles.value.some(img => img.status === 'pending')) {
            ElMessage.info('检测到自动压缩已启用，开始压缩图片...')
            compressAllImages()
          }
        }, 500)
      }
    }
  }

  // 压缩单个图片
  const compressSingleImage = async (imageFile: ImageFile): Promise<void> => {
    imageFile.status = 'processing'
    imageFile.progress = 0

    try {
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        if (imageFile.progress < 90) {
          imageFile.progress += Math.random() * 20
        }
      }, 100)

      const result = await compressImage(imageFile.file, compressionOptions)

      clearInterval(progressInterval)
      imageFile.progress = 100

      // 更新图片信息
      imageFile.compressedBlob = result.blob
      imageFile.compressedSize = result.size
      imageFile.compressionRatio = result.compressionRatio
      imageFile.compressedPreview = createPreviewUrl(result.blob)
      imageFile.status = 'success'
    } catch (error) {
      imageFile.status = 'error'
      imageFile.error = error instanceof Error ? error.message : '压缩失败'
      imageFile.progress = 0
    }
  }

  // 压缩所有图片
  const compressAllImages = async () => {
    if (isProcessing.value) return

    isProcessing.value = true

    try {
      // 重置所有图片状态
      imageFiles.value.forEach(img => {
        if (img.status !== 'success') {
          img.status = 'pending'
          img.progress = 0
          img.error = undefined
        }
      })

      // 逐个压缩图片
      for (const imageFile of imageFiles.value) {
        if (imageFile.status === 'pending') {
          await compressSingleImage(imageFile)
        }
      }

      const successCount = imageFiles.value.filter(img => img.status === 'success').length
      ElMessage.success(`压缩完成！成功处理 ${successCount} 个图片`)
    } finally {
      isProcessing.value = false
    }
  }

  // 移除图片
  const removeImage = (id: string) => {
    const index = imageFiles.value.findIndex(img => img.id === id)
    if (index !== -1) {
      const imageFile = imageFiles.value[index]
      // 释放预览URL
      revokePreviewUrl(imageFile.originalPreview)
      if (imageFile.compressedPreview) {
        revokePreviewUrl(imageFile.compressedPreview)
      }
      imageFiles.value.splice(index, 1)
    }
  }

  // 清空所有图片
  const clearAll = () => {
    imageFiles.value.forEach(img => {
      revokePreviewUrl(img.originalPreview)
      if (img.compressedPreview) {
        revokePreviewUrl(img.compressedPreview)
      }
    })
    imageFiles.value = []
    ElMessage.success('已清空所有图片')
  }

  // 预览压缩后的图片
  const previewCompressed = (imageFile: ImageFile) => {
    currentPreviewImage.value = imageFile
    previewDialogVisible.value = true
  }

  // 下载单个文件
  const downloadSingle = (imageFile: ImageFile) => {
    if (!imageFile.compressedBlob) return

    const originalExt = getFileExtension(imageFile.file.name)
    const baseName = imageFile.file.name.replace(`.${originalExt}`, '')
    const filename = `${baseName}.${compressionOptions.format}`

    downloadFile(imageFile.compressedBlob, filename)
  }

  // 批量下载
  const downloadAll = async () => {
    const compressedFiles = imageFiles.value
      .filter(img => img.compressedBlob)
      .map(img => {
        const originalExt = getFileExtension(img.file.name)
        const baseName = img.file.name.replace(`.${originalExt}`, '')
        const filename = `${baseName}.${compressionOptions.format}`

        return {
          blob: img.compressedBlob!,
          filename,
        }
      })

    if (compressedFiles.length === 0) {
      ElMessage.warning('没有可下载的压缩文件')
      return
    }

    // 显示下载进度
    const loadingMessage = ElMessage({
      message:
        compressedFiles.length === 1
          ? '正在准备下载...'
          : `正在打包 ${compressedFiles.length} 个文件到ZIP压缩包...`,
      type: 'info',
      duration: 0, // 不自动关闭
      showClose: false,
    })

    try {
      await downloadMultipleFiles(compressedFiles)

      // 关闭加载提示
      loadingMessage.close()

      // 显示成功消息
      if (compressedFiles.length === 1) {
        ElMessage.success('文件下载成功！')
      } else {
        ElMessage.success(
          `成功打包下载 ${compressedFiles.length} 个文件！解压后可在文件夹中查看所有图片`,
        )
      }
    } catch (error) {
      // 关闭加载提示
      loadingMessage.close()

      // 显示错误消息
      const errorMsg = error instanceof Error ? error.message : '批量下载失败'
      ElMessage.error(errorMsg)
    }
  }

  // 获取压缩率样式类
  const getCompressionRatioClass = (ratio: number) => {
    if (ratio >= 50) return 'compression-excellent'
    if (ratio >= 30) return 'compression-good'
    if (ratio >= 10) return 'compression-fair'
    return 'compression-poor'
  }

  // 清理资源
  const cleanup = () => {
    imageFiles.value.forEach(img => {
      revokePreviewUrl(img.originalPreview)
      if (img.compressedPreview) {
        revokePreviewUrl(img.compressedPreview)
      }
    })

    // 清理自动压缩定时器
    if (autoCompressTimer) {
      clearTimeout(autoCompressTimer)
    }
  }

  return {
    // 状态
    isDragOver,
    isProcessing,
    imageFiles,
    previewDialogVisible,
    currentPreviewImage,
    autoCompress,
    compressionOptions,
    qualityPercent,

    // 计算属性
    hasCompressedImages,
    totalSizeStats,

    // 方法
    handleQualityChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    addFiles,
    compressSingleImage,
    compressAllImages,
    removeImage,
    clearAll,
    previewCompressed,
    downloadSingle,
    downloadAll,
    getCompressionRatioClass,
    cleanup,
    formatFileSize,
    formatTotalSize,
  }
})
