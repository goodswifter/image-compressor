export const useUserStore = defineStore('user', () => {
  const count = ref(0)

  return {
    count,
  }
})
