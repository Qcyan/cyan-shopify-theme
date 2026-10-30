# 首页对照清单（`stitch/desktop-home.html`）

设计稿： [Stitch 项目](https://stitch.withgoogle.com/projects/1774047669727653192) · 本地 `stitch/desktop-home.html`

| # | 设计稿区块 | 主题 Section | 状态 |
|---|------------|--------------|------|
| 1 | Hero（左文右图 + 统计条 + 图底角标 + 浮动评语） | `hero-banner` | 已接 |
| 2 | Brand Pillars 四列信任条 | `qs-usps` | 已接 |
| 3 | Signature Acquisitions（眉题 + Tab + 四商品卡） | `qs-featured-products` + `qs-product-card` | 已接（空集合用示意卡） |
| 4 | Editorial Split / Craft（Grasse 角标 + Harvest Period） | `qs-about` | 已接 |
| 5 | Sensory Realms 三域卡片 | `qs-realms` | 已接 |
| 6 | Press + Living Archive | `qs-press` | 已接 |
| 7 | Atelier Circle 深色邀请 | `qs-newsletter` | 已接 |
| — | Footer / Olfactory Gazette | `qs-footer`（footer-group） | 另见页脚 |

顺序固定于 `theme/templates/index.json`（section id：`home_*`）。

**注意：** 主题编辑器若仍显示「Sculpted Living / Instagram」或「Olfactory Gazette」在深色区，说明编辑器缓存了旧区块——请关闭编辑器后重新打开预览，或删掉旧区块。`The Olfactory Gazette` 只应出现在 **页脚**。
