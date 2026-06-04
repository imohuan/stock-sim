<script setup lang="ts">
import { ref, inject } from 'vue'
import type { Ref } from 'vue'

const isFullscreen = inject<Ref<boolean>>('isChartFullscreen', ref(false))

const toolbarH = ref(48)
const leftW = ref(280)
const rightW = ref(320)
const bottomH = ref(200)
const bottomLeftW = ref(600)
const rightTopH = ref(220)

const dragging = ref('')

function startDrag(key: string, e: PointerEvent) {
  dragging.value = key
  const isY = key === 'toolbar' || key === 'bottom' || key === 'rightPanel'
  document.body.style.cursor = isY ? 'row-resize' : 'col-resize'
  document.body.style.userSelect = 'none'

  const startCoord = isY ? e.clientY : e.clientX
  const refs: Record<string, ReturnType<typeof ref<number>>> = {
    toolbar: toolbarH,
    left: leftW,
    right: rightW,
    bottom: bottomH,
    bottomLeft: bottomLeftW,
    rightPanel: rightTopH,
  }
  const refObj = refs[key]
  if (!refObj) return
  const startSize = refObj.value as number

  const limits: Record<string, [number, number]> = {
    toolbar: [40, 80],
    left: [150, 450],
    right: [220, 600],
    bottom: [100, 500],
    bottomLeft: [100, 650],
    rightPanel: [80, 500],
  }

  const limit = limits[key]
  if (!limit) return

  const onMove = (e: PointerEvent) => {
    const delta = e[isY ? 'clientY' : 'clientX'] - startCoord
    // bottom / right 面板的尺寸随拖拽反向变化
    const sign = key === 'bottom' || key === 'right' ? -1 : 1
    refObj.value = Math.max(limit[0], Math.min(startSize + delta * sign, limit[1]))
  }

  const onUp = () => {
    dragging.value = ''
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
  }

  document.addEventListener('pointermove', onMove)
  document.addEventListener('pointerup', onUp)
}
</script>

<template>
  <div class="flex flex-col h-full bg-outline-variant relative">
    <!-- 工具栏 -->
    <div
      class="flex-shrink-0 bg-surface-container-lowest flex items-center px-3 border-b border-outline-variant overflow-hidden"
      :class="{ hidden: isFullscreen }"
      :style="{ height: toolbarH + 'px' }"
    >
      <slot name="toolbar" />
    </div>

    <!-- 主体 -->
    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- 左侧 -->
      <div
        class="flex-shrink-0 bg-surface-container-lowest overflow-hidden border-r border-outline-variant"
        :class="{ hidden: isFullscreen }"
        :style="{ width: leftW + 'px' }"
      >
        <slot name="left" />
      </div>

      <!-- 中间 -->
      <div class="flex-1 min-w-0 bg-surface-container-lowest overflow-hidden">
        <slot name="center" />
      </div>

      <!-- 右侧 -->
      <div
        class="flex-shrink-0 bg-surface-container-lowest overflow-hidden border-l border-outline-variant flex flex-col"
        :class="{ hidden: isFullscreen }"
        :style="{ width: rightW + 'px' }"
      >
        <div
          class="flex-shrink-0 overflow-hidden border-b border-outline-variant"
          :style="{ height: rightTopH + 'px' }"
        >
          <slot name="right-top" />
        </div>
        <div class="flex-1 overflow-hidden">
          <slot name="right-bottom" />
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div
      class="flex-shrink-0 bg-surface-container-lowest overflow-hidden border-t border-outline-variant flex"
      :class="{ hidden: isFullscreen }"
      :style="{ height: bottomH + 'px' }"
    >
      <div
        class="overflow-hidden border-r border-outline-variant"
        :style="{ width: bottomLeftW + 'px' }"
      >
        <slot name="bottom-left" />
      </div>
      <div class="flex-1 overflow-hidden">
        <slot name="bottom-right" />
      </div>
    </div>

    <!-- 分割线 -->
    <!-- 工具栏下 -->
    <div
      class="splitter splitter-h"
      :class="{ hidden: isFullscreen, active: dragging === 'toolbar' }"
      :style="{ top: toolbarH + 'px' }"
      @pointerdown.prevent="e => startDrag('toolbar', e)"
    />
    <!-- 左侧右 -->
    <div
      class="splitter splitter-v"
      :style="{ left: leftW + 'px', top: toolbarH + 'px', bottom: bottomH + 'px' }"
      :class="{ hidden: isFullscreen, active: dragging === 'left' }"
      @pointerdown.prevent="e => startDrag('left', e)"
    />
    <!-- 右侧左 -->
    <div
      class="splitter splitter-v"
      :style="{ left: `calc(100% - ${rightW}px)`, top: toolbarH + 'px', bottom: bottomH + 'px' }"
      :class="{ hidden: isFullscreen, active: dragging === 'right' }"
      @pointerdown.prevent="e => startDrag('right', e)"
    />
    <!-- 底部上 -->
    <div
      class="splitter splitter-h"
      :style="{ top: `calc(100% - ${bottomH}px)` }"
      :class="{ hidden: isFullscreen, active: dragging === 'bottom' }"
      @pointerdown.prevent="e => startDrag('bottom', e)"
    />
    <!-- 底部左侧右 -->
    <div
      class="splitter splitter-v"
      :style="{ left: bottomLeftW + 'px', top: `calc(100% - ${bottomH}px)`, bottom: '0' }"
      :class="{ hidden: isFullscreen, active: dragging === 'bottomLeft' }"
      @pointerdown.prevent="e => startDrag('bottomLeft', e)"
    />
    <!-- 右侧面板内部上下分割（盘口 / 交易） -->
    <div
      class="splitter splitter-h"
      :style="{
        left: `calc(100% - ${rightW}px)`,
        width: rightW + 'px',
        right: 'auto',
        top: `calc(${toolbarH}px + ${rightTopH}px)`,
      }"
      :class="{ hidden: isFullscreen, active: dragging === 'rightPanel' }"
      @pointerdown.prevent="e => startDrag('rightPanel', e)"
    />
  </div>
</template>

<style scoped>
.splitter {
  position: absolute;
  z-index: 100;
  background: var(--color-outline-variant, #c8c5ca);
  transition: background-color 0.15s ease;
}
.splitter:hover,
.splitter.active {
  background: var(--color-primary, #000);
}

.splitter-h {
  height: 2px;
  cursor: row-resize;
  left: 0;
  right: 0;
}
.splitter-v {
  width: 2px;
  cursor: col-resize;
}
</style>
