const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/index.vue'), // 懒加载组件
  },
]

export default routes
