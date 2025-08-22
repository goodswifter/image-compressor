import type { PluginOption } from 'vite'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { visualizer } from 'rollup-plugin-visualizer'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import removeConsole from 'vite-plugin-remove-console'
import svgLoader from 'vite-svg-loader'
import { viteGenAssets } from '../scripts/vite-plugin-gen-assets'
import { configCompressPlugin } from './compress'
import { viteBuildInfo } from './info'

export const getPluginsList = (VITE_COMPRESSION: ViteCompression = 'gzip'): PluginOption[] => {
  const lifecycle = process.env.npm_lifecycle_event
  return [
    vue(),
    // jsx、tsx语法支持
    vueJsx(),
    viteBuildInfo(),
    // 生成图片资源常量
    viteGenAssets(),
    // svg组件化支持
    svgLoader(),
    configCompressPlugin(VITE_COMPRESSION),
    // 线上环境删除console
    removeConsole(),
    // 打包分析
    lifecycle === 'report'
      ? visualizer({ open: true, brotliSize: true, filename: 'report.html' })
      : (null as any),

    UnoCSS({ inspector: false }),
    // 三方库自动导入
    AutoImport({
      imports: [
        'vue',
        'pinia',
        'vue-router',
        {
          from: 'vue-router',
          imports: ['RouteRecordRaw'],
          type: true,
        },
        { '@/assets/r': ['R'] },
      ],
      resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
      // eslintrc: { enabled: true },
      dirs: [{ glob: 'src/enums/**' }, 'src/composables', 'src/stores'],
      dts: 'typings/auto-imports.d.ts',
      vueTemplate: true,
    }),
    // 组件自动导入
    Components({
      extensions: ['svg'], // 要处理的扩展名
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' }),
        IconsResolver({ enabledCollections: ['ep', 'mdi'] }),
        {
          type: 'component',
          resolve: name => {
            // 检查组件名是否以SVG开头
            if (name.startsWith('SVG')) {
              // 提取Svg后面的部分作为文件名，首字母小写
              const fileName = name.slice(3).charAt(0).toLowerCase() + name.slice(4)
              // 文件名 转成 短横线
              const _fileName = fileName.replaceAll(/([A-Z])/g, '-$1').toLowerCase()
              return {
                from: `@/assets/svgs/${_fileName}.svg?component`,
                name: 'default',
              }
            }
          },
        },
      ],
      dirs: [],
      dts: 'typings/components.d.ts',
    }),
    Icons({ compiler: 'vue3', autoInstall: true }),
  ]
}
