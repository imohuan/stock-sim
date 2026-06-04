# 组件 API 参考

> Axiom UI 全部 10 个基础组件 + 3 个 hooks + 1 个功能模块的完整 API 文档。含 Props、Slots、Events、使用场景和代码示例。

---

## AxButton

**用途**：所有可点击操作 —— 提交、取消、删除、图标按钮等。

**何时用**：任何需要按钮的地方。不要手写 `<button>` 元素。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `variant` | `'primary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | 按钮风格 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'icon' \| 'icon-lg'` | `'md'` | 尺寸。`icon`/`icon-lg` 为正方形图标按钮 |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `icon` | `string` | `''` | Material Symbols 图标名 |
| `iconSize` | `string` | `'16px'` | 图标字号 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `block` | `boolean` | `false` | 块级按钮（`w-full`） |

### Slots

| Slot | 说明 |
|---|---|
| `default` | 按钮文字 |
| `prefix` | 文字前内容 |
| `suffix` | 文字后内容 |

### Events

| Event | 参数 | 说明 |
|---|---|---|
| `click` | `MouseEvent` | 点击事件 |

### 示例

```vue
<!-- 主按钮 -->
<AxButton variant="primary" @click="save">保存</AxButton>

<!-- 线框按钮 -->
<AxButton variant="outline" @click="cancel">取消</AxButton>

<!-- 危险按钮 -->
<AxButton variant="danger" @click="remove">删除</AxButton>

<!-- 纯图标按钮（close 图标，24px） -->
<AxButton variant="ghost" size="icon" icon="close" @click="dismiss" />

<!-- 大号图标按钮（32px） -->
<AxButton variant="outline" size="icon-lg" icon="settings" />

<!-- 带图标的文字按钮 -->
<AxButton icon="add" icon-size="18px">新建</AxButton>

<!-- 块级按钮 -->
<AxButton block>提交</AxButton>
```

---

## AxInput

**用途**：单行文本输入、密码输入、多行文本（textarea）。

**何时用**：任何需要用户输入文本的字段。支持 `v-model` 双向绑定。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `string \| number` | `''` | v-model 值 |
| `type` | `string` | `'text'` | HTML input type |
| `placeholder` | `string` | `''` | 占位文字 |
| `disabled` | `boolean` | `false` | 禁用 |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 尺寸 |
| `password` | `boolean` | `false` | 密码模式（带显示/隐藏切换） |
| `autocomplete` | `string` | — | 自动填充提示 |
| `multiline` | `boolean` | `false` | textarea 多行模式 |
| `rows` | `number` | `3` | textarea 行数 |
| `resize` | `'none' \| 'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | textarea resize 行为 |

### Slots

| Slot | 说明 |
|---|---|
| `prefix` | 输入框左侧内容（仅单行模式） |
| `suffix` | 输入框右侧内容（仅单行模式，密码模式下隐藏） |

### Events

| Event | 参数 | 说明 |
|---|---|---|
| `update:modelValue` | `string` | v-model 更新 |
| `keydown` | `KeyboardEvent` | 键盘按下 |
| `blur` | `FocusEvent` | 失焦 |
| `focus` | `FocusEvent` | 聚焦 |

### 暴露方法

| 方法 | 说明 |
|---|---|
| `focus()` | 聚焦输入框 |

### 示例

```vue
<!-- 普通输入框 -->
<AxInput v-model="name" placeholder="请输入名称" />

<!-- 密码框 -->
<AxInput v-model="password" password placeholder="密码" />

<!-- 带前缀图标 -->
<AxInput v-model="search" placeholder="搜索...">
  <template #prefix>
    <span class="material-symbols-outlined">search</span>
  </template>
</AxInput>

