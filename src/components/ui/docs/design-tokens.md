# 设计 Token 速查

> Axiom UI 的视觉基础 —— 颜色、字体、图标、间距、圆角、阴影。所有 `Ax*` 组件和布局页面均基于这些 token，禁止硬编码色值或尺寸。

---

## 1. 颜色

基于 Material Design 3 语义色板，中性灰阶为主，主色为纯黑。

### 1.1 核心色

| Token | 色值 | 用途 |
|---|---|---|
| `primary` | `#000000` | 主按钮、开关开启、强调文字 |
| `on-primary` | `#ffffff` | 主色上的文字 |
| `secondary` | `#5f5e61` | 次要文字、图标 |
| `on-secondary` | `#ffffff` | 次要色上的文字 |
| `tertiary` | `#000000` | 第三强调 |
| `error` | `#ba1a1a` | 错误状态 |
| `on-error` | `#ffffff` | 错误色上的文字 |

### 1.2 表面与背景

| Token | 色值 | 用途 |
|---|---|---|
| `background` | `#f9f9fa` | 页面底色 |
| `surface` | `#f9f9fa` | 通用表面 |
| `surface-container-lowest` | `#ffffff` | 弹窗、卡片、侧栏 |
| `surface-container-low` | `#f3f3f4` | 悬停背景、输入框底色 |
| `surface-container` | `#eeeeef` | 徽章、次要容器 |
| `surface-container-high` | `#e8e8e9` | 抬升容器 |
| `surface-container-highest` | `#e2e2e3` | 最高层级表面 |
| `surface-variant` | `#e2e2e3` | 变体表面 |

### 1.3 文字与边框

| Token | 色值 | 用途 |
|---|---|---|
| `on-surface` | `#1a1c1d` | 主文字 |
| `on-surface-variant` | `#47464a` | 辅助说明 |
| `on-background` | `#1a1c1d` | 背景上的文字 |
| `outline` | `#78767b` | 开关关闭、次要边框 |
| `outline-variant` | `#c8c5ca` | 卡片边框、分隔线 |

### 1.4 容器强调色

| Token | 色值 | 用途 |
|---|---|---|
| `secondary-container` | `#e4e1e5` | 导航激活背景 |
| `on-secondary-container` | `#656467` | 导航激活文字 |
| `error-container` | `#ffdad6` | `AxAlert` type=error 背景 |
| `on-error-container` | `#93000a` | 错误提示文字 |

### 1.5 FloatingBall 专用

| Token | 色值 |
|---|---|
| `ball` | `#6366f1` |
| `ball-light` | `#818cf8` |

### 1.6 使用规则

| 场景 | 推荐 class |
|---|---|
| 页面背景 | `bg-surface-container-low` |
| 弹窗/卡片 | `bg-surface-container-lowest border-outline-variant` |
| 主文字 | `text-primary` 或 `text-on-surface` |
| 辅助说明 | `text-on-surface-variant` 或 `text-secondary` |
| 分隔线 | `border-outline-variant` |
| 主按钮 | `AxButton variant=primary` |
| 导航激活 | `bg-secondary-container text-on-secondary-container` |
| 输入框 | `bg-surface-container-low border-outline-variant` |
| 聚焦环 | `focus:ring-1 focus:ring-primary focus:border-primary` |

---

## 2. 字体

### 2.1 字体族

| 用途 | 字体 | Tailwind class |
|---|---|---|
| 界面正文、标题 | **Geist** | `font-body-*` / `font-headline-*` |
| 标签、代码、徽章 | **JetBrains Mono** | `font-label-md` |

中文回退：Geist 和 JetBrains Mono 均不含中文字形，由系统 `sans-serif` 回退（Windows 通常为微软雅黑）。

### 2.2 字号阶梯

| Token | 字号 / 行高 | 字重 | 字距 | 典型场景 |
|---|---|---|---|---|
| `display` | 36px / 40px | 600 | -0.02em | 大标题 |
| `headline-lg` | 24px / 32px | 600 | -0.02em | 页面主标题 |
| `headline-lg-mobile` | 20px / 28px | 600 | — | 移动端主标题 |
| `headline-md` | 20px / 28px | 600 | -0.01em | 区块标题 |
| `headline-sm` | 16px / 24px | 600 | — | 侧栏标题、`AxDialog` 标题 |
| `body-lg` | 16px / 24px | 400 | — | 强调正文 |
| `body-md` | 14px / 20px | 400 | — | 默认正文、Toast 辅助 |
| `body-sm` | 12px / 16px | 400 | — | 辅助说明、`AxAlert` 正文 |
| `label-md` | 12px / 16px | 500 | +0.02em | 按钮、导航、表单标签（JetBrains Mono） |

### 2.3 引入方式

**Vue 项目**（`main.ts`）：

```ts
import '@fontsource/geist/400.css'
import '@fontsource/geist/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
```

**HTML 单页**（CDN）：

```html
<link href="https://cdn.jsdelivr.net/npm/@fontsource/geist@5.2.9/400.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fontsource/geist@5.2.9/600.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

> Geist 须同时引入 400 和 600，避免 semibold 被浏览器合成加粗。

---

## 3. 图标

**标准库：Material Symbols Outlined**

| 状态 | FILL | 字重 | 尺寸 |
|---|---|---|---|
| 默认/未选中 | `0` | 400 | 18px |
| 导航激活 | `1` | 400 | 18px |
| 提示信息 | `0` | 400 | 14px |

**引入：**

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

**常用图标：**

| 场景 | 图标名 |
|---|---|
| 通用设置 | `settings` |
| 关闭 | `close` |
| 信息提示 | `info` |
| 错误 | `error` |
| 警告 | `warning` |
| 成功 | `check_circle` |
| 搜索 | `search` |
| 展开 | `expand_more` |
| 通知 | `notifications` |
| 帮助 | `help_outline` |
| 跳转 | `arrow_forward` |
| 更多 | `more_vert` |

---

## 4. 间距

| Token（Vue class） | 值 | 用途 |
|---|---|---|
| `ax-xs` | 0.25rem | 图标与文字、紧凑 gap |
| `ax-sm` | 0.5rem | 按钮内 gap、行内间距 |
| `ax-md` | 1rem | 卡片、Toast 内边距 |
| `ax-lg` | 1.5rem | 预览区、Dialog 内容区 |
| `ax-xl` | 2rem | 大区块横向间距 |
| `gutter` | 16px | 栅格沟槽 |
| `margin` | 24px | 内容区水平内边距 `p-margin` |

> HTML CDN 栈将上表映射为 `xs`/`sm`/`md`/`lg`/`xl`（无 `ax-` 前缀），数值相同。

---

## 5. 圆角

| Token | 值 | 用途 |
|---|---|---|
| `DEFAULT` | 2px | 极小元素 |
| `lg` | 4px | 输入框、按钮 |
| `xl` | 8px | 卡片、导航项、弹窗 |
| `full` | 16px（`1rem`） | 开关轨道、药丸形、浮层圆角 |

> HTML CDN 的 `borderRadius.full` 为 `0.75rem`；Vue `@theme` 的 `--radius-full` 为 `1rem`，以 `web/src/style.css` 为准。

---

## 6. 阴影

仅一个工具类，弹窗、Toast、下拉面板使用：

```css
.pro-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
```

禁止多层阴影叠加。
