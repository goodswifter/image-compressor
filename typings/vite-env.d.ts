/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 基础地址 */
  readonly VITE_BASE_URL: string
  /** 压缩 */
  readonly VITE_COMPRESSION: string
  /** 路由模式 */
  readonly VITE_ROUTER_HISTORY: string
  /** 公共路径 */
  readonly VITE_PUBLIC_PATH: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
