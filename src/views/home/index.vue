<template>
  <div class="home-container">
    <div class="home-header">
      <h1 class="title">
        <el-icon class="title-icon">
          <Picture />
        </el-icon>
        图片压缩器
      </h1>
      <p class="subtitle">
        支持多种图片格式转换为WebP，实现高效压缩，保持画质的同时大幅减小文件体积
      </p>
    </div>

    <ImageCompressor />

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
import DocumentCopy from '~icons/ep/document-copy'
import Download from '~icons/ep/download'
import MagicStick from '~icons/ep/magic-stick'
import Picture from '~icons/ep/picture'
import Upload from '~icons/ep/upload'
import ImageCompressor from '@/components/image-compressor/index.vue'

defineOptions({ name: 'Home' })
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.home-header {
  padding: 40px 20px;
  margin-bottom: 40px;
  color: white;
  text-align: center;
}

.title {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  margin: 0 0 20px;
  font-size: 3rem;
  font-weight: 700;
}

.title-icon {
  font-size: 3rem;
}

.subtitle {
  max-width: 600px;
  margin: 0 auto;
  font-size: 1.2rem;
  line-height: 1.6;
  opacity: 0.9;
}

.features-section {
  max-width: 1200px;
  padding: 40px 20px;
  margin: 60px auto 0;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgb(0 0 0 / 10%);
}

.features-title {
  margin-bottom: 40px;
  font-size: 2rem;
  font-weight: 600;
  color: #303133;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
}

.feature-card {
  padding: 30px 20px;
  text-align: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  background: white;
  box-shadow: 0 15px 40px rgb(0 0 0 / 10%);
  transform: translateY(-5px);
}

.feature-icon {
  margin-bottom: 20px;
  font-size: 3rem;
}

.feature-card h3 {
  margin: 0 0 15px;
  font-size: 1.3rem;
  font-weight: 600;
  color: #303133;
}

.feature-card p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #606266;
}

/* 响应式设计 */
@media (width <= 768px) {
  .home-header {
    padding: 20px;
  }

  .title {
    flex-direction: column;
    gap: 10px;
    font-size: 2.5rem;
  }

  .title-icon {
    font-size: 2.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .features-section {
    padding: 30px 15px;
    margin-top: 40px;
    border-radius: 15px;
  }

  .features-title {
    margin-bottom: 30px;
    font-size: 1.8rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .feature-card {
    padding: 25px 15px;
  }
}

@media (width <= 480px) {
  .home-container {
    padding: 15px;
  }

  .title {
    font-size: 2rem;
  }

  .title-icon {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .feature-icon {
    font-size: 2.5rem;
  }
}
</style>
