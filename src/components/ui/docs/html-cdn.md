# HTML 单页快速接入

> 无构建步骤的 HTML 原型/演示页接入 Axiom UI 设计 token 的方式。适用于快速原型、设计稿验证、交互 demo。

---

## 依赖架构

**核心规则：禁止混用 `vue.global.js`（IIFE 全局版）与 ESM 第三方库。** 两套 Vue 运行时实例会导致 `setupContext is null` 等崩溃。

**正确做法**：Import Map + 统一 ESM 实例：

```html
<script type="importmap">
{
  "imports": {
    "vue": "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js",
    "@vueuse/core": "https://esm.sh/@vueuse/core@11?external=vue",
    "@floating-ui/dom": "https://esm.sh/@floating-ui/dom@1.6.3",
    "vue-sonner": "https://esm.sh/vue-sonner@1?external=vue"
  }
}
</script>

<link rel="stylesheet" href="https://unpkg.com/vue-sonner/style.css" />

<script type="module">
  import { createApp, ref, h } from 'vue'
  import { onClickOutside, useMagicKeys } from '@vueuse/core'
  import { computePosition, flip, shift, offset } from '@floating-ui/dom'
  import { Toaster, toast } from 'vue-sonner'
</script>
```

| 规则 | 说明 |
|---|---|
| `?external=vue` | 确保所有库共享 import map 中的同一个 `vue` 实例 |
| `<script type="module">` | 入口脚本必须是 ESM，禁止 `const { ref } = Vue` |
| CDN 选型 | Vue 用 `vue.esm-browser.js`；其余库用 `esm.sh` 或等效 ESM CDN |

---

## 字体与图标 CDN

```html
<!-- 图标 -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">

<!-- 字体 -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fontsource/geist@5.2.9/400.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fontsource/geist@5.2.9/600.css" rel="stylesheet">
```

---

## Tailwind CDN 配置

```html
<script src="https://cdn.tailwindcss.com?plugins=forms"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: '#000000',
          'on-primary': '#ffffff',
          secondary: '#5f5e61',
          'on-secondary': '#ffffff',
          tertiary: '#000000',
          error: '#ba1a1a',
          'on-error': '#ffffff',
          background: '#f9f9fa',
          surface: '#f9f9fa',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f3f3f4',
          'surface-container': '#eeeeef',
          'surface-container-high': '#e8e8e9',
          'surface-container-highest': '#e2e2e3',
          'surface-variant': '#e2e2e3',
          'on-surface': '#1a1c1d',
          'on-surface-variant': '#47464a',
          'on-background': '#1a1c1d',
          outline: '#78767b',
          'outline-variant': '#c8c5ca',
          'secondary-container': '#e4e1e5',
          'on-secondary-container': '#656467',
          'error-container': '#ffdad6',
          'on-error-container': '#93000a',
        },
        borderRadius: {
          DEFAULT: '0.125rem',
          lg: '0.25rem',
          xl: '0.5rem',
          full: '0.75rem',
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          gutter: '16px',
          margin: '24px',
        },
        fontFamily: {
          'display': ['Geist'],
          'headline-lg': ['Geist'],
          'headline-lg-mobile': ['Geist'],
          'headline-md': ['Geist'],
          'headline-sm': ['Geist'],
          'body-lg': ['Geist'],
          'body-sm': ['Geist'],
          'body-md': ['Geist'],
          'label-md': ['JetBrains Mono'],
        },
        fontSize: {
          'display': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '600' }],
          'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
          'headline-lg-mobile': ['20px', { lineHeight: '28px', fontWeight: '600' }],
          'headline-md': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
          'headline-sm': ['16px', { lineHeight: '24px', fontWeight: '600' }],
          'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
          'body-sm': ['12px', { lineHeight: '16px', fontWeight: '400' }],
          'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
          'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        },
      },
    },
  }
</script>
```

---

## 与 Vue 项目的关键差异

| 维度 | HTML CDN | Vue 项目 |
|---|---|---|
| 间距 class 前缀 | `gap-sm` / `p-md`（无 `ax-` 前缀） | `gap-ax-sm` / `p-ax-md` |
| 间距数值 | 相同 | 相同 |
| 颜色 class | 相同语义 token | 相同语义 token |
| `borderRadius.full` | `0.75rem` | `1rem`（`--radius-full`） |
| 组件 | 不可用（需手写 HTML） | `Ax*` 组件可用 |

---

## 基础样式工具类

```css
body {
  font-family: 'Geist', sans-serif;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 18px;
  display: inline-block;
  vertical-align: middle;
}

.pro-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

---

## Vue `:style` 绑定注意

在 HTML 文件的标签属性中，**禁止**在 `:style` 表达式内使用 `\"` 转义双引号 —— HTML 解析器会截断属性，导致模板编译失败。

```html
<!-- ✅ 正确：表达式内用单引号包裹 CSS 值 -->
<span
  class="material-symbols-outlined"
  :style="{ fontVariationSettings: active ? '\'FILL\' 1' : '\'FILL\' 0' }"
>{{ name }}</span>

<!-- ❌ 错误：HTML 属性内的 \" 会被解析器破坏 -->
<span :style="{ fontVariationSettings: active ? \"'FILL' 1\" : \"'FILL' 0\" }">
```

`.vue` 单文件组件中可使用双引号（无 HTML 属性层嵌套）。
