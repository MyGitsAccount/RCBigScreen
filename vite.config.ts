import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import OptimizationPersist from 'vite-plugin-optimize-persist';
import PkgConfig from 'vite-plugin-package-config';
import cesium from 'vite-plugin-mars3d';
// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    base: process.env.NODE_ENV === 'production' ? './' : '/',
    resolve: {
      //设置别名
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3031,
    },
    plugins: [vue(), PkgConfig(), cesium(), OptimizationPersist()],
    build: {
      outDir: 'dist/rongchangBigScreen',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('styles/main.css')) {
              return 'tailwind';
            }
            if (id.includes('bitmap3d')) {
              return 'bitmap3d';
            }
          },
          entryFileNames: 'js/[name].[hash].js', // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
          chunkFileNames: 'js/[name].[hash].js', // 用于命名代码拆分时创建的共享块的输出命名
          assetFileNames: 'css/[name].[hash].[ext]', // 用于输出静态资源的命名，[ext]表示文件扩展名
        },
      },
      minify: 'terser',
      target: 'esnext',
    },
  };
});
