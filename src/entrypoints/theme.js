/**
 * 全局前端入口（vite-plugin-shopify）。
 * 在 layout 中通过 {% render 'vite-tag', entry: 'theme.js' %} 引入。
 * 按需 import 自定义 section / 组件：
 *   import '@/sections/marketing/hero-banner/hero-banner.js'
 */
import './theme.css';

console.info('[theme] vite entry loaded');
