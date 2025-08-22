declare global {
  /**
   * 打包压缩格式的类型声明
   */
  type ViteCompression =
    | 'none'
    | 'gzip'
    | 'brotli'
    | 'both'
    | 'gzip-clear'
    | 'brotli-clear'
    | 'both-clear'

  /**
   * 全局自定义环境变量的类型声明
   *
   * @see {@link https://pure-admin.cn/pages/config/#%E5%85%B7%E4%BD%93%E9%85%8D%E7%BD%AE}
   */
  interface ViteEnv {
    VITE_PORT: number
    VITE_PUBLIC_PATH: string
    VITE_ROUTER_HISTORY: string
    VITE_COMPRESSION: ViteCompression
    [key: string]: any // 添加索引签名
  }
}

export {}
