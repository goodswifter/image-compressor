<template>
  <div>
    <van-nav-bar title="未知页面" left-arrow @click-left="onBack" />
    <div p-20 flex-y-center>
      <div>没有找到页面</div>
      <span class="text-primary">{{ route.path }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const onBack = () => router.back()
</script>
