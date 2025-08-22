<template>
  <div>
    <h1>首页</h1>
    <Circle />
    <IconAccountBox />
    <i-mdi-account-group-outline />
    <el-button type="primary" @click="onGotoAbout">跳转about</el-button>
    <el-input v-model="value" placeholder="请输入用户名" />
    <el-button type="primary" @click="onShowToast">showToast</el-button>
    <div h-1000>长列表</div>
    <el-button type="primary" @click="onGotoAbout">跳转about</el-button>
  </div>
</template>

<script setup lang="ts">
import Circle from '~icons/ep/circle-check-filled'
import IconAccountBox from '~icons/mdi/account-box'

defineOptions({ name: 'Home' })

const value = ref('123')

const router = useRouter()
const onGotoAbout = () => {
  router.push('/about')
}

const onShowToast = () => {
  ElMessage.success('success')
}

console.log('home')
onMounted(() => {
  console.log('home mounted')
})
</script>
