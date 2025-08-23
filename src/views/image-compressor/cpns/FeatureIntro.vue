<template>
  <div>
    <div class="features-section">
      <h2 class="features-title">功能特色</h2>
      <div class="features-grid">
        <div class="feature-card">
          <el-icon class="feature-icon" color="#409EFF">
            <Upload />
          </el-icon>
          <h3>批量拖拽上传</h3>
          <p>支持拖拽多个图片文件同时上传，操作简单便捷</p>
        </div>

        <div class="feature-card">
          <el-icon class="feature-icon" color="#67C23A">
            <MagicStick />
          </el-icon>
          <h3>智能压缩</h3>
          <p>采用先进的压缩算法，在保持画质的前提下最大化减小文件体积</p>
        </div>

        <div class="feature-card">
          <el-icon class="feature-icon" color="#E6A23C">
            <DocumentCopy />
          </el-icon>
          <h3>格式转换</h3>
          <p>支持JPG、PNG、GIF等多种格式转换为现代化的WebP格式</p>
        </div>

        <div class="feature-card">
          <el-icon class="feature-icon" color="#F56C6C">
            <Download />
          </el-icon>
          <h3>批量下载</h3>
          <p>压缩完成后支持批量下载所有文件，提高工作效率</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'FeatureIntro' })
</script>
