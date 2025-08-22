<template>
  <div class="image-compressor">
    <!-- 压缩设置 -->
    <div class="compression-settings">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>压缩设置</span>
          </div>
        </template>

        <el-form :model="compressionOptions" label-width="100px" size="small">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="输出格式">
                <el-select v-model="compressionOptions.format" style="width: 100%">
                  <el-option label="WebP" value="webp" />
                  <el-option label="JPEG" value="jpeg" />
                  <el-option label="PNG" value="png" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="压缩质量">
                <el-slider
                  v-model="qualityPercent"
                  :min="10"
                  :max="100"
                  show-input
                  input-size="small"
                  @change="handleQualityChange"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <el-checkbox v-model="compressionOptions.maintainAspectRatio">
                  保持宽高比
                </el-checkbox>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="最大宽度">
                <el-input
                  v-model.number="compressionOptions.maxWidth"
                  placeholder="不限制"
                  type="number"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大高度">
                <el-input
                  v-model.number="compressionOptions.maxHeight"
                  placeholder="不限制"
                  type="number"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item>
                <el-checkbox v-model="autoCompress" style="margin-bottom: 8px">
                  拖拽后自动压缩
                </el-checkbox>
                <el-button
                  type="primary"
                  style="width: 100%"
                  :disabled="imageFiles.length === 0 || isProcessing"
                  @click="compressAllImages"
                >
                  <el-icon v-if="isProcessing" class="is-loading">
                    <Loading />
                  </el-icon>
                  {{ isProcessing ? '压缩中...' : '手动压缩' }}
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
    </div>

    <!-- 拖拽上传区域 -->
    <div
      class="upload-area"
      :class="{ 'is-dragover': isDragOver }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="handleClickUpload"
    >
      <div class="upload-content">
        <el-icon size="48" color="#409EFF">
          <UploadFilled />
        </el-icon>
        <p class="upload-text">点击或拖拽图片到此处上传</p>
        <p class="upload-hint">支持 JPG、PNG、GIF、BMP、WEBP 等格式</p>
        <p v-if="autoCompress" class="upload-auto-hint">
          <el-icon style="margin-right: 4px; vertical-align: middle"><Lightning /></el-icon>
          自动压缩已启用，上传后将自动开始压缩
        </p>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <!-- 图片列表 -->
    <div v-if="imageFiles.length > 0" class="image-list">
      <div class="list-header">
        <span>图片列表 ({{ imageFiles.length }})</span>
        <div class="list-actions">
          <el-button
            size="small"
            :disabled="!hasCompressedImages || isProcessing"
            @click="downloadAll"
          >
            <el-icon><Download /></el-icon>
            {{
              hasCompressedImages && imageFiles.filter(img => img.compressedBlob).length > 1
                ? '打包下载'
                : '批量下载'
            }}
          </el-button>
          <el-button size="small" type="danger" :disabled="isProcessing" @click="clearAll">
            <el-icon><Delete /></el-icon>
            清空列表
          </el-button>
        </div>
      </div>

      <!-- 总体积统计 -->
      <div v-if="totalSizeStats.totalFiles > 0" class="size-statistics">
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-label">原始总大小</div>
            <div class="stat-value original">
              {{ formatFileSize(totalSizeStats.totalOriginalSize) }}
            </div>
          </div>

          <div class="stat-arrow">
            <el-icon><Right /></el-icon>
          </div>

          <div class="stat-item">
            <div class="stat-label">压缩后大小</div>
            <div class="stat-value compressed">
              {{ formatFileSize(totalSizeStats.totalCompressedSize) }}
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-label">总体压缩率</div>
            <div
              class="stat-value compression-ratio"
              :class="getCompressionRatioClass(totalSizeStats.overallCompressionRatio)"
            >
              {{ totalSizeStats.overallCompressionRatio }}%
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-label">节省空间</div>
            <div class="stat-value saved">
              {{ formatFileSize(Math.max(0, totalSizeStats.savedSpace)) }}
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-label">处理进度</div>
            <div class="stat-value progress">
              {{ totalSizeStats.completedFiles }}/{{ totalSizeStats.totalFiles }}
            </div>
          </div>
        </div>
      </div>

      <div class="image-items">
        <div v-for="imageFile in imageFiles" :key="imageFile.id" class="image-item">
          <div class="image-preview">
            <img :src="imageFile.originalPreview" alt="原图预览" />
            <div class="image-overlay">
              <span class="file-name">{{ imageFile.file.name }}</span>
            </div>
          </div>

          <div class="image-info">
            <div class="image-details">
              <p>
                <strong>原始大小:</strong>
                {{ formatFileSize(imageFile.originalSize) }}
              </p>
              <p v-if="imageFile.compressedSize">
                <strong>压缩后:</strong>
                {{ formatFileSize(imageFile.compressedSize) }}
              </p>
              <p v-if="imageFile.compressionRatio !== undefined">
                <strong>压缩率:</strong>
                <span :class="getCompressionRatioClass(imageFile.compressionRatio)">
                  {{ imageFile.compressionRatio }}%
                </span>
              </p>
            </div>

            <div class="image-progress">
              <el-progress
                v-if="imageFile.status === 'processing'"
                :percentage="imageFile.progress"
                status="success"
                :stroke-width="6"
              />
              <div v-else-if="imageFile.status === 'success'" class="success-status">
                <el-icon color="#67C23A"><SuccessFilled /></el-icon>
                <span>压缩完成</span>
              </div>
              <div v-else-if="imageFile.status === 'error'" class="error-status">
                <el-icon color="#F56C6C"><CircleCloseFilled /></el-icon>
                <span>{{ imageFile.error || '压缩失败' }}</span>
              </div>
              <div v-else class="pending-status">
                <el-icon color="#909399"><Clock /></el-icon>
                <span>等待处理</span>
              </div>
            </div>

            <div class="image-actions">
              <el-button
                v-if="imageFile.compressedPreview"
                size="small"
                type="primary"
                @click="previewCompressed(imageFile)"
              >
                <i-ep-view mr-2 />
                预览
              </el-button>
              <el-button
                v-if="imageFile.compressedBlob"
                size="small"
                type="success"
                @click="downloadSingle(imageFile)"
              >
                <i-ep-download mr-2 />
                下载
              </el-button>
              <el-button
                size="small"
                type="danger"
                :disabled="isProcessing"
                @click="removeImage(imageFile.id)"
              >
                <i-ep-delete mr-2 />
                移除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="压缩对比预览" width="80%" top="5vh">
      <div v-if="currentPreviewImage" class="preview-content">
        <div class="preview-comparison">
          <div class="preview-item">
            <h4>原图</h4>
            <img :src="currentPreviewImage.originalPreview" alt="原图" />
            <p>{{ formatFileSize(currentPreviewImage.originalSize) }}</p>
          </div>
          <div class="preview-item">
            <h4>压缩后</h4>
            <img :src="currentPreviewImage.compressedPreview" alt="压缩后" />
            <p>{{ formatFileSize(currentPreviewImage.compressedSize || 0) }}</p>
          </div>
        </div>
        <div class="preview-stats">
          <el-statistic
            title="压缩率"
            :value="currentPreviewImage.compressionRatio || 0"
            suffix="%"
          />
          <div class="saved-space-stat">
            <div class="stat-title">节省空间</div>
            <div class="stat-value">
              {{
                formatFileSize(
                  (currentPreviewImage.originalSize || 0) -
                    (currentPreviewImage.compressedSize || 0),
                )
              }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { CompressionOptions, ImageFile } from '@/types/compressor'
import { ElMessage } from 'element-plus'
import { computed, onUnmounted, reactive, ref } from 'vue'
import CircleCloseFilled from '~icons/ep/circle-close-filled'
import Clock from '~icons/ep/clock'
import Delete from '~icons/ep/delete'
import Download from '~icons/ep/download'
import Lightning from '~icons/ep/lightning'
import Loading from '~icons/ep/loading'
import Right from '~icons/ep/right'
import SuccessFilled from '~icons/ep/success-filled'
import UploadFilled from '~icons/ep/upload-filled'
import {
  compressImage,
  createPreviewUrl,
  downloadFile,
  downloadMultipleFiles,
  formatFileSize,
  generateId,
  getFileExtension,
  isImageFile,
  revokePreviewUrl,
} from '@/utils/image-compressor'

defineOptions({ name: 'ImageCompressor' })

// 响应式数据
const isDragOver = ref(false)
const isProcessing = ref(false)
const imageFiles = ref<ImageFile[]>([])
const fileInputRef = ref<HTMLInputElement>()
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

// 点击上传
const handleClickUpload = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  addFiles(files)
  // 清空input值以允许重复选择同一文件
  target.value = ''
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
  const filename = `${baseName}_compressed.${compressionOptions.format}`

  downloadFile(imageFile.compressedBlob, filename)
}

