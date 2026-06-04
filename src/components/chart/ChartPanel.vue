<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue'
import type { Ref } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import { useWatchlistStore } from '@/stores/watchlist'
import { useMarketStore } from '@/stores/market'
import { useSettingsStore } from '@/stores/settings'
import { FETCH_KLINES_LIMIT, MOCK_HISTORY_DAYS } from '@/config/simulation'
import KlineChart from './KlineChart.vue'
import MinuteChart from './MinuteChart.vue'
import type { KlineData, MinutePoint } from '@/types/stock'
import { AxButton } from '@ui'
import { CTRL_SIZE, CTRL_ROUNDED } from '@/config/controls'

const watchlistStore = useWatchlistStore()
const marketStore = useMarketStore()
const settings = useSettingsStore()

const isFullscreen = inject<Ref<boolean>>('isChartFullscreen', ref(false))

// 快捷键 F 切换全屏
const { f } = useMagicKeys()
watch(f, (held) => {
  if (held) isFullscreen.value = !isFullscreen.value
})

// 全屏切换：保存/恢复天数，全屏时展示全部2000天
let savedSimDay = marketStore.simDay
watch(isFullscreen, (val) => {
  if (val) {
    savedSimDay = marketStore.simDay
    marketStore.setSimDay(MOCK_HISTORY_DAYS)
  } else {
    marketStore.setSimDay(savedSimDay)
  }
})

const klineData = ref<KlineData[]>([])
const minuteData = ref<MinutePoint[]>([])
const loading = ref(false)
const loadError = ref('')

const selectedQuote = computed(() =>
  marketStore.getQuote(watchlistStore.selectedStock),
)

async function loadData() {
  const code = watchlistStore.selectedStock
  if (!code) return
  const ds = marketStore.dataSource

  loading.value = true
  loadError.value = ''

  try {
    if (settings.chartMode === 'kline') {
      klineData.value = await ds.getKline(code, settings.klinePeriod, FETCH_KLINES_LIMIT)
    } else {
      minuteData.value = await ds.getMinuteLine(code)
    }
  } catch (e: any) {
    loadError.value = e.message || '数据加载失败'
    klineData.value = []
    minuteData.value = []
  } finally {
    loading.value = false
  }
}

// 切换股票 / 周期 / 图表模式 → 重新加载
watch(
  [
    () => watchlistStore.selectedStock,
    () => settings.chartMode,
    () => settings.klinePeriod,
    () => marketStore.simDay,
    () => marketStore.chartTick,
  ],
  () => loadData(),
  { immediate: true },
)
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 股票头部信息 -->
    <div class="flex items-center gap-3 px-3 py-1.5 border-b border-outline-variant" v-if="selectedQuote">
      <span class="text-headline-sm font-bold">{{ selectedQuote.name }}</span>
      <span class="text-secondary text-body-sm">{{ selectedQuote.code }}</span>
      <div class="flex items-center gap-2 ml-2">
        <span
          :class="selectedQuote.change >= 0 ? 'text-stock-up' : 'text-stock-down'"
          class="text-headline-sm font-bold font-numeric"
        >
          {{ selectedQuote.price.toFixed(2) }}
        </span>
        <span
          :class="selectedQuote.change >= 0 ? 'text-stock-up' : 'text-stock-down'"
          class="text-body-sm font-numeric"
        >
          {{ selectedQuote.change >= 0 ? '+' : '' }}{{ selectedQuote.change.toFixed(2) }}
        </span>
        <span
          :class="selectedQuote.changePercent >= 0 ? 'text-stock-up' : 'text-stock-down'"
          class="text-body-sm font-numeric"
        >
          {{ selectedQuote.changePercent >= 0 ? '+' : '' }}{{ selectedQuote.changePercent.toFixed(2) }}%
        </span>
      </div>
      <div class="flex-1" />
      <div class="text-body-sm text-secondary flex gap-3">
        <span>高 {{ selectedQuote.high.toFixed(2) }}</span>
        <span>低 {{ selectedQuote.low.toFixed(2) }}</span>
        <span>开 {{ selectedQuote.open.toFixed(2) }}</span>
        <span>昨收 {{ selectedQuote.preClose.toFixed(2) }}</span>
        <span>量 {{ (selectedQuote.volume / 10000).toFixed(1) }}万手</span>
      </div>
      <AxButton
        :size="CTRL_SIZE"
        :rounded="CTRL_ROUNDED"
        variant="ghost"
        :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
        icon-size="16px"
        @click="isFullscreen = !isFullscreen"
      />
    </div>

    <!-- 图表区域 -->
    <div class="flex-1 min-h-0 relative">
      <!-- 加载指示器 -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-surface/60 z-10"
      >
        <div class="flex flex-col items-center gap-2">
          <div class="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          <span class="text-body-sm text-secondary">加载K线数据...</span>
        </div>
      </div>

      <!-- 错误提示 -->
      <div
        v-else-if="loadError"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="flex flex-col items-center gap-2 text-secondary">
          <span class="material-symbols text-2xl">error</span>
          <span class="text-body-sm">{{ loadError }}</span>
        </div>
      </div>

      <!-- 图表 -->
      <KlineChart
        v-if="settings.chartMode === 'kline'"
        :data="klineData"
        :stock-name="selectedQuote?.name"
        :key="watchlistStore.selectedStock + '-' + settings.klinePeriod"
      />
      <MinuteChart
        v-else
        :data="minuteData"
        :pre-close="selectedQuote?.preClose ?? 0"
        :stock-name="selectedQuote?.name"
      />
    </div>
  </div>
</template>
