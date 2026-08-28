import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
// import basicSsl from '@vitejs/plugin-basic-ssl';

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
  server: {
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'localcerts/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'localcerts/localhost.pem')),
    },
  },
  // plugins: [
  //   basicSsl()
  // ],
  // server: {
  //   host: true,
  //   https: true
  // }
})
