/// <reference types="vite-svg-loader" />

declare module '*.svg?component' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
