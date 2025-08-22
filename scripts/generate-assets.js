import path, { dirname } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import chokidar from 'chokidar'
import fs from 'fs-extra'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const IMAGE_DIR = path.join(__dirname, '../src/assets/images')
const OUTPUT_FILE = path.join(__dirname, '../src/assets/r.ts')

// 检查是否有 --no-watch 参数
const shouldWatch = !process.argv.includes('--no-watch')

// 支持的图片格式
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']

// 生成常量名称
function generateConstantName(filePath) {
  const relativePath = path.relative(IMAGE_DIR, filePath)

  // 获取文件夹和文件名
  const dir = path.dirname(relativePath)
  const fileName = path.basename(filePath, path.extname(filePath))
  // 获取文件后缀（不带点）
  const extension = path.extname(filePath).slice(1).toUpperCase()

  // 如果在根目录，直接返回大写的文件名
  if (dir === '.') {
    return `${processName(fileName)}_${extension}`
  }

  // 否则生成格式：文件夹_文件名
  const folderName = dir.split(path.sep).join('_').toUpperCase().replaceAll('-', '_')
  const formattedFileName = processName(fileName)

  return `${folderName}_${formattedFileName}_${extension}`
}

// 处理名称，确保是有效的变量名
function processName(name) {
  // 将名称转换为大写
  let processed = name.toUpperCase()

  // 替换连字符为下划线
  processed = processed.replaceAll('-', '_')

  // 将@符号转换为_AT_
  processed = processed.replaceAll('@', '_AT_')

  return processed
}

// 生成所有图片资源的常量
function generateImageConstants() {
  const constants = {}

  function processDirectory(directory) {
    const files = fs.readdirSync(directory, { withFileTypes: true })

    for (const file of files) {
      const filePath = path.join(directory, file.name)

      // 跳过 .DS_Store 文件
      if (file.name === '.DS_Store') {
        continue
      }

      if (file.isDirectory()) {
        processDirectory(filePath)
      } else if (IMAGE_EXTENSIONS.includes(path.extname(file.name).toLowerCase())) {
        // 获取相对于项目根目录的路径
        const relativePath = path.relative(path.join(__dirname, '..'), filePath)
        // 转换为适合导入的路径格式
        const importPath = `/${relativePath.replaceAll('\\', '/')}`
        const constantName = generateConstantName(filePath)
        constants[constantName] = importPath
      }
    }
  }

  processDirectory(IMAGE_DIR)
  return constants
}

// 写入文件
function writeConstantsToFile(constants) {
  const entries = Object.entries(constants)

  const imports = entries
    .map(([key, value]) => {
      // 移除开头的/src，确保路径正确
      const importPath = value.replace(/^\/src/, '..')
      return `import ${key} from '${importPath}'`
    })
    .join('\n')

  const fileContent = `/**
 * 图片资源常量
 * 自动生成，请勿手动修改
 */
${imports}

const R = {
${entries
  .map(([key]) => {
    // 检查key是否包含特殊字符
    const needsQuotes = /\$/.test(key)
    const formattedKey = needsQuotes ? `'${key}'` : key
    return `  ${formattedKey},`
  })
  .join('\n')}
}

export { R }
`

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8')
  console.log('Image constants generated at:', OUTPUT_FILE)
}

// 初始生成一次
const constants = generateImageConstants()
writeConstantsToFile(constants)

// 如果不需要监听，直接退出
if (!shouldWatch) {
  console.log('Generated constants without watching. Exiting...')
  process.exit(0)
}

// 监听文件变化
const watcher = chokidar.watch(IMAGE_DIR, {
  ignored: /(^|[/\\])\../, // 忽略点文件
  persistent: true,
  ignoreInitial: true, // 忽略初始的 add 事件
  awaitWriteFinish: true, // 等待文件写入完成
})

console.log('Watching for changes in', IMAGE_DIR)

// 一个简单的去抖函数，防止短时间内多次触发
function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 封装生成图片常量的函数
const generateAndWrite = debounce(() => {
  console.log('Detected file changes, regenerating constants...')
  const constants = generateImageConstants()
  writeConstantsToFile(constants)
}, 300)

// 监听所有相关事件
watcher
  .on('add', path => {
    console.log(`File ${path} has been added`)
    generateAndWrite()
  })
  .on('change', path => {
    console.log(`File ${path} has been changed`)
    generateAndWrite()
  })
  .on('unlink', path => {
    console.log(`File ${path} has been removed`)
    generateAndWrite()
  })
  .on('addDir', path => {
    console.log(`Directory ${path} has been added`)
    generateAndWrite()
  })
  .on('unlinkDir', path => {
    console.log(`Directory ${path} has been removed`)
    generateAndWrite()
  })
  .on('ready', () => {
    console.log('Initial scan complete, ready for changes')
  })
  .on('error', error => {
    console.error('Error:', error)
  })
