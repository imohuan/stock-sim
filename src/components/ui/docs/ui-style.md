# UI 设计规范

> Axiom UI 的使用指南 —— 设计原则、控件尺寸、布局模式、交互规范、动效约定、检查清单。

**配套文档**：颜色/字体/间距 token 见 [design-tokens.md](./design-tokens.md)；组件 API 见 [components.md](./components.md)；安装见 [install.md](./install.md)；HTML 单页接入见 [html-cdn.md](./html-cdn.md)。

---

## 1. 设计原则

| 原则 | 说明 |
|---|---|
| 语义化颜色 | 使用 `primary`、`surface-container` 等 token，禁止硬编码 `#000`、`bg-gray-500` |
| 层级清晰 | 背景 -> 容器 -> 卡片 -> 控件，每层有明确的边框或色差 |
| 尺寸统一 | 同类控件（按钮、Select 触发器、Dropdown 触发器）高度一致，禁止局部放大 |
| 克制动效 | 过渡 100-200ms；导航激活 `scale-[0.98]`；悬停仅改背景色 |
| 可访问性 | 弹窗焦点锁定、ESC/点击遮罩关闭、开关带 `aria-checked` |
| 库优先 | 浮层定位、点击外部、快捷键、通知队列等横切能力**必须**使用成熟库，禁止手写 |
| 栈无关 | 样式 class 与 token 命名一致，HTML 与 Vue 可互换复用 |

---

## 2. 控件尺寸体系

工具型面板中，**所有可交互控件的物理高度必须对齐**。禁止局部使用 `p-3`、`py-2` 等导致某组件明显偏大。

### 2.1 标准高度基准

所有交互控件（Button、Input、Select、Switch）同 size 下**高度严格一致**：


| 控件类型         | size | 内边距           | 高度  | 说明       |
| ------------ | ---- | ------------- | ----- | -------- |
| `AxButton` | xs | `h-[18px] px-1.5 py-px` | 18px | 极小按钮 |
| `AxButton` | sm | `h-5 px-2 py-0.5` | 20px | 紧凑按钮 |
| `AxButton` | md | `h-6 px-2.5 py-1` | 24px | 默认主/线框/幽灵按钮 |
| `AxButton` | lg | `h-7 px-3 py-1.5` | 28px | 大号按钮 |
| `AxButton` | xl | `h-8 px-3.5 py-2` | 32px | 超大按钮 |
| `AxButton` size=icon | — | `w-6 h-6` | 24px | 纯图标（如侧栏 more） |
| `AxButton` size=icon-lg | — | `w-7 h-7` | 28px | 大号图标按钮 |
| `AxInput` | xs | `h-[18px] px-1.5 py-px` | 18px | 极小输入框 |
| `AxInput` | sm | `h-5 px-2 py-0.5` | 20px | 紧凑输入框 |
| `AxInput` | md | `h-6 px-2.5 py-1` | 24px | 默认输入框 |
| `AxInput` | lg | `h-7 px-3 py-1.5` | 28px | 大号输入框 |
| `AxInput` | xl | `h-8 px-3.5 py-2` | 32px | 超大输入框 |
| `AxSelect` 触发器 | xs | `h-[18px] px-1.5 py-px` | 18px | 与 xs 按钮等高 |
| `AxSelect` 触发器 | sm | `h-5 px-2 py-0.5` | 20px | 与 sm 按钮等高 |
| `AxSelect` 触发器 | md | `h-6 px-2.5 py-1` | 24px | 与 md 按钮等高 |
| `AxSelect` 触发器 | lg | `h-7 px-3 py-1.5` | 28px | 与 lg 按钮等高 |
| `AxSelect` 触发器 | xl | `h-8 px-3.5 py-2` | 32px | 与 xl 按钮等高 |
| `AxSwitch` 轨道 | xs | `h-[18px] w-[30px]` (thumb `h-3 w-3`) | 18px | 与 xs 控件等高 |
| `AxSwitch` 轨道 | sm | `h-5 w-[34px]` (thumb `h-3.5 w-3.5`) | 20px | 与 sm 控件等高 |
| `AxSwitch` 轨道 | md | `h-6 w-10` (thumb `h-4 w-4`) | 24px | 与 md 控件等高 |
| `AxSwitch` 轨道 | lg | `h-7 w-11` (thumb `h-5 w-5`) | 28px | 与 lg 控件等高 |
| `AxSwitch` 轨道 | xl | `h-8 w-12` (thumb `h-6 w-6`) | 32px | 与 xl 控件等高 |
| `AxDropdown` 菜单项 | — | `px-3 py-1.5` | — | 由触发器 slot 决定高度 |
| 侧栏导航项        | — | `py-1.5 px-2` | ~32px | 与按钮视觉对齐  |
| 下拉菜单项        | — | `px-3 py-1.5` | —     | 菜单内列表行   |

