import path from 'node:path'
import { version } from 'node:process'
import { type ConfigEnv, loadEnv, type UserConfigExport } from 'vite'
import { getPluginsList } from './build/plugins'
import { __APP_INFO__, root, wrapperEnv } from './build/utils'

export default ({ mode }: ConfigEnv): UserConfigExport => {
  console.log('node version:', version)

  const { VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH, VITE_BASE_URL } = wrapperEnv(
    loadEnv(mode, root),
  )
  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.vue'],
    },
    server: {
      host: true, // 设置为 true 使用局域网 IP
      port: VITE_PORT,
      proxy: {
        '^/gateway': {
          target: VITE_BASE_URL,
          changeOrigin: true,
        },
      },
    },
    plugins: getPluginsList(VITE_COMPRESSION),
    build: {
      target: 'es2015',
      sourcemap: false,
      // 消除打包大小超过500kb警告
      chunkSizeWarningLimit: 4000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 手动分包 element-plus
            if (id.includes('node_modules/element-plus')) return 'element-plus'
          },
          entryFileNames: 'assets/[name].[hash].js', // 控制入口文件的命名
          chunkFileNames: 'assets/[name].[hash].js', // 控制拆分 chunk 的命名
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]', // 控制静态资源的命名
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  }
}
