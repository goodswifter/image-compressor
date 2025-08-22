import type { Plugin } from 'vite'
import { execSync } from 'node:child_process'

// 创建自定义插件来执行 gen:images:once 命令
const viteGenAssets = (): Plugin => {
  return {
    name: 'vite-plugin-gen-assets',
    // 在构建开始时执行
    buildStart() {
      console.log('正在执行 gen:images:once 命令...')
      try {
        execSync('node scripts/generate-assets.js --no-watch', { stdio: 'inherit' })
        console.log('gen:images:once 命令执行完成')
      } catch (error) {
        console.error('执行 gen:images:once 命令失败:', error)
      }
    },
    // 在开发服务器开始时也会触发此钩子
    // configureServer() {
    //   // 这个钩子只在开发模式下触发
    //   console.log('开发启动: 正在执行 gen:images:once 命令...')
    //   try {
    //     execSync('node build/assets-generator.js --no-watch', { stdio: 'inherit' })
    //     console.log('开发启动: gen:images:once 命令执行完成')
    //   } catch (error) {
    //     console.error('开发启动: 执行 gen:images:once 命令失败:', error)
    //   }
    // },
  }
}

export { viteGenAssets }
