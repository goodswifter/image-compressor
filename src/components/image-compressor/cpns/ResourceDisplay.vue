<template>
  <!-- 图片列表 -->
  <div v-if="imageFiles.length > 0" class="p-32 rounded-2xl bg-white shadow-2xl overflow-hidden">
    <div
      class="font-semibold p-24 border-b-2 border-gray-200 rounded-t-2xl flex items-center justify-between from-gray-50 to-gray-100 bg-gradient-to-r"
    >
      <span class="text-xl">图片列表 ({{ imageFiles.length }})</span>
      <div flex gap-16>
        <el-button
          size="default"
          :disabled="!hasCompressedImages || isProcessing"
          @click="downloadAll"
        >
          <i-ep-download mr-2 />
          {{
            hasCompressedImages && imageFiles.filter(img => img.compressedBlob).length > 1
              ? '打包下载'
              : '批量下载'
          }}
        </el-button>
        <el-button size="default" type="danger" :disabled="isProcessing" @click="clearAll">
          <el-icon><Delete /></el-icon>
          清空列表
        </el-button>
      </div>
    </div>

    <!-- 总体积统计 -->
    <div
      v-if="totalSizeStats.totalFiles > 0"
      class="p-20 border-b-2 border-t-2 border-blue-200 shadow-inner from-blue-50 to-blue-100 bg-gradient-to-r"
    >
      <div class="flex flex-wrap gap-12 items-center justify-between">
        <div
          class="p-4 rounded-xl bg-white bg-opacity-60 flex flex-col min-w-32 shadow-sm items-center"
        >
          <div class="text-sm text-gray-500 font-medium mb-2 text-center">原始总大小</div>
          <div class="text-lg text-gray-600 font-bold text-center">
            {{ formatTotalSize(totalSizeStats.totalOriginalSize) }}
          </div>
        </div>

        <div class="text-2xl text-blue-500 p-4 flex items-center">
          <el-icon><Right /></el-icon>
        </div>

        <div
          class="p-4 rounded-xl bg-white bg-opacity-60 flex flex-col min-w-32 shadow-sm items-center"
        >
          <div class="text-sm text-gray-500 font-medium mb-2 text-center">压缩后大小</div>
          <div class="text-lg text-blue-600 font-bold text-center">
            {{ formatTotalSize(totalSizeStats.totalCompressedSize) }}
          </div>
        </div>

        <div
          class="p-4 rounded-xl bg-white bg-opacity-60 flex flex-col min-w-32 shadow-sm items-center"
        >
          <div class="text-sm text-gray-500 font-medium mb-2 text-center">总体压缩率</div>
          <div
            class="text-lg font-bold text-center"
            :class="getCompressionRatioColorClass(totalSizeStats.overallCompressionRatio)"
          >
            {{ totalSizeStats.overallCompressionRatio }}%
          </div>
        </div>

        <div
          class="p-4 rounded-xl bg-white bg-opacity-60 flex flex-col min-w-32 shadow-sm items-center"
        >
          <div class="text-sm text-gray-500 font-medium mb-2 text-center">节省空间</div>
          <div class="text-lg text-green-600 font-bold text-center">
            {{ formatTotalSize(Math.max(0, totalSizeStats.savedSpace)) }}
          </div>
        </div>

        <div
          class="p-4 rounded-xl bg-white bg-opacity-60 flex flex-col min-w-32 shadow-sm items-center"
        >
          <div class="text-sm text-gray-500 font-medium mb-2 text-center">处理进度</div>
          <div class="text-lg text-orange-500 font-bold text-center">
            {{ totalSizeStats.completedFiles }}/{{ totalSizeStats.totalFiles }}
          </div>
        </div>
      </div>
    </div>

    <div class="p-20">
      <div
        v-for="imageFile in imageFiles"
        :key="imageFile.id"
        class="mb-8 p-8 border-2 border-gray-200 rounded-2xl flex gap-8 transition-all duration-300 items-center from-white to-gray-50 bg-gradient-to-r last:mb-0 hover:border-blue-300 hover:shadow-xl"
      >
        <div class="rounded-xl flex-shrink-0 h-32 w-32 shadow-lg relative overflow-hidden">
          <img :src="imageFile.originalPreview" alt="原图预览" class="h-full w-full object-cover" />
          <div
            class="text-sm text-white px-3 py-2 bg-black bg-opacity-80 whitespace-nowrap text-ellipsis bottom-0 left-0 right-0 absolute overflow-hidden"
          >
            {{ imageFile.file.name }}
          </div>
        </div>

        <div class="flex flex-1 gap-8 items-center justify-between">
          <div>
            <p class="text-base text-gray-700 my-2">
              <strong>原始大小:</strong>
              {{ formatFileSize(imageFile.originalSize) }}
            </p>
            <p v-if="imageFile.compressedSize" class="text-sm text-gray-600 my-1">
              <strong>压缩后:</strong>
              {{ formatFileSize(imageFile.compressedSize) }}
            </p>
            <p v-if="imageFile.compressionRatio !== undefined" class="text-sm text-gray-600 my-1">
              <strong>压缩率:</strong>
              <span :class="getCompressionRatioColorClass(imageFile.compressionRatio)">
                {{ imageFile.compressionRatio }}%
              </span>
            </p>
          </div>

          <div class="min-w-64">
            <el-progress
              v-if="imageFile.status === 'processing'"
              :percentage="imageFile.progress"
              status="success"
              :stroke-width="8"
            />
            <div
              v-else-if="imageFile.status === 'success'"
              class="text-base p-3 rounded-lg bg-green-50 flex gap-3 items-center"
            >
              <el-icon color="#67C23A"><SuccessFilled /></el-icon>
              <span>压缩完成</span>
            </div>
            <div
              v-else-if="imageFile.status === 'error'"
              class="text-base p-3 rounded-lg bg-red-50 flex gap-3 items-center"
            >
              <el-icon color="#F56C6C"><CircleCloseFilled /></el-icon>
              <span>{{ imageFile.error || '压缩失败' }}</span>
            </div>
            <div v-else class="text-base p-3 rounded-lg bg-gray-50 flex gap-3 items-center">
              <el-icon color="#909399"><Clock /></el-icon>
              <span>等待处理</span>
            </div>
          </div>

          <div class="flex flex-shrink-0 gap-4">
            <el-button
              v-if="imageFile.compressedPreview"
              size="default"
              type="primary"
              @click="previewCompressed(imageFile)"
            >
              <i-ep-view class="mr-0.5" />
              预览
            </el-button>
            <el-button
              v-if="imageFile.compressedBlob"
              size="default"
              type="success"
              @click="downloadSingle(imageFile)"
            >
              <i-ep-download class="mr-0.5" />
              下载
            </el-button>
            <el-button
              size="default"
              type="danger"
              :disabled="isProcessing"
              @click="removeImage(imageFile.id)"
            >
              <i-ep-delete class="mr-0.5" />
              移除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 预览对话框 -->
  <el-dialog
    v-model="previewDialogVisible"
    title="压缩对比预览"
    width="90%"
    top="3vh"
    class="preview-dialog"
  >
    <div v-if="currentPreviewImage" class="text-center">
      <div class="mb-12 flex gap-12 justify-around">
        <div class="p-6 rounded-2xl bg-gray-50 max-w-96 shadow-lg">
          <h4 class="text-xl text-gray-800 font-semibold mb-4 text-center">原图</h4>
          <img
            :src="currentPreviewImage.originalPreview"
            alt="原图"
            class="rounded-2xl max-h-96 max-w-full shadow-2xl"
          />
          <p class="text-lg text-gray-600 font-medium mt-4 text-center">
            {{ formatFileSize(currentPreviewImage.originalSize) }}
          </p>
        </div>
        <div class="p-6 rounded-2xl bg-gray-50 max-w-96 shadow-lg">
          <h4 class="text-xl text-gray-800 font-semibold mb-4 text-center">压缩后</h4>
          <img
            :src="currentPreviewImage.compressedPreview"
            alt="压缩后"
            class="rounded-2xl max-h-96 max-w-full shadow-2xl"
          />
          <p class="text-lg text-gray-600 font-medium mt-4 text-center">
            {{ formatFileSize(currentPreviewImage.compressedSize || 0) }}
          </p>
        </div>
      </div>
      <div class="p-8 rounded-2xl bg-gray-50 flex gap-20 shadow-inner justify-center">
        <el-statistic
          title="压缩率"
          :value="currentPreviewImage.compressionRatio || 0"
          suffix="%"
        />
        <div class="p-6 rounded-xl bg-white flex flex-col gap-3 shadow-sm items-center">
          <div class="text-base text-gray-600 leading-6 font-medium">节省空间</div>
          <div class="text-xl text-gray-800 leading-6 font-bold">
            {{
              formatFileSize(
                (currentPreviewImage.originalSize || 0) - (currentPreviewImage.compressedSize || 0),
              )
            }}
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import CircleCloseFilled from '~icons/ep/circle-close-filled'
import Clock from '~icons/ep/clock'
import Delete from '~icons/ep/delete'
import Right from '~icons/ep/right'
import SuccessFilled from '~icons/ep/success-filled'
import { useImageCompressorStore } from '@/stores/image-compressor'

defineOptions({ name: 'ResourceDisplay' })

// 使用store
const store = useImageCompressorStore()
const {
  imageFiles,
  hasCompressedImages,
  isProcessing,
  totalSizeStats,
  previewDialogVisible,
  currentPreviewImage,
} = storeToRefs(store)

const {
  downloadAll,
  clearAll,
  previewCompressed,
  downloadSingle,
  removeImage,
  formatFileSize,
  formatTotalSize,
} = store

// 获取压缩率颜色类
const getCompressionRatioColorClass = (ratio: number) => {
  if (ratio >= 50) return 'text-green-600 font-bold'
  if (ratio >= 30) return 'text-blue-500 font-bold'
  if (ratio >= 10) return 'text-orange-500 font-bold'
  return 'text-red-500 font-bold'
}
</script>

<style>
/* 移动端适配 */
@media (width <= 768px) {
  .stats-container {
    flex-direction: column;
    gap: 12px;
  }

  .stats-container .stat-arrow {
    transform: rotate(90deg);
  }

  .image-item {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start !important;
  }

  .image-info {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start !important;
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
