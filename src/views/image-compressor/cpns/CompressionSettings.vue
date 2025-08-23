<template>
  <div class="mb-5">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span>压缩设置</span>
        </div>
      </template>

      <el-form :model="compressionOptions" label-width="100px" size="small">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="输出格式">
              <el-select v-model="compressionOptions.format" class="w-full">
                <el-option label="WebP(推荐)" value="webp" />
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
              <el-checkbox v-model="compressionOptions.maintainAspectRatio">保持宽高比</el-checkbox>
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
              <el-checkbox v-model="autoCompress" class="mb-2">拖拽后自动压缩</el-checkbox>
              <el-button
                type="primary"
                class="w-full"
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
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Loading from '~icons/ep/loading'
import { useImageCompressorStore } from '@/views/stores/image-compressor'

defineOptions({ name: 'CompressionSettings' })

// 使用store
const store = useImageCompressorStore()
const { compressionOptions, qualityPercent, autoCompress, imageFiles, isProcessing } =
  storeToRefs(store)

const { handleQualityChange, compressAllImages } = store
</script>
