<template>
  <!-- 拖拽上传区域 -->
  <div
    class="upload-area my-10 p-50 text-center border-2 border-gray-300 rounded-lg border-dashed cursor-pointer transition-all duration-300 hover:border-blue-500 hover:bg-blue-50"
    :class="{ 'bg-blue-50 border-blue-500': isDragOver }"
    @drop="handleDrop"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @click="handleClickUpload"
  >
    <div class="flex flex-col gap-2.5 items-center">
      <el-icon size="48" color="#409EFF">
        <UploadFilled />
      </el-icon>
      <p class="text-base text-gray-600 m-0">点击或拖拽图片到此处上传</p>
      <p class="text-sm text-gray-400 m-0">支持 JPG、PNG、GIF、BMP、WEBP 等格式</p>
      <p
        v-if="autoCompress"
        class="text-xs text-blue-500 mb-0 mt-2 flex items-center justify-center"
      >
        <el-icon class="mr-1 align-middle">
          <Lightning />
        </el-icon>
        自动压缩已启用，上传后将自动开始压缩
      </p>
    </div>
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*"
      class="hidden"
      @change="handleFileSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import Lightning from '~icons/ep/lightning'
import UploadFilled from '~icons/ep/upload-filled'
import { useImageCompressorStore } from '@/views/stores/image-compressor'

defineOptions({ name: 'ImageUpload' })

// 使用store
const store = useImageCompressorStore()
const { isDragOver, autoCompress } = storeToRefs(store)

const { handleDragOver, handleDragLeave, handleDrop, addFiles } = store

// 本地状态
const fileInputRef = ref<HTMLInputElement>()

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
</script>
