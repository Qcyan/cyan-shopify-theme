# shopify-dev-theme

**源码分层 + 打包成 Shopify 主题** 的 Online Store 2.0 工程。

- `src/`：可按业务域分子目录的源码（你日常改这里）
- `theme/`：符合 Shopify 规范的扁平产物（CLI `dev` / `push` 只认这里）
- 底层为 Shopify **Generated Data / Dawn** 测试主题，店铺：`cyan-dev-store1.myshopify.com`

## 架构

```
shopify-dev-theme/
├── src/                          # 源码（可分层）
│   ├── entrypoints/              # vite-plugin-shopify 入口（theme.js / theme.css）
│   ├── sections/
│   │   └── marketing/
│   │       └── hero-banner/      # 同名 liquid + css (+ 可选 js)
│   │           ├── hero-banner.liquid
│   │           └── hero-banner.css
│   └── snippets/
│       └── <domain>/<name>/
├── theme/                        # Shopify 产物（扁平）
│   ├── assets/                   # Dawn + Vite 哈希产物
│   ├── snippets/vite-tag.liquid  # 插件自动生成，勿手改
│   ├── sections/                 # Dawn 原版 + build-liquid 产物
│   └── ...
├── scripts/
│   ├── build-liquid.mjs          # Liquid 分层 → 扁平
│   └── watch-liquid.mjs
├── package.json
├── vite.config.js                # vite-plugin-shopify
└── start.bat
```

### 前端资源（vite-plugin-shopify）

- 入口：`src/entrypoints/theme.js`（已 `import './theme.css'`）
- 布局引入：`theme/layout/theme.liquid` 中  
  `{% render 'vite-tag', entry: 'theme.js' %}`
- 开发：Vite 提供 HMR；生产：`vite build` 写入 `theme/assets/` 哈希文件，并由 `vite-tag` 引用
- 别名：`@/`、`~/` → `src/`（例如 `import '@/sections/...'`）


### 命名约定（构建规则）

| 源码 | 产物 |
|------|------|
| `src/sections/<域>/<name>/<name>.liquid` | `theme/sections/<name>.liquid` |
| `src/sections/<域>/<name>/<name>.css` | `theme/assets/section-<name>.css` |
| `src/snippets/<域>/<name>/<name>.liquid` | `theme/snippets/<name>.liquid` |
| `src/snippets/<域>/<name>/<name>.css` | `theme/assets/snippet-<name>.css` |

`<name>` 必须与文件夹名、文件名一致，且在全库唯一（Shopify 产物层不能重名）。

**Dawn 原版文件**直接留在 `theme/`，不必搬进 `src/`。  
**新做的自定义区块**一律进 `src/`，再 `npm run build` 同步到 `theme/`。

## 环境要求

- Node.js ≥ 18
- Shopify CLI（`npm run dev` / `push` 会调用 `shopify` 命令；也可继续用 `npx @shopify/cli`）

## 常用命令

```bash
# 安装依赖
npm install

# 构建：src → theme
npm run build

# 本地开发（liquid 监听 + Vite HMR + theme dev）
npm run dev
# 或双击 start.bat

# 推送到店铺
npm run push

# 从店铺拉取到 theme/（注意可能覆盖产物）
npm run pull
```

## 新增自定义 Section 流程

1. 在 `src/sections/<业务域>/<name>/` 创建 `<name>.liquid`（及可选的 `<name>.css`）
2. Liquid 内引用样式，例如：

```liquid
{{ 'section-hero-banner.css' | asset_url | stylesheet_tag }}
```

3. schema 里加上 `"presets"`，以便主题编辑器「添加区块」能选到
4. 执行 `npm run build`（或已在 `npm run dev` 监听中会自动同步）
5. 在主题编辑器把区块加到首页或其他模板

示例：`src/sections/marketing/hero-banner/`

## 注意事项

1. **不要手改** `theme/` 里由构建生成的自定义文件（文件头或 manifest 可辨认）；改 `src/` 再构建。
2. `theme/templates/*.json`、`theme/config/settings_data.json` 可能被主题编辑器改写，拉取/合并时注意冲突。
3. `npm run pull` 拉的是扁平主题，不会自动还原成 `src/` 分层；自定义逻辑以 `src` 为准。
4. 不要手改 `theme/snippets/vite-tag.liquid`（每次 Vite 构建会覆盖）。
5. Section 级 CSS 仍可由 `build-liquid` 拷到 `assets/section-*.css`；需要打包/HMR 的 JS 请挂到 `src/entrypoints` 或用 `@/` import。

## 学习文档

- [主题作品：简约轻奢 DTC](docs/主题作品-简约轻奢DTC.md)
- [项目设计：源码分层 + 打包](docs/项目设计.md)
- [开发流程](docs/开发流程.md)
- [Liquid 学习笔记](docs/liquid-学习笔记.md)

## 参考

- [Shopify 主题架构](https://shopify.dev/docs/storefronts/themes/architecture)
- [Shopify CLI Theme](https://shopify.dev/docs/api/shopify-cli/theme)
- [vite-plugin-shopify（Volt）](https://shopify-vite.barrelny.com/guide/)