### 2.2 宽度约束

| 控件 | 宽度规则 |
|---|---|
| `AxSelect` 触发器 | 默认 `w-full`；需限宽时传 `trigger-max-width`（如 `280px`），非强制写死 class |
| `AxButton` | 默认自适应；`block` 时 `w-full` |
| `AxInput` | 默认 `w-full`；size=`md` 为 `h-6 px-2.5 py-1`，`lg` 为 `h-7 px-3 py-1.5` |

### 2.3 纯图标按钮

纯图标按钮**必须**显式声明等宽等高，禁止仅用 `p-1` 或 `p-0.5`（字体图标行高会导致长方形）。

```html
<button class="w-{size} h-{size} flex items-center justify-center rounded-lg shrink-0 ...">
  <span class="material-symbols-outlined">close</span>
</button>
```

| 场景 | 尺寸 | 圆角 |
|---|---|---|
| Alert 内联关闭 | `w-5 h-5`（20px） | `rounded` |
| Toast / Drawer 关闭 | `w-6 h-6`（24px） | `rounded-lg` |
| 侧栏 more 菜单 | `w-7 h-7`（28px） | `rounded-lg` |
| Header 铃铛 / Dialog 关闭 | `w-8 h-8`（32px） | `rounded-lg` |

悬停态：`hover:bg-surface-container-low`；错误上下文：`hover:bg-error/10`。

---

## 3. 布局模式

### 3.1 设置弹窗结构（`AxDialog` / 演示壳层）

```
+---------------------------------------------+
|  SideNav (w-60)  |  Main Content            |
|  --------------- |  - Header (h-12) -----   |
|  标题 + 副标题    |  - Scroll Area ---------  |
|  导航列表         |    节标题 + 说明           |
|  底部链接         |    卡片 / 表单项           |
|                  |  - Footer (h-12) -------  |
+---------------------------------------------+
```

| 属性 | 值 |
|---|---|
| `AxDialog` 默认宽度 | `max-w-xl`（prop `maxWidth` 可改） |
| `AxDialog` 最大高度 | `max-h-[85vh]`；内容区 `p-ax-lg overflow-y-auto scrollbar-hide` |
| `AxDialog` 顶栏 | `h-12`；关闭按钮 `w-8 h-8` |
| `AxDialog` 底栏（可选） | `h-14`；`#footer` slot |
| 演示壳层侧栏（`ConsoleLayout`） | `w-60`（非 `w-52`） |
| 区块垂直间距 | `space-y-ax-lg` |

### 3.2 侧栏导航

```html
<!-- 默认 -->
<a class="flex items-center gap-ax-sm text-secondary hover:bg-surface-container-low rounded-xl py-1.5 px-2 font-label-md text-label-md transition-all duration-100" href="#">
  <span class="material-symbols-outlined">settings</span>
  <span>General</span>
</a>

<!-- 激活：FILL=1 + scale-[0.98] -->
<a class="flex items-center gap-ax-sm bg-secondary-container text-on-secondary-container font-medium scale-[0.98] rounded-xl py-1.5 px-2 font-label-md text-label-md transition-all duration-100" href="#">
  <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">auto_fix_high</span>
  <span>Processing</span>
</a>
```

### 3.3 卡片

```html
<section class="bg-surface-container-lowest border border-outline-variant rounded-lg p-ax-md">
  <label class="font-label-md text-label-md font-semibold text-primary">标题</label>
  <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">说明文字</p>
</section>
```

---

## 4. 弹窗交互规范

所有 Dialog / Drawer / Popover 必须支持：

| 行为 | 要求 |
|---|---|
| ESC 关闭 | 监听 `keydown`（`Escape`），关闭并归还焦点 |
| 点击遮罩关闭 | 点击 overlay 区域关闭（有未保存更改时可二次确认） |
| 焦点锁定 | Tab 仅在弹窗内循环 |
| 打开时焦点 | 聚焦第一个可交互元素或关闭按钮 |
| 关闭后焦点 | 归还至触发元素 |
| 滚动锁定 | 打开时锁定 `body` 滚动 |

