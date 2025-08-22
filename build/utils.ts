import { readdir, stat } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import dayjs from 'dayjs'
import { dependencies, devDependencies, engines, name, version } from '../package.json'

/** 启动`node`进程时所在工作目录的绝对路径 */
const root: string = process.cwd()

/**
 * 根据可选的路径片段生成一个新的绝对路径
 *
 * @param dir 路径片段，默认`build`
 * @param metaUrl 模块的完整`url`，如果在`build`目录外调用必传`import.meta.url`
 */
const pathResolve = (dir = '.', metaUrl = import.meta.url) => {
  // 当前文件目录的绝对路径
  const currentFileDir = dirname(fileURLToPath(metaUrl))
  // build 目录的绝对路径
  const buildDir = resolve(currentFileDir, 'build')
  // 解析的绝对路径
  const resolvedPath = resolve(currentFileDir, dir)
  // 检查解析的绝对路径是否在 build 目录内
  if (resolvedPath.startsWith(buildDir)) {
    // 在 build 目录内，返回当前文件路径
    return fileURLToPath(metaUrl)
  }
  // 不在 build 目录内，返回解析后的绝对路径
  return resolvedPath
}

/** 设置别名 */
const alias: Record<string, string> = {
  '@': pathResolve('../src'),
  '@build': pathResolve(),
}

/** 平台的名称、版本、运行所需的`node`和`pnpm`版本、依赖、最后构建时间的类型提示 */
const __APP_INFO__ = {
  pkg: { name, version, engines, dependencies, devDependencies },
  lastBuildTime: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
}

/**
 * 将字节数格式化为易读的字符串（如 KB、MB、GB）。
 *
 * @param bytes
 * @param decimals
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = Math.max(decimals, 0)
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

/**
 * 计算数组中所有元素的总和。
 *
 * @param array
 */
export function sum(array: number[]): number {
  return array.reduce((acc, curr) => acc + curr, 0)
}

/**
 * 处理环境变量
 *
 * @param envConf
 */
const wrapperEnv = (envConf: Recordable): ViteEnv => {
  // 默认值
  const ret: ViteEnv = {
    VITE_PORT: 8848,
    VITE_PUBLIC_PATH: '',
    VITE_ROUTER_HISTORY: '',
    VITE_COMPRESSION: 'none',
  }

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replaceAll(String.raw`\n`, '\n')
    realName = realName === 'true' ? true : realName === 'false' ? false : realName

    if (envName === 'VITE_PORT') {
      realName = Number(realName)
    }
    ret[envName] = realName
    if (typeof realName === 'string') {
      process.env[envName] = realName
    } else if (typeof realName === 'object') {
      process.env[envName] = JSON.stringify(realName)
    }
  }
  return ret
}

const fileListTotal: number[] = []

/**
 * 获取指定文件夹中所有文件的总大小
 *
 * @param options
 * @param options.folder
 * @param options.callback
 * @param options.format
 */
const getPackageSize = (options: {
  folder: string
  callback: (size: number | string) => void
  format?: boolean
}) => {
  const { folder = 'dist', callback, format = true } = options
  readdir(folder, (err, files: string[]) => {
    if (err) throw err
    let count = 0
    const checkEnd = () => {
      ++count == files.length &&
        callback(format ? formatBytes(sum(fileListTotal)) : sum(fileListTotal))
    }
    files.forEach((item: string) => {
      stat(`${folder}/${item}`, (err, stats) => {
        if (err) throw err
        if (stats.isFile()) {
          fileListTotal.push(stats.size)
          checkEnd()
        } else if (stats.isDirectory()) {
          getPackageSize({
            folder: `${folder}/${item}/`,
            callback: checkEnd,
            format: false,
          })
        }
      })
    })
    files.length === 0 && callback(0)
  })
}

export { __APP_INFO__, alias, getPackageSize, pathResolve, root, wrapperEnv }
