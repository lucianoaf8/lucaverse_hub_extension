/// <reference types="vite/client" />

// Platform detection globals injected by Vite
declare const __PLATFORM__: 'web' | 'extension' | 'electron'
declare const __IS_EXTENSION__: boolean
declare const __IS_ELECTRON__: boolean
declare const __IS_WEB__: boolean

// Import meta environment
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Chrome Extension API types
declare namespace chrome {
  // Basic Chrome extension APIs will be available when @types/chrome is loaded
}
