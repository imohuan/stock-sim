# components/ui 安装说明

自研 Vue 3 组件库（`Ax*` 基础组件 + `functional` 功能模块）。本文档只说明**如何接入**。

配套文档：
- 颜色/字体/间距 token → [design-tokens.md](./design-tokens.md)
- 组件 API（Props/Slots/Events）→ [components.md](./components.md)
- 设计原则/布局/交互规范 → [ui-style.md](./ui-style.md)
- HTML 单页接入 → [html-cdn.md](./html-cdn.md)

---

## 前置条件

- **Vue 3** + **Vite** + **TypeScript**
- 将本目录整夹复制到目标项目的 `src/components/ui`（路径可改，下文 import 路径需一并调整）

---

## 1. 安装依赖

使用最新兼容版本即可，与当前 `web` 工程保持一致：

```bash
# dependencies
bun add @floating-ui/dom @floating-ui/vue @tailwindcss/vite tailwindcss @vueuse/core vue vue-sonner \
  material-symbols @fontsource/geist @fontsource/jetbrains-mono

# devDependencies（Vite + TS 工程通常已有，缺哪项补哪项）
bun add -d @tailwindcss/forms @vitejs/plugin-vue typescript vite vue-tsc
```

| 包 | 用途 |
| --- | --- |
| `tailwindcss` + `@tailwindcss/vite` | Tailwind v4，组件样式依赖 `@theme` token |
| `@tailwindcss/forms` | 表单控件默认样式（在 `style.css` 中 `@plugin`） |
| `@floating-ui/vue` / `@floating-ui/dom` | Dropdown、Select、Tooltip 等浮层定位 |
| `@vueuse/core` | 组合式工具（点击外部、快捷键等） |
| `vue-sonner` | 通知队列（`useNotify`） |
| `material-symbols` | Material Symbols 图标字体（outlined 可变体） |
| `@fontsource/geist` | Geist UI 正文字体（按字重分文件引入，见 §4） |
| `@fontsource/jetbrains-mono` | JetBrains Mono 标签/等宽字体（400、500） |

---

## 2. 配置 Vite

在 `vite.config.ts` 中启用 Vue 与 Tailwind 插件：

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
```

---

## 3. 全局样式

在入口 CSS（如 `src/style.css`）中至少包含：

```css
@import "tailwindcss";
@plugin "@tailwindcss/forms";

@theme {
  --color-primary: #000000;
  --color-ball: #6366f1;
  --color-ball-light: #818cf8;
  --color-on-primary: #ffffff;
  --color-secondary: #5f5e61;
  --color-on-secondary: #ffffff;
  --color-tertiary: #000000;
  --color-error: #ba1a1a;
  --color-on-error: #ffffff;
  --color-background: #f9f9fa;
  --color-surface: #f9f9fa;
  --color-surface-container-lowest: #ffffff;
  --color-surface-container-low: #f3f3f4;
  --color-surface-container: #eeeeef;
  --color-surface-container-high: #e8e8e9;
  --color-surface-container-highest: #e2e2e3;
  --color-surface-variant: #e2e2e3;
  --color-on-surface: #1a1c1d;
  --color-on-surface-variant: #47464a;
  --color-on-background: #1a1c1d;
  --color-outline: #78767b;
  --color-outline-variant: #c8c5ca;
  --color-secondary-container: #e4e1e5;
  --color-on-secondary-container: #656467;
  --color-error-container: #ffdad6;
  --color-on-error-container: #93000a;

  --radius-lg: 0.25rem;
  --radius-xl: 0.5rem;
  --radius-full: 1rem;

  --spacing-ax-xs: 0.25rem;
  --spacing-ax-sm: 0.5rem;
  --spacing-ax-md: 1rem;
  --spacing-ax-lg: 1.5rem;
  --spacing-ax-xl: 2rem;
  --spacing-gutter: 16px;
  --spacing-margin: 24px;

  --font-display: Geist;
  --font-headline-lg: Geist;
  --font-headline-lg-mobile: Geist;
  --font-headline-md: Geist;
  --font-headline-sm: Geist;
  --font-body-lg: Geist;
  --font-body-sm: Geist;
  --font-body-md: Geist;
  --font-label-md: "JetBrains Mono";

  --text-display: 36px;
  --text-display--line-height: 40px;
  --text-display--letter-spacing: -0.02em;
  --text-display--font-weight: 600;
  --text-headline-lg: 24px;
  --text-headline-lg--line-height: 32px;
  --text-headline-lg--letter-spacing: -0.02em;
  --text-headline-lg--font-weight: 600;
  --text-headline-lg-mobile: 20px;
  --text-headline-lg-mobile--line-height: 28px;
  --text-headline-lg-mobile--font-weight: 600;
  --text-headline-md: 20px;
  --text-headline-md--line-height: 28px;
  --text-headline-md--letter-spacing: -0.01em;
  --text-headline-md--font-weight: 600;
  --text-headline-sm: 16px;
  --text-headline-sm--line-height: 24px;
  --text-headline-sm--font-weight: 600;
  --text-body-lg: 16px;
  --text-body-lg--line-height: 24px;
  --text-body-lg--font-weight: 400;
  --text-body-sm: 12px;
  --text-body-sm--line-height: 16px;
  --text-body-sm--font-weight: 400;
  --text-body-md: 14px;
  --text-body-md--line-height: 20px;
  --text-body-md--font-weight: 400;
  --text-label-md: 12px;
  --text-label-md--line-height: 16px;
  --text-label-md--letter-spacing: 0.02em;
  --text-label-md--font-weight: 500;
}

body {
  font-family: 'Geist', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  font-size: 18px;
  display: inline-block;
  vertical-align: middle;
}

