# 主题作品：简约轻奢风 DTC 品牌站

## 1. 定位

| 项 | 内容 |
|----|------|
| 类型 | Shopify Online Store 2.0 主题作品集 |
| 风格 | **简约轻奢** DTC 品牌站 |
| 品类适配 | 美妆 / 香薰 / 小众配饰（通用，不绑死单一垂类） |
| 目标 | 面试好看、代码干净规范、后台可配置、响应式 |

**面试官想看到的点：**

- 分区模块化（全部 Section，可拖拽开关）
- 后台可配置（schema settings / blocks）
- 响应式
- 图片懒加载思路（`loading`、`widths`、`sizes`）
- Liquid 规范（结构清晰、少调试输出、snippet 复用）
- 工程化：`src/` 分层 + 打包到 `theme/`（本仓库已具备）

**范围：** 以**首页**为主做到出彩即可；商品页 / 集合页可先沿用 Dawn，后续再定制。

---

## 2. 站点风格设定

### 2.1 色板（CSS 变量建议）

| 角色 | 色值 | 用途 |
|------|------|------|
| 主色 | `#2A2A2A` | 标题、正文、深色按钮文字底 |
| 辅助色 | `#C8A97E` | CTA 按钮、点缀线、悬停强调 |
| 背景 | `#FAFAF8` | 页面底、区块浅底 |
| 次要文字 | `#555555` | 描述、辅助说明 |
| 纯白 | `#FFFFFF` | 卡片 / 弹层（如需） |

建议在 `src/entrypoints/theme.css` 定义：

```css
:root {
  --qs-color-ink: #2a2a2a;
  --qs-color-gold: #c8a97e;
  --qs-color-bg: #fafaf8;
  --qs-color-muted: #555555;
}
```

### 2.2 字体与气质

- 字体：无衬线 **Inter**（或主题设置里接近的 system / Shopify 字体；作品集可用 Google Fonts / Shopify font picker）
- 方向：极简 DTC，不花哨，突出产品质感
- 圆角克制（接近直角或 `2px`），少阴影、少渐变堆叠

### 2.3 已有对齐

现有 `hero-banner` 已使用主色 / 香槟金 / 米白，后续区块统一跟这套 token，避免风格漂移。

---

## 3. 首页信息架构

自上而下（全部做成 **Section**，主题编辑器可拖动排序 / 开关）：

| 顺序 | 区块 | 建议 section 名 | 源码建议路径 |
|------|------|-----------------|--------------|
| 1 | 导航栏 Header（固定悬浮） | `qs-header`（或改造 Dawn `header`） | `src/sections/layout/qs-header/` |
| 2 | Hero 首屏大图 Banner | `hero-banner`（已有） | `src/sections/marketing/hero-banner/` |
| 3 | 热销产品 Featured Products | `qs-featured-products` | `src/sections/marketing/qs-featured-products/` |
| 4 | 品牌故事 About | `qs-about` | `src/sections/marketing/qs-about/` |
| 5 | 优势卖点（物流 / 售后 / 材质） | `qs-usps` | `src/sections/marketing/qs-usps/` |
| 6 | Instagram 社交流 | `qs-instagram` | `src/sections/marketing/qs-instagram/` |
| 7 | 邮件订阅 Newsletter | `qs-newsletter` | `src/sections/marketing/qs-newsletter/` |
| 8 | Footer 底部 | `qs-footer`（或改造 Dawn `footer`） | `src/sections/layout/qs-footer/` |

> 前缀 `qs-`（或项目缩写）用于和 Dawn 原版 section 区分，避免覆盖官方文件；Header/Footer 也可渐进「晋升」进 `src/` 再深度改。

---

## 4. 各区块要点（作品集级）

### 4.1 Header（固定悬浮）

- sticky / fixed，滚动后可加深底或加细边线
- Logo、主导航、购物车图标；移动端汉堡菜单
- 后台可配：菜单、logo、是否透明顶栏（叠在 Hero 上）

### 4.2 Hero Banner（已有雏形）

- 左文右图（移动端上下堆叠）— 已实现
- 可配：图、背景色、标题、描述、按钮文案与链接
- 首屏图用 `loading: 'eager'`；其余区块图用 `lazy`

### 4.3 Featured Products

