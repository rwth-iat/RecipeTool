import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  //this part outputs the generated files directly into the static flask folder
  //this way after building the vue/vite project we can simply start the flask project
  build: {
    base: '',
    outDir   : '../server/static',
  },
  test: {
    globals   : true,
  },  
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
