/// <reference types="vite/client" />

declare const __BUILD_COMMIT__: string
declare const __BUILD_DATE__: string

declare module '*.vert' {
  const src: string
  export default src
}
declare module '*.frag' {
  const src: string
  export default src
}
declare module '*.glsl' {
  const src: string
  export default src
}
