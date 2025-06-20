import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 移除自定义postcss路径配置，让Vite自动检测postcss.config.cjs文件
  // css: {
  //   postcss: './postcss.config.cjs',
  // },
  resolve: {
    alias: {
      '@': './src'
    }
  }
})
