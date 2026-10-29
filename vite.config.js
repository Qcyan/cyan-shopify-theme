import { defineConfig } from 'vite';
import shopify from 'vite-plugin-shopify';

export default defineConfig({
  plugins: [
    shopify({
      themeRoot: 'theme',
      sourceCodeDir: 'src',
      entrypointsDir: 'src/entrypoints',
      snippetFile: 'vite-tag.liquid',
      versionNumbers: false,
      themeHotReload: true,
    }),
  ],
  build: {
    // 保留 Dawn 原有 assets，避免清空 theme/assets
    emptyOutDir: false,
  },
});
