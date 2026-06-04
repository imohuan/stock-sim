import { useStorage } from '@vueuse/core'
import { computed } from 'vue'

/**
 * Shared composable for table column sizing with localStorage persistence.
 * Returns a reactive columnSizing ref that syncs with localStorage.
 * Guards against corrupted localStorage values (null, non-object).
 *
 * Usage: const { columnSizing } = useColumnSizing('my-table', { name: 150, price: 80 })
 */
export function useColumnSizing(
  storageKey: string,
  defaultSizes: Record<string, number>
) {
  const raw = useStorage<Record<string, number> | null>(storageKey, defaultSizes)

  // 防御 localStorage 损坏数据（null、非对象等）
  const columnSizing = computed({
    get(): Record<string, number> {
      const v = raw.value
      if (!v || typeof v !== 'object' || Array.isArray(v)) {
        return { ...defaultSizes }
      }
      // 合并缺失的默认 key
      return { ...defaultSizes, ...v }
    },
    set(v: Record<string, number>) {
      raw.value = v
    },
  })

  function resetSizes() {
    columnSizing.value = { ...defaultSizes }
  }

  return { columnSizing, resetSizes }
}
