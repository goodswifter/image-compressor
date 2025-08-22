<template>
  <div class="mx-auto p-5 max-w-1200">
    <!-- 1. 压缩设置 -->
    <CompressionSettings />

    <!-- 2. 上传图片 -->
    <ImageUpload />

    <!-- 3. 资源展示 -->
    <ResourceDisplay />

    <!-- 4. 功能特色 -->
    <!-- <FeatureIntro mt-20 /> -->
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useImageCompressorStore } from '@/stores/image-compressor'
import CompressionSettings from './cpns/CompressionSettings.vue'
import ImageUpload from './cpns/ImageUpload.vue'
import ResourceDisplay from './cpns/ResourceDisplay.vue'

defineOptions({ name: 'ImageCompressor' })

// 使用store
const store = useImageCompressorStore()

// 组件卸载时清理资源
onUnmounted(() => {
  store.cleanup()
})
</script>
