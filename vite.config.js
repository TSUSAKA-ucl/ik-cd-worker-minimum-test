import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        // "use client" の警告だけをスルーする
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        defaultHandler(warning)
      },
    },
  },
  plugins: [
    basicSsl()
  ],
  server: {
    host: true,
    https: true
  }
})
