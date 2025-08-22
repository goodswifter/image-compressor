<template>
  <ElConfigProvider :locale="zhCn">
    <router-view v-slot="{ Component, route }">
      <keep-alive>
        <component :is="Component" v-if="route.meta.keepAlive !== false" :key="route.fullPath" />
      </keep-alive>
      <component :is="Component" v-if="route.meta.keepAlive === false" :key="route.fullPath" />
    </router-view>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
</script>
