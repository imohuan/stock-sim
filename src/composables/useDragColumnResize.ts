import { reactive, ref, watch, computed } from 'vue'
import { useStorage } from '@vueuse/core'

/**
 * 自定义列宽拖拽 Hook
 * 使用像素值管理列宽 + 百分比渲染，确保表格始终 100% 填满容器
 */
export function useDragColumnResize(storageKey: string, defaultSizes: Record<string, number>) {
  const raw = useStorage<Record<string, number>>(storageKey, defaultSizes)

  // 像素值状态（持久化存储的真实值）
  const sizes = reactive<Record<string, number>>({
    ...defaultSizes,
    ...raw.value,
  })

  // 动态计算百分比（所有列比例总和 = 100%）
  const percents = computed(() => {
    const total = Object.values(sizes).reduce((sum, w) => sum + w, 0)
    if (total === 0) return {} as Record<string, number>
    const result: Record<string, number> = {}
    for (const key of Object.keys(sizes)) {
      result[key] = (sizes[key] / total) * 100
    }
    return result
  })

  // 拖拽状态
  const resizingCol = ref<string | null>(null)
  let startX = 0
  let startWidth = 0

  function handleMouseMove(e: MouseEvent) {
    const colId = resizingCol.value
    if (!colId) return
    const delta = e.clientX - startX
    sizes[colId] = Math.max(40, Math.min(600, startWidth + delta))
  }

  function handleMouseUp() {
    resizingCol.value = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  function handleMouseDown(colId: string, e: MouseEvent) {
    resizingCol.value = colId
    startX = e.clientX
    startWidth = sizes[colId]
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    e.preventDefault()
  }

  function handleDoubleClick(colId: string) {
    sizes[colId] = defaultSizes[colId]
  }

  function resetSizes() {
    Object.assign(sizes, defaultSizes)
  }

  // 持久化
  watch(
    () => ({ ...sizes }),
    () => { raw.value = { ...sizes } },
    { deep: true }
  )

  return {
    sizes,
    percents,
    resizingCol,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleDoubleClick,
    resetSizes,
  }
}