<!-- 多行文本 -->
<AxInput v-model="desc" multiline :rows="5" placeholder="描述" />
```

---

## AxSelect

**用途**：单选/多选下拉选择器，支持搜索过滤。

**何时用**：选项数量 >= 3 时优先使用，替代手写 `<select>` 或单选按钮组。基于 `AxDropdown` + `useFloating`。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `string \| number \| (string \| number)[]` | `''` | 选中值（多选时传数组） |
| `options` | `SelectOption[]` | `[]` | 选项列表 `{ value, label }` |
| `searchable` | `boolean` | `false` | 启用搜索过滤 |
| `multiple` | `boolean` | `false` | 多选模式 |
| `placeholder` | `string` | `'请选择'` | 占位文字 |
| `searchPlaceholder` | `string` | `'搜索...'` | 搜索框占位 |
| `placement` | `string` | `'bottom-start'` | 下拉方向 |
| `dropdownWidth` | `string` | `'match'` | 下拉宽度。`'match'` 匹配触发器宽度 |
| `dropdownMaxWidth` | `string` | `''` | 下拉最大宽度 |
| `tagMaxWidth` | `string` | `'120px'` | 多选标签最大宽度 |
| `triggerWidth` | `string` | `''` | 触发器最小宽度 |
| `triggerMaxWidth` | `string` | `''` | 触发器最大宽度（推荐用此限宽，非硬编码 class） |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 触发器尺寸 |

### Events

| Event | 参数 | 说明 |
|---|---|---|
| `update:modelValue` | `string \| number \| (string \| number)[]` | v-model 更新 |
| `change` | 同上 | 选择变化时触发 |

### 示例

```vue
<script setup>
const options = [
  { value: 'zh', label: '中文' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
]

const lang = ref('zh')
const tags = ref(['zh'])
</script>

<template>
  <!-- 单选 -->
  <AxSelect v-model="lang" :options="options" placeholder="选择语言" />

  <!-- 可搜索单选 -->
  <AxSelect v-model="lang" :options="options" searchable />

  <!-- 多选 -->
  <AxSelect v-model="tags" :options="options" multiple placeholder="选择标签" />

  <!-- 可搜索多选 + 限宽 -->
  <AxSelect v-model="tags" :options="options" multiple searchable trigger-max-width="280px" />
</template>
```

---

## AxDropdown

**用途**：通用下拉菜单容器。`AxSelect` 基于此组件构建，也可独立使用（如右键菜单、操作菜单）。

**何时用**：需要浮层菜单时。触发方式支持 click / hover / contextmenu。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | 打开/关闭（支持 v-model） |
| `placement` | `string` | `'bottom-start'` | 浮层方向 |
| `offset` | `number` | `6` | 距触发器偏移（px） |
| `matchWidth` | `boolean` | `false` | 菜单宽度匹配触发器 |
| `trigger` | `'click' \| 'hover' \| 'contextmenu'` | `'click'` | 触发方式 |
| `hoverCloseDelay` | `number` | `150` | hover 关闭延迟（ms） |
| `menuWidth` | `string` | `''` | 菜单最小宽度 |
| `menuMaxWidth` | `string` | `''` | 菜单最大宽度 |
| `bodyClass` | `string` | `'p-1'` | 菜单内容区 class（替换默认 padding） |
| `teleport` | `boolean` | `true` | 是否 Teleport |

### Slots

| Slot | Props | 说明 |
|---|---|---|
| `trigger` | `{ open, toggle, close }` | 触发器内容 |
| `default` | `{ close }` | 下拉菜单内容 |

### Events

| Event | 参数 |
|---|---|
| `update:modelValue` | `boolean` |

### 示例

```vue
<AxDropdown v-model="open" trigger="click">
  <template #trigger="{ toggle }">
    <AxButton @click="toggle">菜单</AxButton>
  </template>
  <template #default="{ close }">
    <button class="w-full px-3 py-1.5 rounded-lg hover:bg-surface-container-low"
      @click="close(); doEdit()">编辑</button>
    <button class="w-full px-3 py-1.5 rounded-lg hover:bg-surface-container-low"
      @click="close(); doDelete()">删除</button>
  </template>
</AxDropdown>
```

---

## AxDialog

**用途**：模态弹窗，含遮罩层、标题栏、内容区、可选的底部按钮栏。

**何时用**：设置面板、确认对话框、表单弹窗等任何需要阻断用户操作并聚焦单一任务的场景。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | 显示/隐藏（支持 v-model） |
| `title` | `string` | `''` | 标题文字 |
| `icon` | `string` | `''` | 标题左侧 Material Symbols 图标名 |
| `maxWidth` | `string` | `'max-w-xl'` | 弹窗最大宽度 Tailwind class |
| `closeOnOverlay` | `boolean` | `true` | 点击遮罩是否关闭 |
| `bodyClass` | `string` | `''` | 内容区额外 class |

### Slots

| Slot | Props | 说明 |
|---|---|---|
| `header` | — | 自定义标题栏（覆盖 title/icon） |
| `default` | `{ close, setFocusableRef }` | 内容区 |
| `footer` | `{ close, setFocusableRef }` | 底部按钮栏（有内容时才渲染） |

`setFocusableRef(el)`：将元素注册到 Tab 焦点循环中。

### Events

| Event | 说明 |
|---|---|
| `update:modelValue` | 显示/隐藏变化 |
| `close` | 弹窗关闭时 |

### 暴露方法

| 方法 | 说明 |
|---|---|
| `open()` | 打开弹窗 |
| `close()` | 关闭弹窗 |

### 交互行为

- 打开时锁定 `body` 滚动
- Tab 键仅在弹窗内循环（通过 `setFocusableRef` 注册的元素）
- 关闭后焦点归还至触发元素
- 点击遮罩关闭（`closeOnOverlay` 为 true 时）
- **ESC 未内置**（需在父组件自行监听）

### 示例

```vue
<AxDialog v-model="show" title="设置" icon="settings">
  <template #default="{ close, setFocusableRef }">
    <AxInput :ref="setFocusableRef" v-model="name" placeholder="名称" />
  </template>
  <template #footer="{ close }">
    <AxButton variant="outline" @click="close">取消</AxButton>
    <AxButton @click="save(); close()">保存</AxButton>
  </template>
</AxDialog>
```

---

## AxAlert

**用途**：内联信息提示条，支持 info / success / warning / error 四种类型。

**何时用**：表单验证反馈、操作结果提示、功能说明等不需要阻断用户操作的轻量提示。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 提示类型 |
| `title` | `string` | `''` | 标题（可选） |
| `modelValue` | `boolean` | `true` | 显示/隐藏 |
| `dismissible` | `boolean` | `true` | 是否显示关闭按钮 |

### Slots

| Slot | 说明 |
|---|---|
| `default` | 提示正文 |

### Events

| Event | 说明 |
|---|---|
| `update:modelValue` | 显示/隐藏变化 |
| `dismiss` | 用户点击关闭时 |

### 示例

```vue
<!-- 信息提示 -->
<AxAlert type="info" title="提示">这是一条信息。</AxAlert>

<!-- 错误提示 -->
<AxAlert type="error" title="保存失败">请检查表单中的错误后重试。</AxAlert>

<!-- 不可关闭 -->
<AxAlert :dismissible="false">此消息不可关闭</AxAlert>
```

---

## AxSwitch

**用途**：布尔值开关组件。

**何时用**：任何开/关、启用/禁用类型的设置项。也可通过 `AxPropPanel` type=`switch` 使用。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | 开关状态（必传，支持 v-model） |
| `disabled` | `boolean` | `false` | 禁用 |
| `id` | `string` | — | HTML id（配合 label 的 for） |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 开关尺寸 |

### Events

| Event | 参数 |
|---|---|
| `update:modelValue` | `boolean` |

### 可访问性

- `role="switch"`
- `aria-checked` 同步 modelValue

### 示例

```vue
<AxSwitch v-model="enabled" />
<AxSwitch v-model="locked" disabled />
```

---

## AxSlider

**用途**：数值范围滑块。

**何时用**：调整百分比、音量、亮度等连续数值。也可通过 `AxPropPanel` type=`slider` 使用。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `number` | `0` | 当前值 |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `showLabels` | `boolean` | `false` | 显示左右标签 |
| `labelLeft` | `string` | `''` | 左标签文字 |
| `labelRight` | `string` | `''` | 右标签文字 |
| `showValue` | `boolean` | `false` | 显示当前数值 |
| `valueLabel` | `string` | `''` | 自定义数值显示（覆盖默认百分比） |
| `labelPosition` | `'top' \| 'right'` | `'top'` | 标签位置 |

### Events

| Event | 参数 |
|---|---|
| `update:modelValue` | `number` |

### 示例

```vue
<!-- 基础滑块 -->
<AxSlider v-model="volume" />

<!-- 带标签和数值 -->
<AxSlider v-model="volume" :min="0" :max="100"
  show-labels label-left="静音" label-right="最大"
  show-value label-position="top" />
```

---

## AxTooltip

**用途**：hover 文字提示。

**何时用**：为图标按钮、缩略文字等提供补充说明。不应用于承载交互操作。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `content` | `string` | `''` | 提示文字（或用 `#content` slot） |
| `placement` | `string` | `'top'` | 提示方向 |
| `offset` | `number` | `8` | 距触发器偏移（px） |
| `arrow` | `boolean` | `true` | 是否显示箭头 |

### Slots

| Slot | 说明 |
|---|---|
| `default` | 触发器内容 |
| `content` | 自定义提示内容（覆盖 content prop） |

### 示例

```vue
<!-- 简单文字提示 -->
<AxTooltip content="点击保存">
  <AxButton size="icon" icon="save" />
</AxTooltip>

<!-- 自定义提示内容 -->
<AxTooltip>
  <span class="material-symbols-outlined">help_outline</span>
  <template #content>
    <span>快捷键: <kbd>⌘S</kbd></span>
  </template>
</AxTooltip>
```

---

## AxPropPanel

**用途**：schema 驱动的属性配置面板。一行一个配置项，支持 switch / slider / select / input / textarea / segmented 六种字段类型。

**何时用**：任何"配置面板"场景 —— 组件属性调试、设置页、控制面板。**不要手写重复的 label + control 布局**。

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `modelValue` | `Record<string, unknown>` | — | 配置对象（支持 v-model） |
| `schema` | `PropPanelSchemaItem[]` | — | 字段定义数组 |
| `title` | `string` | `'属性配置'` | 面板标题 |

### Schema 字段类型

| type | 额外属性 | 渲染控件 |
|---|---|---|
| `switch` | — | `AxSwitch` |
| `input` | `placeholder` | `<input>` |
| `slider` | `min`, `max`, `step` | `<input type="range">` |
| `select` | `options` | `<select>` |
| `textarea` | `placeholder`, `rows` | `<textarea>` |
| `segmented` | `options` | 分段按钮组 |

### Events

| Event | 参数 |
|---|---|
| `update:modelValue` | `Record<string, unknown>` |

### 示例

```vue
<script setup>
const config = ref({ dark: false, opacity: 80, mode: 'auto' })

const schema = [
  { key: 'dark', label: '深色模式', type: 'switch' },
  { key: 'opacity', label: '不透明度', type: 'slider', min: 0, max: 100 },
  {
    key: 'mode', label: '模式', type: 'segmented',
    options: [
      { value: 'auto', label: '自动' },
      { value: 'light', label: '浅色' },
      { value: 'dark', label: '深色' },
    ]
  },
]
</script>

<template>
  <AxPropPanel v-model="config" :schema="schema" title="显示设置" />
</template>
```

---

## useNotify

**用途**：封装 `vue-sonner` 的通知 hook，提供类型化的 info / success / error / secondary 通知。

**何时用**：任何需要 toast 通知的地方。**禁止手写 toast 或自己实现通知队列。**

### 返回值

| 属性 | 类型 | 说明 |
|---|---|---|
| `triggerNotify` | `(message, type?, title?) => void` | 触发通知 |
| `activeNotificationCount` | `Ref<number>` | 当前活跃通知数 |
| `notificationHistory` | `Ref<NotificationLog[]>` | 通知历史记录 |
| `clearLogs` | `() => void` | 清空历史记录 |

### 类型 `NotifyType`

`'info'` | `'success'` | `'error'` | `'secondary'`

### 示例

```vue
<script setup>
import { useNotify } from '@/components/ui'
const { triggerNotify } = useNotify()

triggerNotify('保存成功', 'success', '操作完成')
triggerNotify('网络错误，请重试', 'error', '请求失败')
</script>
```

> 需要先挂载 `<Toaster />`（见安装文档）。

---

## useFloating

**用途**：基于 `@floating-ui/vue` 的浮层定位 hook。`AxDropdown`、`AxTooltip` 内部均使用此 hook。

**何时用**：需要自定义浮层定位组件时。一般不需要直接使用。

### 参数

| 参数 | 类型 | 说明 |
|---|---|---|
| `referenceRef` | `Ref<HTMLElement \| null>` | 参考元素 |
| `floatingRef` | `Ref<HTMLElement \| null>` | 浮动元素 |
| `options` | `UseFloatingOptions` | 配置 |

### `UseFloatingOptions`

| 属性 | 类型 | 说明 |
|---|---|---|
| `placement` | `string \| Ref<string>` | 方向，默认 `'bottom-start'` |
| `offset` | `number \| Ref<number>` | 偏移（px），默认 `6` |
| `matchWidth` | `boolean \| Ref<boolean>` | 浮动元素宽度匹配参考元素 |
| `arrowRef` | `Ref<HTMLElement \| null>` | 箭头元素 ref |

### 返回值

| 属性 | 说明 |
|---|---|
| `floatingStyles` | 浮动元素定位样式（含 matchWidth） |
| `updatePosition` | 手动刷新位置 |
| `isPositioned` | 首次定位完成后为 true（防闪现） |
| `middlewareData` | arrow middleware 数据 |
| `placement` | flip 后的最终方向 |

### 特性

- `autoUpdate` 自动生命周期管理（v-if 挂载时启动，卸载时清理）
- `transform: false` 避免与 Transition scale 动画冲突
- 内置 `flip` + `shift({ padding: 5 })`

---

## useTeleportTarget / provideTeleportTarget

**用途**：管理 `AxTooltip`、`AxDropdown` 等浮层组件的 Teleport 目标。

**何时用**：仅在 WXT Content Script（Shadow DOM）场景需要手动注入 Teleport 目标。普通项目无需使用。

| 函数 | 说明 |
|---|---|
| `provideTeleportTarget(target)` | 注入 Teleport 目标元素或选择器 |
| `useTeleportTarget()` | 读取 Teleport 目标，无注入时回退 `'body'` |

详见 [WXT Content Script 接入指南](./content-script-shadow-dom.md)。

---

## FloatingBall

**用途**：可拖拽浮动球组件，点击展开设置面板。

**何时用**：需要全局快捷操作入口时（如 AI 助手触发、设置入口）。

### 导出

```ts
import { FloatingBall, useFloatingBall } from '@/components/ui'
import type { FloatingBallTheme, FloatingBallPrefs } from '@/components/ui'
```

### 使用

```vue
<FloatingBall />
```

组件自包含全部逻辑（拖拽、停靠、展开/收缩、设置面板），无需额外配置。

---

## 布局页面（参考）

`layout/` 下的文件为**演示/参考**，非组件库必要部分，可按需复制：

| 文件 | 说明 |
|---|---|
| `ConsoleLayout.vue` | 控制台布局壳 —— 侧栏导航 + 主内容区 + Toaster + 弹窗调度 |
| `ComponentsView.vue` | 组件展示页 —— 每个 `Ax*` 组件带实时属性编辑面板 |
| `SettingsView.vue` | 设置界面 —— 分组配置卡（通用/性能/安全/通知/高级） |
| `SettingsDialog.vue` | 设置弹窗 —— 封装 `AxDialog` 的完整设置面板 |
| `DemoView.vue` | 交互工坊 —— 组件联动演示 |
