# Shopify Liquid 学习笔记

基于本项目 `theme/layout/theme.liquid` 与 Dawn 主题的阅读整理，方便对照源码复习。

---

## 1. 三种最基本的写法

| 写法 | 作用 | 例子 |
|------|------|------|
| `{{ ... }}` | **输出**到页面（打印值） | `{{ page_title }}` |
| `{% ... %}` | **逻辑**（判断、赋值、循环、引入），默认不直接“打印业务文案” | `{% if ... %}` |
| `{%- ... -%}` / `{{- ... -}}` | 同上，但会**去掉标签两侧空白** | 见第 8 节 |

可以记成：

- `{{ }}` ≈ 把结果写进 HTML  
- `{% %}` ≈ 控制流程 / 调用标签  

---

## 2. `settings.*` 是什么？

```liquid
settings.favicon
settings.type_body_font
settings.colors_text
```

- `settings` = 主题后台 **「主题设置 / Theme settings」** 里保存的配置  
- 配置项定义在 `theme/config/settings_schema.json`  
- 当前店铺选中的值在 `theme/config/settings_data.json`（常被编辑器改写）

所以：`settings.*` ≠ 商品数据，而是**整站主题级选项**（Logo、颜色、字体、是否开预测搜索等）。

---

## 3. `{{ 'xxx.js' | asset_url }}` 怎么加载资源？

```liquid
<script src="{{ 'constants.js' | asset_url }}" defer="defer"></script>
```

拆开看：

1. `'constants.js'`：相对 **`theme/assets/`** 下的文件名  
2. `| asset_url`：Liquid **filter（管道）**，转成 Shopify CDN 上的完整 URL  
3. 最终 HTML 类似：`<script src="https://cdn.shopify.com/.../constants.js" ...>`

浏览器再去请求这个 URL，**不是** Liquid 在服务器上“执行” JS。

样式同理，常再套一层 `stylesheet_tag`：

```liquid
{{ 'base.css' | asset_url | stylesheet_tag }}
```

近似等于输出：

```html
<link rel="stylesheet" href="https://cdn.shopify.com/.../base.css" ...>
```

多个 `|` 是**从左到右**依次处理，类似函数嵌套，**不是** JavaScript 的 `||`（或）。

---

## 4. `{{ content_for_header }}` 为什么必须留着？

```liquid
{{ content_for_header }}
```

这是 Shopify **预留注入点**。平台会在这里插入：

- 分析 / 像素类脚本  
- App 相关脚本  
- 结账、店铺必要的系统脚本  

**不要删除、不要挪到随意位置（一般保持在 `<head>`）。**  
删了或注释掉，后台 App、统计、部分系统功能可能异常。

---

## 5. `{% liquid %}` 多行写法

```liquid
{%- liquid
  assign body_font_bold = settings.type_body_font | font_modify: 'weight', 'bold'
  assign body_font_italic = settings.type_body_font | font_modify: 'style', 'italic'
  assign body_font_bold_italic = body_font_bold | font_modify: 'style', 'italic'
%}
```

- `{% liquid %}` = 在一个标签里写**多行** Liquid，行首不必反复写 `{% %}`  
- 适合连续 `assign`、短逻辑，可读性更好  
- 和拆成多个 `{% assign %}` 效果等价  

---

## 6. `assign`：定义变量

```liquid
assign body_font_bold = settings.type_body_font | font_modify: 'weight', 'bold'
```

- `assign` = 定义 / 赋值变量（类似 JS 的 `const` / `let`）  
- `| font_modify: 'weight', 'bold'` = **filter**，对左边的值做变换  

更接近：

```js
const body_font_bold = fontModify(settings.type_body_font, 'weight', 'bold');
```

**不要**理解成：

```js
// ❌ 错误类比：| 不是 ||
settings.type_body_font || font_modify(...)
```

---

## 7. `if` / `unless`

```liquid
{% if page_description %}
  <meta name="description" content="{{ page_description | escape }}">
{% endif %}

{% unless settings.type_body_font.system? %}
  ...只有「不是系统字体」时才执行...
{% endunless %}
```

| 标签 | 含义 |
|------|------|
| `if` | 条件为真时执行 |
| `unless` | 条件为假时执行（`if` 的反面） |

`unless x` ≈ `if x == false` / `if !x`。

Dawn 里常见：`unless ... system?` → 自定义字体才做 preconnect / preload。

---

## 8. `{%-` / `-%}` 里的 `-` 是什么？

用来**压缩标签旁边的空白和换行**，让生成的 HTML 更干净。