### AxDialog 实现状态

| 能力 | 状态 |
|---|---|
| 遮罩关闭 | `@click.self` + prop `closeOnOverlay`（默认 true） |
| 滚动锁定 | 打开时 `document.body.style.overflow = 'hidden'` |
| Tab 焦点环 | `@keydown` 在首尾 focusable 间循环 |
| ESC | **未内置**，需在父级（如 `ConsoleLayout` 的 `handleGlobalKeydown`）或业务层补充 |

### AxDropdown 实现状态

| 能力 | 状态 |
|---|---|
| ESC 关闭 | 已内置 |
| 点击外部 | `onClickOutside`（`@vueuse/core`） |

---

## 5. 组件底层依赖（兵器谱）

写**无样式**基础组件时，按类型选用底层库；样式层统一套用 design tokens。

### 5.1 浮层与定位

| 组件类型 | 核心痛点 | Vue 推荐 |
|---|---|---|
| Dropdown / Tooltip / Select | 边缘碰撞、翻转、偏移 | `@floating-ui/vue` + `<Teleport>` |
| Dialog | 焦点锁定、滚动锁定 | `AxDialog`（自研 Tab 环） |
| Notify / Toast | 堆叠、自动关闭、悬停暂停 | `vue-sonner` + `useNotify` |

`useFloating` 默认 middleware：`offset(6)` + `flip()` + `shift({ padding: 5 })`。

### 5.2 横切能力

| 能力 | Vue 推荐 |
|---|---|
| 点击外部关闭 | `@vueuse/core` -> `onClickOutside` |
| 全局快捷键 | `@vueuse/core` -> `useMagicKeys` |
| 防抖/节流 | `@vueuse/core` -> `useDebounceFn` |

### 5.3 通用

| 组件类型 | 核心痛点 | 推荐 |
|---|---|---|
| 日期计算 | 星期矩阵、格式化 | `date-fns` / `dayjs` |
| 表单校验 | 脏检查、schema 校验 | `vee-validate` + `zod` |
| Data Table | 排序、过滤、分页 | `@tanstack/vue-table` |

---

## 6. 动效与滚动

| 场景 | 参数 |
|---|---|
| 颜色过渡 | `transition-colors duration-200` |
| 开关滑块 | `transition duration-200 ease-in-out` |
| 导航激活 | `transition-transform duration-100` + `scale-[0.98]` |
| 主按钮悬停 | `hover:opacity-90 transition-opacity` |
| 内容区滚动 | `overflow-y-auto scrollbar-hide` |
| Toast 入场 | vue-sonner 内置弹性动画，勿叠加自定义 transition |

---

## 7. 检查清单

新页面或组件合并前对照：

### 视觉与 Token

- 字体：正文 Geist（400+600），标签 JetBrains Mono（400+500）
- 图标：Material Symbols Outlined，激活态 FILL=1
- 颜色：全部使用语义 token，无硬编码色值
- 圆角：卡片 `rounded-lg`，导航 `rounded-xl`，按钮 `rounded-md`
- 间距（Vue）：`p-margin` / `p-ax-md` / `gap-ax-sm` / `space-y-ax-lg`
- 阴影：弹窗、Toast、下拉面板使用 `pro-shadow`

### 尺寸与对称

- `AxButton` md / `AxSelect` 触发器统一 `py-1.5`
- `AxSelect` 限宽用 `trigger-max-width`，非强制 `max-w-[280px]`
- 纯图标按钮：`AxButton` icon 尺寸或 `w-N h-N` 正方形

### 交互与库

- `AxDialog`：遮罩关闭 + Tab 焦点环 + 滚动锁定；ESC 由业务层补齐
- `AxDropdown`：ESC + `onClickOutside`
- 浮层定位：Floating UI（flip + shift），非手写 `getBoundingClientRect`
- 点击外部关闭：`onClickOutside`，非手写 document 监听
- 通知：vue-sonner，`top-center`，`duration: 4000`，自定义灰阶样式
- 可访问性：开关有 `role="switch"` + `aria-checked`

### 工程

- HTML 单页：Import Map + `vue.esm-browser.js`，**禁止** `vue.global.js` 混用 ESM 库
- Vue `:style` 绑定：HTML 文件内用单引号转义，无 `\"` 属性截断
- Vue 间距 class 带 `ax-` 前缀，与 HTML CDN 的 `sm`/`md` 数值一致
- 优先使用 `Ax*` 组件而非复制 markup，避免与实现漂移
