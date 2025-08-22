<template>
  <div class="about">
    <div p-20 bg-green>
      <div my-10 flex-center flex-wrap gap-20>
        <el-button type="primary">主要按钮</el-button>
        <el-button type="success">成功按钮</el-button>
        <el-button type="default">默认按钮</el-button>
        <el-button type="danger">危险按钮</el-button>
        <el-button type="warning">警告按钮</el-button>
      </div>

      <el-date-picker
        v-model="currentDate"
        title="选择日期"
        :min-date="minDate"
        :max-date="maxDate"
      />

      <div>哈哈哈哈</div>
      <div class="text-2xl c-primary">{{ msg }}</div>
      <div>
        {{ count }}
        <i-ep-arrow-right />
      </div>
      <DetailText message="1213" max-length="100" />
      <Edit />
    </div>
  </div>
</template>

<script setup lang="ts">
import Edit from '~icons/ep/edit'
import DetailText from '@/components/detail-text/index.vue'

defineOptions({ name: 'About' })

defineProps({
  msg: { type: String, default: '123' },
})

const userStore = useUserStore()
const { count: count2 } = storeToRefs(userStore)
console.log(count2.value)

const count = ref(100)

// 时间选择器
const minDate = new Date(2020, 0, 1)
const maxDate = new Date(2025, 5, 1)
const currentDate = ref([])
</script>