.pro-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #000;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 100ms ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #000;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.comp-preview {
  background: repeating-conic-gradient(#f0f0f0 0% 25%, transparent 0% 50%) 0 0 / 12px 12px;
  border-radius: 0.5rem;
}

```

**`@theme { ... }` 与设计 token**（颜色、间距、字体、圆角等）须与 [`ui-style.md`](./ui-style.md) 一致；可直接从本仓库 `web/src/style.css` 复制 `@theme` 块及文件末尾的工具类（`.material-symbols-outlined`、`.pro-shadow`、`.scrollbar-hide`、range 滑块样式等）。

在 `main.ts` 中引入该 CSS：

```ts
import './style.css'
```

---

## 4. 字体与图标（main.ts）

组件普遍使用 **Material Symbols Outlined** 与 **Geist / JetBrains Mono**，在 `main.ts` 中通过 import 加载（顺序建议：图标 → 正文字体 → 等宽字体）：

```ts
import 'material-symbols/outlined.css'
import '@fontsource/geist/400.css'
import '@fontsource/geist/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
```

> **注意**：不要只引入 `@fontsource/geist` 默认入口（通常仅含 400）。标题与按钮的 `font-semibold`（600）需要单独引入 `600.css`，否则会由浏览器合成加粗。标签字体使用静态 **JetBrains Mono**（非 `@fontsource-variable/jetbrains-mono`），与 HTML 参考稿 [`settings.html`](./settings.html) 一致。

字体栈、字号 token 与 HTML 原型对齐方式见 [`ui-style.md`](./ui-style.md) §3。

---

## 5. 注册组件（main.ts）

```ts
import { createApp } from 'vue'
import { Toaster } from 'vue-sonner'
import 'material-symbols/outlined.css'
import '@fontsource/geist/400.css'
import '@fontsource/geist/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import 'vue-sonner/style.css'
import './style.css'
import App from './App.vue'
import { registerComponents } from './components/ui'

const app = createApp(App)
registerComponents(app)
app.component('Toaster', Toaster)
app.mount('#app')
```

`registerComponents` 会全局注册：

`AxButton`、`AxInput`、`AxSlider`、`AxTooltip`、`AxAlert`、`AxDropdown`、`AxSelect`、`AxDialog`、`AxPropPanel`

---

## 6. 通知 Toaster

使用 `useNotify` 时，在应用根模板中挂载 **一次** `<Toaster />`（与 `main.ts` 中的全局注册配合）：

```vue
<script setup lang="ts">
import { Toaster } from 'vue-sonner'
</script>

<template>
  <!-- 你的布局 -->
  <Toaster position="top-right" rich-colors close-button />
</template>
```

---

## 7. 使用方式

**全局标签**（已执行 `registerComponents`）：

```vue
<AxButton variant="primary">保存</AxButton>
<AxInput v-model="name" placeholder="名称" />
```

**按需导入**（不全局注册时）：

```ts
import { AxButton, useNotify, useFloating, provideTeleportTarget, useTeleportTarget } from '@/components/ui'
import { FloatingBall, useFloatingBall } from '@/components/ui' // FloatingBall
```

`layout/` 下的 `ConsoleLayout`、`ComponentsView` 等为演示与控制台壳层，**不是**使用组件库的必要条件，可按需复制或参考。

---

## 8. 自检清单

- [ ] 依赖已安装，`vite.config.ts` 含 `tailwindcss()` 插件
- [ ] `style.css` 含 `@import "tailwindcss"`、`@plugin "@tailwindcss/forms"` 及完整 `@theme`
- [ ] `main.ts` 已引入图标与字体（`material-symbols`、`@fontsource/geist/400`+`600`、`@fontsource/jetbrains-mono/400`+`500`）
- [ ] `main.ts` 引入 `style.css`、`registerComponents`、`Toaster` 全局注册
- [ ] 根组件已渲染 `<Toaster />`（若使用通知）
- [ ] 后续对照 [`ui-style.md`](./ui-style.md) 校对 token 与组件用法

---

## 9. Content Script / Shadow DOM

在 WXT 扩展的 Content Script 中使用本组件库时，须配合 Shadow DOM 并注入 Teleport 目标，否则 `AxTooltip`、`AxDropdown`（含 `AxSelect`）的浮层会逃逸到宿主页面。

**完整接入步骤、配置项与注意事项见 [`content-script-shadow-dom.md`](./content-script-shadow-dom.md)。**

最小必要代码：

```ts
// entrypoints/content/index.ts — 创建容器并传入根组件
const teleportTarget = document.createElement('div')
teleportTarget.id = 'teleport-root'
uiContainer.appendChild(teleportTarget)
const app = createApp(ContentApp, { teleportTarget })
```

```vue
<!-- ContentApp.vue — 根组件注入一次即可 -->
<script setup lang="ts">
import { provideTeleportTarget } from '@/components/ui'
const props = defineProps<{ teleportTarget: HTMLElement }>()
provideTeleportTarget(props.teleportTarget)
</script>
```

Popup / 普通 Vite 开发环境**无需**上述配置，Teleport 自动回退到 `body`。

---

## 后续：配套文档

安装完成后，按以下文档开始开发：

| 文档 | 内容 |
|---|---|
| [design-tokens.md](./design-tokens.md) | 所有颜色、字体、图标、间距、圆角 token |
| [components.md](./components.md) | 每个 Ax* 组件的 Props / Slots / Events / 示例 |
| [ui-style.md](./ui-style.md) | 设计原则、控件尺寸、布局模式、交互规范、检查清单 |
| [html-cdn.md](./html-cdn.md) | 无构建 HTML 单页接入方式 |
