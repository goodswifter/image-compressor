<template>
  <div class="cart">
    <h2>cart: {{ message }}</h2>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: '哈哈哈',
  },
  maxLength: {
    type: [Number, String],
    default: 100,
  },
})
</script>

<style>
.cart {
  color: red;
}
</style>
