# WXT Content Script 接入指南（Shadow DOM + Teleport）

> **文档定位**：本仓库是 **Ax UI 组件库**，不含 WXT 工程代码。本文面向在 **WXT 浏览器扩展** 的 Content Script 中使用本组件库的开发者，说明 Shadow DOM 环境下的接入步骤与注意事项。
>
> 组件安装、依赖与样式配置见 [`component-install.md`](./component-install.md)。

---

## 1. 为什么需要 Shadow DOM

Content Script 直接往宿主页面插入 DOM 时，会遇到两类问题：

1. **样式污染**：宿主页面的 CSS 会覆盖组件样式，组件 CSS 也可能影响页面。
2. **Teleport 逃逸**：`AxTooltip`、`AxDropdown`（含 `AxSelect`）的浮层通过 `<Teleport>` 渲染。若目标写死为 `body`，浮层会跑到 Shadow Root **外面**，丢失样式隔离。

WXT 的 [`createShadowRootUi`](https://wxt.dev/guide/essentials/content-scripts.html#shadow-root-ui) 在宿主页面内创建隔离的 Shadow DOM，配合 `cssInjectionMode: 'ui'` 将 Tailwind / 组件样式注入 Shadow Root 内部。

**组件库已内置 Teleport 适配**——你只需在扩展项目中完成 Shadow DOM 挂载，并调用 `provideTeleportTarget()` 注入目标容器即可。

---

## 2. 架构一览

```
宿主页面 DOM
│
└── <your-extension-ui>              ← WXT createShadowRootUi 创建的自定义元素
    └── #shadow-root
        ├── <style>                    ← WXT 运行时注入（Tailwind + 字体 + 组件样式）
        ├── <div id="teleport-root">   ← 你创建的 Teleport 容器
        └── <div id="app">             ← Vue 挂载点
            └── ContentApp
                ├── provideTeleportTarget(teleportTarget)   ← 必须
                ├── AxTooltip / AxDropdown / AxSelect       ← 自动 Teleport 到 #teleport-root
                └── AxDialog                                      ← 无 Teleport，inline 渲染
```

### 哪些组件涉及 Teleport

| 组件 | Teleport | 说明 |
|------|----------|------|
| `AxTooltip` | ✅ | 悬停提示浮层 |
| `AxDropdown` | ✅ | 下拉菜单浮层；可通过 `teleport={false}` 禁用 |
| `AxSelect` | ✅（间接） | 基于 `AxDropdown`，无需额外配置 |
| `AxDialog` | ❌ | 在组件树内 inline 渲染遮罩 |
| 其余组件 | ❌ | 无浮层 Teleport |

---

## 3. 快速接入（三步）

### 步骤 1：Content Script 入口 — 创建 Shadow DOM 并挂载 Vue

`entrypoints/content/index.ts`：

```typescript
import { createApp } from 'vue'
import { createShadowRootUi } from 'wxt/client'
import ContentApp from './ContentApp.vue'
import { registerComponents } from '@/components/ui'
import './style.css'   // 含 @import "tailwindcss"、@theme、字体等

export default defineContentScript({
  matches: ['*://*/*'],
  cssInjectionMode: 'ui',   // 必须：CSS 注入 Shadow DOM，而非 manifest css 数组
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'your-extension-ui',   // kebab-case 自定义元素名
      position: 'inline',
      anchor: 'body',
      mode: 'closed',
      onMount(uiContainer) {
        // ① Teleport 容器（必须在 Shadow Root 内、Vue 挂载点之前或并列创建）
        const teleportTarget = document.createElement('div')
        teleportTarget.id = 'teleport-root'
        uiContainer.appendChild(teleportTarget)

        // ② Vue 挂载点
        const appRoot = document.createElement('div')
        appRoot.id = 'app'
        uiContainer.appendChild(appRoot)

        // ③ 创建并挂载 Vue 应用
        const app = createApp(ContentApp, { teleportTarget })
        registerComponents(app)
        app.mount(appRoot)
        return app
      },
      onRemove(app) {
        app?.unmount()
      },
    })
    ui.mount()
  },
})
```

### 步骤 2：根组件 — 注入 Teleport 目标

`entrypoints/content/ContentApp.vue`：

```vue
<script setup lang="ts">
import { provideTeleportTarget } from '@/components/ui'

const props = defineProps<{ teleportTarget: HTMLElement }>()

// 必须：让 AxTooltip / AxDropdown / AxSelect 的浮层留在 Shadow DOM 内
provideTeleportTarget(props.teleportTarget)
</script>

<template>
  <!-- 你的 UI，组件照常使用 -->
  <AxTooltip content="提示文字">
    <AxButton>悬停我</AxButton>
  </AxTooltip>

  <AxSelect v-model="value" :options="options" />
</template>
```

### 步骤 3：样式入口 — 引入组件库 CSS

`entrypoints/content/style.css` 须包含 Tailwind、`@theme` token、Material Symbols 等，可直接从本仓库 `web/src/style.css` 复制 `@theme` 块与工具类。`main.ts` 中引入的字体也需在 Content Script 侧加载：

```typescript
import 'material-symbols/outlined.css'
import '@fontsource/geist/400.css'
import '@fontsource/geist/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './style.css'
```

> Popup / Options 等普通页面 entrypoint **不需要** Shadow DOM 和 `provideTeleportTarget`，按 [`component-install.md`](./component-install.md) 常规接入即可。

---

## 4. Teleport API 说明

组件库导出两个函数（位于 `hooks/useTeleportTarget.ts`）：

```typescript
// 在根组件调用一次
provideTeleportTarget(target: HTMLElement | string | Ref<...>)

// 组件内部自动调用，扩展项目无需直接使用
useTeleportTarget(): Ref<string | HTMLElement>
```

### 回退行为

| 环境 | 是否调用 `provideTeleportTarget` | Teleport 目标 | 结果 |
|------|----------------------------------|---------------|------|
| Content Script + Shadow DOM | ✅ 注入 `HTMLElement` | Shadow Root 内 `#teleport-root` | 浮层样式隔离 ✅ |
| Popup / Options 页面 | ❌ 未调用 | 回退 `'body'` | 与常规 Web 应用一致 ✅ |
| 本仓库 Vite 开发环境 | ❌ 未调用 | 回退 `'body'` | 组件演示正常 ✅ |

**你不需要修改 `AxTooltip` / `AxDropdown` 源码**，也无需在每个使用处传 prop——只要在根组件注入一次即可。

### 自定义 Teleport 目标

若已有容器，可直接传选择器或元素：

```typescript
provideTeleportTarget('#teleport-root')
// 或
provideTeleportTarget(teleportTarget)   // HTMLElement
```

---

## 5. WXT 配置要点

| 选项 | 推荐值 | 说明 |
|------|--------|------|
| `cssInjectionMode` | `'ui'` | CSS 通过 `web_accessible_resources` 注入 Shadow DOM，不进 manifest `content_scripts.css` |
| `mode` | `'closed'` | 封闭 Shadow Root，宿主 JS 无法访问内部 |
| `position` | `'inline'` | 普通 DOM 插入；FloatingBall 等需要跟随页面滚动时使用 |
| `anchor` | `'body'` 或具体选择器 | UI 挂载位置 |

WXT 自动处理：Shadow DOM 创建、CSS fetch 与注入、`all: initial` 样式重置、自定义元素生命周期。

---

## 6. 样式注意事项

### 6.1 样式来源

Content Script 的样式**不会**自动从 Popup entrypoint 继承。须为 Content Script 单独维护 `style.css` 入口，并确保包含：

- `@import "tailwindcss"` + `@plugin "@tailwindcss/forms"`
- 完整 `@theme { ... }` design tokens（与 [`ui-style.md`](./ui-style.md) 一致）
- `.material-symbols-outlined`、`.pro-shadow` 等工具类

### 6.2 `rem` 单位

Tailwind 的 `rem` 相对**宿主页面** `<html>` 的 `font-size` 计算，WXT 的 `all: initial` 不会重置它。部分网站（如 Reddit）根字号非 16px 时，UI 可能缩放不一致。

可选方案：在 Content Script 的 PostCSS 链路中将 `rem` 转为 `px`（仅影响该 entrypoint）：

```bash
npm i -D postcss-rem-to-responsive-pixel
```

```js
// postcss.config.mjs
import remToPx from 'postcss-rem-to-responsive-pixel'
export default {
  plugins: [remToPx({ rootValue: 16, propList: ['*'], transformUnit: 'px' })],
}
```

### 6.3 AxButton Ripple

`AxButton` 的 ripple 动画定义在组件 `<style scoped>` 中，WXT 会将其提取并注入 Shadow DOM，通常无需额外处理。若 ripple 不显示，可在 Content Script 的 `style.css` 中补充非 scoped 的 `.ax-ripple` 规则作为兜底（Shadow DOM 内全局选择器是安全的）。

---

## 7. 其他注意事项

### Popup vs Content Script

| 方面 | Popup / Options | Content Script |
|------|-----------------|----------------|
| DOM 环境 | 普通页面 | Shadow DOM |
| `provideTeleportTarget` | 不需要 | **必须** |
| `cssInjectionMode: 'ui'` | 不需要 | **必须** |
| 样式入口 | `main.ts` + `style.css` | 独立 `entrypoints/content/style.css` |

### HMR

`createShadowRootUi` 不支持 HMR。修改 Content Script 相关文件后，须**手动刷新扩展**并在目标页面重新加载。

### 事件冒泡

FloatingBall 等组件依赖 pointer 事件冒泡。WXT 默认 `isolateEvents: false`，一般无需改动。若自定义了 `isolateEvents: true`，需确认拖拽/点击行为仍正常。

### AxDialog 的 body 滚动锁定

`AxDialog` 打开时会设置 `document.body.style.overflow = 'hidden'`，影响的是**宿主页面** body，而非 Shadow Root 内部。在 Content Script 中使用时注意该副作用；若需避免，可在业务层自行封装 Dialog 或 fork 该行为。

---

## 8. 自检清单

接入 Content Script 后，按以下项逐项确认：

- [ ] `cssInjectionMode: 'ui'` 已设置
- [ ] Shadow Root 内已创建 `#teleport-root`（或等效容器）
- [ ] 根组件已调用 `provideTeleportTarget(teleportTarget)`
- [ ] `style.css` 含完整 Tailwind + `@theme` + 字体引入
- [ ] `AxTooltip` / `AxSelect` 浮层样式正常（无宿主 CSS 污染、无裸 DOM）
- [ ] Popup entrypoint 仍可独立运行（无需 Shadow DOM 配置）

---

## 9. 开发命令

```bash
npx wxt dev            # Chrome 开发模式
npx wxt dev -b firefox # Firefox 开发模式
npx wxt build          # 生产构建
```

加载到 Chrome：

1. 打开 `chrome://extensions`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `.output/chrome-mv3` 目录

---

## 相关文档

- [`component-install.md`](./component-install.md) — 组件库安装与注册
- [`ui-style.md`](./ui-style.md) — Design Tokens 与视觉规范
- [WXT Shadow Root UI 官方文档](https://wxt.dev/guide/essentials/content-scripts.html#shadow-root-ui)
