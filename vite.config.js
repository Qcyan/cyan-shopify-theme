import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  build: {
    outDir: resolve(__dirname, 'theme/assets'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'theme-custom': resolve(__dirname, 'src/entrypoints/theme.js'),
        'theme-custom-css': resolve(__dirname, 'src/entrypoints/theme.css'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        chunkFileNames: '[name].js',
      },
    },
    cssCodeSplit: true,
  },
  server: {
    origin: 'http://localhost:5173',
  },
});
