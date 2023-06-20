import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path';
import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  /*build: {
    base: '',
    outDir   : '../server/templates/vue_template/',
    assetsDir : 'static/'
  },*/
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
      //'@': path.resolve(__dirname, './src'),
    }
  }
})