| 写法 | 效果 |
|------|------|
| `{% render 'cart-drawer' %}` | 前后空白保留 |
| `{%- render 'cart-drawer' -%}` | 去掉左右两侧紧挨的空白 |
| `{%- ... %}` | 只去左边 |
| `{% ... -%}` | 只去右边 |

`{{ }}` 同样支持 `{{-` / `-}}`。

注意：`-` **不是语法必填**，不影响 `render` 是否成功，只影响输出 HTML 的空白。

---

## 9. `{% render 'xxx' %}` 从哪引入？

```liquid
{% render 'meta-tags' %}
{%- render 'cart-drawer' -%}
{% render 'vite-tag', entry: 'theme.js' %}
```

规则：

- **`render` 永远只引入 `theme/snippets/xxx.liquid`**，不会直接去 `assets/`  
- `render 'meta-tags'` → `snippets/meta-tags.liquid`  
- `render 'vite-tag'` → `snippets/vite-tag.liquid`  
- 可以传参数：`entry: 'theme.js'` 在 snippet 内用 `entry` 变量接收  

**不是**用来引入 `sections/` 的。  
Section 是页面模板（如 `templates/index.json`）里挂载，或主题编辑器拖拽添加的区块。

### 容易混淆：`vite-tag` 和 `assets/` 的关系（两步）

```liquid
{% render 'vite-tag', entry: 'product.js' %}
```

这**不是**说 `render` 去加载 `assets/product.js`，而是：

1. **第一步（render）**：打开 `theme/snippets/vite-tag.liquid`（和 `meta-tags` 一样，都是 snippet）  
2. **第二步（snippet 输出 HTML）**：`vite-tag.liquid` 根据 `entry` 参数，写出类似  
   `<script src=".../assets/product-xxxxx.js">`  
   浏览器再去请求 **`theme/assets/`** 里 Vite 打包后的文件  

对照：

| | `meta-tags` | `vite-tag` |
|--|-------------|------------|
| `render` 找谁 | `snippets/meta-tags.liquid` | `snippets/vite-tag.liquid` |
| snippet 干什么 | 输出一堆 `<meta>` | 输出 `<script>` / `<link>` |
| 最终 JS/CSS 在哪 | 通常没有单独打包文件 | `theme/assets/` 里带哈希的产物 |

**一句话：** `render` → 只碰 `snippets/`；`assets/` 是 snippet **生成的标签**去加载的，不是 `render` 的目标路径。

---

## 10. 和本项目 Vite 入口的关系（扩展）

```liquid
{{ 'base.css' | asset_url | stylesheet_tag }}
{% render 'vite-tag', entry: 'theme.js' %}
```

| 行 | 含义 |
|----|------|
| `base.css` | Dawn 原版全局样式，走 `assets` + `asset_url` |
| `vite-tag` | 先 `render` 进 snippet；snippet 再去挂 Vite 的 JS/CSS（开发 HMR / 生产哈希文件） |

自定义前端入口源码：`src/entrypoints/theme.js`（内含 `import './theme.css'`）。  
打包后源码仍在 `src/entrypoints/`，产物在 `theme/assets/theme-xxxxx.js` 等，由 `vite-tag` 映射。

---

## 11. 速查表

| Liquid | 一句话 |
|--------|--------|
| `{{ x }}` | 输出 x |
| `{% ... %}` | 逻辑 / 标签 |
| `settings.*` | 后台主题设置 |
| `assign` | 定义变量 |
| `\| filter` | 管道处理（不是 `\|\|`） |
| `asset_url` | `assets` 文件 → CDN URL |
| `stylesheet_tag` | 输出 `<link rel="stylesheet">` |
| `content_for_header` | Shopify 系统注入点，勿删 |
| `{% liquid %}` | 多行 Liquid |
| `if` / `unless` | 若 / 除非 |
| `render 'name'` | 引入 `snippets/name.liquid` |
| `{%-` `- %}` | 去掉旁白空白 |

---

## 12. 建议对照阅读的文件

1. `theme/layout/theme.liquid` — 整站壳子、`content_for_header`、资源引入  
2. `theme/snippets/meta-tags.liquid` — `render` 示例  
3. `theme/snippets/vite-tag.liquid` — 插件生成的资源加载逻辑（勿手改）  
4. `theme/config/settings_schema.json` — `settings.*` 从哪来  

---

## 13. 小练习（可选）

1. 在 `theme.liquid` 里找到三处 `asset_url`，说出对应的本地文件路径。  
2. 把某段 `{% if %}` 改写成等价的 `unless`（或反过来）。  
3. 说明：为什么改 `src/entrypoints/theme.css` 要靠 `vite-tag`，而改 Dawn 的 `base.css` 不用。  
