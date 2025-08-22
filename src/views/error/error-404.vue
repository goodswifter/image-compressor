<template>
  <div class="error-404">
    <van-nav-bar title="404" left-arrow @click-left="onBack" />
    <h1>404</h1>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const onBack = () => router.back()
</script>
