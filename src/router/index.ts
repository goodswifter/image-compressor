import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './modules'

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH || '/'),
  routes,
})

export default router
