import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import type { DataSourceKey } from '@/types/data-source'
import type { KlinePeriod } from '@/types/stock'
import { DEFAULT_REFRESH_INTERVAL } from '@/config/controls'

export const useSettingsStore = defineStore('settings', () => {
  const dataSourceKey = useStorage<DataSourceKey>('stock-sim-data-source', 'mock')
  const klinePeriod = ref<KlinePeriod>('daily')
  const chartMode = ref<'kline' | 'minute'>('kline')
  const refreshInterval = useStorage('stock-sim-refresh-interval', DEFAULT_REFRESH_INTERVAL)

  function setDataSource(key: DataSourceKey) {
    dataSourceKey.value = key
  }

  function setKlinePeriod(period: KlinePeriod) {
    klinePeriod.value = period
  }

  function toggleChartMode() {
    chartMode.value = chartMode.value === 'kline' ? 'minute' : 'kline'
  }

  function setRefreshInterval(seconds: number) {
    refreshInterval.value = seconds
  }

  return {
    dataSourceKey,
    klinePeriod,
    chartMode,
    refreshInterval,
    setDataSource,
    setKlinePeriod,
    toggleChartMode,
    setRefreshInterval,
  }
})