// 批量下载
const downloadAll = async () => {
  const compressedFiles = imageFiles.value
    .filter(img => img.compressedBlob)
    .map(img => {
      const originalExt = getFileExtension(img.file.name)
      const baseName = img.file.name.replace(`.${originalExt}`, '')
      const filename = `${baseName}_compressed.${compressionOptions.format}`

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

// 组件卸载时清理URL和定时器
onUnmounted(() => {
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
})
</script>

<style scoped>
.image-compressor {
  max-width: 1200px;
  padding: 20px;
  margin: 0 auto;
}

.compression-settings {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload-area {
  padding: 40px;
  margin-bottom: 20px;
  text-align: center;
  cursor: pointer;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  transition: all 0.3s;
}

.upload-area:hover,
.upload-area.is-dragover {
  background-color: #f0f9ff;
  border-color: #409eff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.upload-text {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.upload-hint {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.upload-auto-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0 0;
  font-size: 12px;
  color: #409eff;
}

/* 总体积统计样式 */
.size-statistics {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f7ff 100%);
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
}

.stat-label {
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}

.stat-value.original {
  color: #909399;
}

.stat-value.compressed {
  color: #409eff;
}

.stat-value.saved {
  color: #67c23a;
}

.stat-value.progress {
  color: #e6a23c;
}

.stat-arrow {
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #409eff;
}

/* 响应式设计 */
@media (width <= 768px) {
  .stats-container {
    flex-direction: column;
    gap: 12px;
  }

  .stat-arrow {
    transform: rotate(90deg);
  }
}

.image-list {
  overflow: hidden;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-weight: 600;
  background: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.list-actions {
  display: flex;
  gap: 10px;
}

.image-items {
  padding: 20px;
}

.image-item {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: all 0.3s;
}

.image-item:hover {
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.image-item:last-child {
  margin-bottom: 0;
}

.image-preview {
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 6px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 4px 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: white;
  white-space: nowrap;
  background: rgb(0 0 0 / 70%);
}

.image-info {
  display: flex;
  flex: 1;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
}

.image-details p {
  margin: 4px 0;
  font-size: 14px;
  color: #606266;
}

.image-progress {
  min-width: 200px;
}

.success-status,
.error-status,
.pending-status {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
}

.image-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.preview-content {
  text-align: center;
}

.preview-comparison {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.preview-item {
  max-width: 300px;
}

.preview-item h4 {
  margin-bottom: 10px;
  color: #303133;
}

.preview-item img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
}

.preview-item p {
  margin-top: 10px;
  color: #909399;
}

.preview-stats {
  display: flex;
  gap: 60px;
  justify-content: center;
}

.saved-space-stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.stat-title {
  font-size: 14px;
  line-height: 1.5;
  color: #909399;
}

/* 压缩率颜色 */
.compression-excellent {
  font-weight: bold;
  color: #67c23a;
}

.compression-good {
  font-weight: bold;
  color: #409eff;
}

.compression-fair {
  font-weight: bold;
  color: #e6a23c;
}

.compression-poor {
  font-weight: bold;
  color: #f56c6c;
}

/* 响应式设计 */
@media (width <= 768px) {
  .image-item {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .image-info {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
    width: 100%;
  }

  .preview-comparison {
    flex-direction: column;
    gap: 30px;
    align-items: center;
  }

  .preview-stats {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
