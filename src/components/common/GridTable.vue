<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { Grid } from 'gridjs'
import 'gridjs/dist/theme/mermaid.css'

interface Props {
  columns: any[]
  rows: any[]
  resizable?: boolean
  selectedId?: string
}

const props = withDefaults(defineProps<Props>(), {
  resizable: true,
})

const emit = defineEmits<{
  rowClick: [id: string]
}>()

const containerRef = ref<HTMLDivElement>()
let grid: Grid | null = null

function applyHighlight() {
  if (!containerRef.value || !props.selectedId) return
  const tbody = containerRef.value.querySelector('.gridjs-tbody')
  if (!tbody) return
  const trs = tbody.querySelectorAll('.gridjs-tr')
  trs.forEach((tr, idx) => {
    const row = props.rows[idx]
    if (row && row.id === props.selectedId) {
      tr.classList.add('gridjs-row-selected')
    } else {
      tr.classList.remove('gridjs-row-selected')
    }
  })
}

function initGrid() {
  if (!containerRef.value) return
  grid = new Grid({
    columns: props.columns,
    data: props.rows,
    resizable: props.resizable,
    sort: false,
    search: false,
    pagination: false,
    autoWidth: true,
    className: {
      tr: 'cursor-pointer',
    },
  })
  grid.on('rowClick', (e) => {
    const tr = (e.target as HTMLElement).closest('.gridjs-tr')
    if (!tr) return
    const tbody = tr.closest('.gridjs-tbody')
    if (!tbody) return
    const trs = tbody.querySelectorAll('.gridjs-tr')
    const index = Array.from(trs).indexOf(tr)
    const row = props.rows[index]
    if (!row) return

    // 先移除所有高亮，再给当前行添加
    trs.forEach((r) => r.classList.remove('gridjs-row-selected'))
    tr.classList.add('gridjs-row-selected')

    emit('rowClick', String(row.id))
  })
  grid.render(containerRef.value)

  nextTick(applyHighlight)
}

function updateGrid() {
  if (!grid) return
  grid.updateConfig({
    columns: props.columns,
    data: props.rows,
  }).forceRender()

  nextTick(applyHighlight)
}

onMounted(initGrid)
onUnmounted(() => {
  grid?.destroy()
})

watch(() => [props.columns, props.rows], updateGrid, { deep: true })
watch(() => props.selectedId, applyHighlight)
</script>

<template>
  <div ref="containerRef" class="gridjs-compact" />
</template>

<style>
/* 覆盖 gridjs 默认样式，让表格更紧凑 */
.gridjs-compact .gridjs-th,
.gridjs-compact .gridjs-td {
  padding: 3px 6px !important;
  font-size: 11px !important;
}
.gridjs-compact .gridjs-wrapper {
  overflow: visible;
}
.gridjs-compact .gridjs-container {
  overflow: visible;
}

/* 选中行高亮 — 灰色背景（同时作用于 tr 和 td，覆盖 gridjs 默认白色） */
.gridjs-row-selected,
.gridjs-row-selected .gridjs-td {
  background-color: var(--color-surface-container-high, #e5e7eb) !important;
}
</style>
