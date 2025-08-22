import pinia from '@wlydfe/pinia-plus'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 配置全局样式（在UnoCSS之前导入，确保主题变量优先）
import '@/assets/styles/index.scss'

// 配置unocss
import 'virtual:uno.css'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')
