import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5666,
    open: 'C:/Users/lucia/.codeium/windsurf/ws-browser/chromium-1155/chrome-win/chrome.exe'
  },
})