- 拉取某个 Collection（`collection` setting）
- 网格展示 4 列 → 平板 2 → 手机 1～2
- snippet 复用：`product-card`（图、标题、价格）
- 可配：标题、集合、展示数量、按钮「查看全部」

### 4.4 About 品牌故事

- 左图右文或对调（setting 可选）
- 短文案 + 可选 CTA
- 强调质感摄影，不堆统计数字条

### 4.5 USPs 优势卖点

- 建议用 **blocks**：每一块 = 图标（或图片）+ 标题 + 短描述
- 默认 3 个：物流 / 售后 / 材质
- 后台可增减块数

### 4.6 Instagram 社交流

- 网格晒图（blocks 多张图，或单一图床列表）
- 可配：标题、Instagram 主页链接
- 作品集阶段可用手动上传图片，不必真接 IG API

### 4.7 Newsletter

- 使用 Shopify customer / contact 表单或 Dawn 邮件订阅模式
- 极简一行：文案 + 邮箱 + 按钮（香槟金）
- 注意合规文案可后台编辑

### 4.8 Footer

- 多列：店铺导航、帮助、社交、版权
- 色调与主站一致（深炭或米白底二选一，推荐深炭 + 浅字，或浅底深字保持统一）

---

## 5. 技术约定（贴合本仓库）

### 5.1 目录与构建

```
src/sections/<域>/<name>/<name>.liquid
src/sections/<域>/<name>/<name>.css
src/snippets/<域>/<name>/<name>.liquid   # 如 product-card
src/entrypoints/theme.css               # 全局 token、Header 固定等
        │
        ▼ npm run build / npm run dev
theme/sections/*.liquid
theme/assets/section-*.css
```

- 新区块一律进 **`src/`**，不要只改 `theme/` 后忘记源码
- Dawn 未改造文件继续留在 `theme/`

### 5.2 Liquid / 可访问性 / 性能

- 每个 section 必须有完整 `{% schema %}` + `"presets"`（编辑器可添加）
- 图片：`image_url` + `image_tag`，带 `widths` / `sizes`；非首屏 `loading: 'lazy'`
- 可复用 UI 抽到 `snippets`（尤其 product-card）
- 禁止残留调试输出（如 `{{ section.settings }}`）
- 类名 BEM：`.qs-featured__title` 等，避免污染 Dawn 全局

### 5.3 首页挂载

开发期在主题编辑器拖入各 Section；稳定后可整理 `theme/templates/index.json`（注意编辑器可能回写该文件）。

---

## 6. 实施阶段（建议顺序）

| 阶段 | 内容 | 产出 |
|------|------|------|
| **P0** | 全局 token + 字体；确认 `npm run dev` 预览链路 | `theme.css` 变量 |
| **P1** | 打磨 `hero-banner`（全宽/字体/与 Header 叠层） | 首屏定调 |
| **P2** | `qs-featured-products` + `product-card` snippet | 有货可逛 |
| **P3** | `qs-about` + `qs-usps` | 故事与信任 |
| **P4** | `qs-instagram` + `qs-newsletter` | 社交与转化 |
| **P5** | `qs-header` / `qs-footer` 定稿（或深度改 Dawn） | 首尾统一 |
| **P6** | 整理首页 `index.json`、README 作品说明、截图 | 可投递 |

每完成一个 Section：schema 可配 → 桌面/手机各看一眼 → 再开下一个。

---

## 7. 验收清单（作品集自检）

- [ ] 首页 8 个区块风格统一（炭黑 / 香槟金 / 米白）
- [ ] 主题编辑器可添加、排序、开关各 Section
- [ ] 关键文案、图片、链接均可后台改，不改代码
- [ ] 375px / 768px / 1280px 布局正常
- [ ] 非首屏图片懒加载；Hero 首屏不懒加载
- [ ] 源码在 `src/`，`npm run build` 后 `theme/` 可 push
- [ ] 无调试输出、无明显 Dawn「Generated test data」残留在首页

---

## 8. 相关文档

- [项目设计.md](./项目设计.md) — 为何 src + 打包
- [开发流程.md](./开发流程.md) — 日常 `dev` / `push`
- [liquid-学习笔记.md](./liquid-学习笔记.md) — Liquid 基础
