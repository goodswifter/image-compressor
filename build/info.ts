import type { Plugin } from 'vite'
import path from 'node:path'
import boxen, { type Options as BoxenOptions } from 'boxen'
import dayjs, { type Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import fs from 'fs-extra'
import gradient from 'gradient-string'
import { getPackageSize, root } from './utils'

dayjs.extend(duration)

const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))
const { name } = packageJson

const welcomeMessage = gradient(['cyan', 'magenta']).multiline(`您好! 欢迎使用 ${name} 系统`)

const boxenOptions: BoxenOptions = {
  padding: 0.5,
  borderColor: 'cyan',
  borderStyle: 'round',
}

export function viteBuildInfo(): Plugin {
  let config: { command: string }
  let startTime: Dayjs
  let endTime: Dayjs
  let outDir: string
  return {
    name: 'vite:buildInfo',
    configResolved(resolvedConfig) {
      config = resolvedConfig
      outDir = resolvedConfig.build?.outDir ?? 'dist'
    },
    buildStart() {
      console.log(boxen(welcomeMessage, boxenOptions))
      if (config.command === 'build') {
        startTime = dayjs(new Date())
      }
    },
    closeBundle() {
      if (config.command === 'build') {
        endTime = dayjs(new Date())
        getPackageSize({
          folder: outDir,
          callback: (size: number | string) => {
            console.log(
              boxen(
                gradient(['cyan', 'magenta']).multiline(
                  `🎉 恭喜打包完成（总用时${dayjs
                    .duration(endTime.diff(startTime))
                    .format('mm分ss秒')}，打包后的大小为${size}）`,
                ),
                boxenOptions,
              ),
            )
          },
        })
      }
    },
  }
}
