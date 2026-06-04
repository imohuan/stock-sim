<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { useMagicKeys } from '@vueuse/core'
import { useSettingsStore } from '@/stores/settings'
import { useTradingStore } from '@/stores/trading'
import { useMarketStore } from '@/stores/market'
import { useWatchlistStore } from '@/stores/watchlist'
import { useNotify } from '@ui/hooks/useNotify'
import { CTRL_SIZE, CTRL_ROUNDED, SELECT_MIN_WIDTH, REFRESH_INTERVAL_OPTIONS } from '@/config/controls'
import { SIM_INITIAL_DAYS } from '@/config/simulation'
import type { DataSourceKey } from '@/types/data-source'
import type { KlinePeriod } from '@/types/stock'
import { AxSelect, AxButton, AxSwitch, AxInput } from '@ui'
import { cacheManager } from '@/data/CacheManager'

const settings = useSettingsStore()
const trading = useTradingStore()
const market = useMarketStore()
const watchlistStore = useWatchlistStore()
const notify = useNotify()

const dataSourceOptions = [
  { value: 'mock', label: '模拟数据' },
  { value: 'real', label: '真实行情' },
]

const periodOptions: { value: KlinePeriod; label: string }[] = [
  { value: 'daily', label: '日K' },
  { value: 'weekly', label: '周K' },
  { value: 'monthly', label: '月K' },
]

const chartModeLabel = computed(() =>
  settings.chartMode === 'kline' ? '分时' : 'K线'
)

const account = computed(() => trading.account)

const isAtStartDay = computed(() => market.simDay === SIM_INITIAL_DAYS)

const editingCapital = ref(false)
const capitalEditValue = ref('')
const capitalInputRef = ref<InstanceType<typeof AxInput> | null>(null)

function startCapitalEdit() {
  capitalEditValue.value = String(account.value.totalAssets / 10000)
  editingCapital.value = true
}

function saveCapital() {
  const v = Number(capitalEditValue.value) * 10000
  if (!isNaN(v) && v > 0) {
    trading.setInitialCapital(v)
    notify.success(`启动资金已设为 ${(v / 10000).toFixed(2)} 万`)
  }
  editingCapital.value = false
}

function onCapitalKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') saveCapital()
  if (e.key === 'Escape') editingCapital.value = false
}

const positionRatio = computed(() => {
  if (account.value.totalAssets <= 0) return 0
  return Math.round((account.value.marketValue / account.value.totalAssets) * 10000) / 100
})

function fmtMoney(v: number): string {
  if (Math.abs(v) >= 10000) return (v / 10000).toFixed(2) + '万'
  return v.toFixed(2)
}

function handleReset() {
  trading.resetAccount()
  market.resetSimulation(watchlistStore.watchlist)
  notify.success('已重置：资产及天数已恢复')
}

function handleClearCache() {
  cacheManager.clear()
  notify.success('缓存已清空，页面即将刷新')
  setTimeout(() => location.reload(), 300)
}

const { r } = useMagicKeys()
let refreshTimer: ReturnType<typeof setInterval> | null = null

watch(r, (held) => {
  if (held) {
    market.manualRefresh()
    refreshTimer = setInterval(() => market.manualRefresh(), 66)
  } else {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<template>
  <div class="w-full flex items-center gap-3 px-2">
    <span class="text-headline-sm font-bold shrink-0">A股模拟交易</span>

    <div class="flex items-center gap-1.5">
      <AxSelect
        :model-value="settings.dataSourceKey"
        :options="dataSourceOptions"
        :size="CTRL_SIZE"
        :rounded="CTRL_ROUNDED"
        :trigger-width="SELECT_MIN_WIDTH"
        @update:model-value="market.switchDataSource($event as DataSourceKey)"
      />
      <AxSelect
        :model-value="settings.klinePeriod"
        :options="periodOptions"
        :size="CTRL_SIZE"
        :rounded="CTRL_ROUNDED"
        trigger-width="80px"
        @update:model-value="settings.setKlinePeriod($event as KlinePeriod)"
      />
      <AxButton :size="CTRL_SIZE" :rounded="CTRL_ROUNDED" variant="outline" @click="settings.toggleChartMode()">
        {{ chartModeLabel }}
      </AxButton>
    </div>

    <!-- 自动刷新控制 -->
    <div class="flex items-center gap-1.5 ml-2 pl-2 border-l border-outline-variant">
      <AxSwitch
        :model-value="market.autoRefresh"
        size="sm"
        @update:model-value="market.toggleAutoRefresh()"
      />
      <span class="text-body-sm text-secondary">自动</span>
      <AxSelect
        v-if="market.autoRefresh"
        :model-value="settings.refreshInterval"
        :options="REFRESH_INTERVAL_OPTIONS"
        :size="CTRL_SIZE"
        :rounded="CTRL_ROUNDED"
        trigger-width="70px"
        @update:model-value="settings.setRefreshInterval($event as number)"
      />
      <AxButton
        v-if="!market.autoRefresh"
        :size="CTRL_SIZE"
        :rounded="CTRL_ROUNDED"
        variant="outline"
        icon="refresh"
        icon-size="14px"
        @click="market.manualRefresh()"
      >
        刷新
      </AxButton>
    </div>

    <div class="flex-1" />

    <div class="flex items-center gap-4 text-body-sm">
      <div class="flex items-center gap-1.5">
        <span class="text-secondary">总资产</span>
        <template v-if="isAtStartDay && editingCapital">
          <div class="flex items-center gap-1">
            <span class="font-numeric text-secondary font-bold">¥</span>
            <AxInput
              ref="capitalInputRef"
              v-model="capitalEditValue"
              type="number"
              size="xs"
              rounded="sm"
              class="!w-[90px]"
              placeholder="10"
              step="0.1"
              min="0"
              @keydown="onCapitalKeydown"
              @blur="saveCapital"
            />
            <span class="text-secondary font-numeric text-sm">万</span>
          </div>
        </template>
        <template v-else>
          <span
            :class="isAtStartDay ? 'cursor-pointer text-primary hover:underline' : ''"
            class="font-numeric font-bold"
            @click="isAtStartDay && startCapitalEdit()"
          >
            ¥{{ fmtMoney(account.totalAssets) }}
          </span>
        </template>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-secondary">参考市值</span>
        <span class="font-numeric font-bold">¥{{ fmtMoney(account.marketValue) }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-secondary">盈亏</span>
        <span
          :class="account.totalProfit >= 0 ? 'text-stock-up' : 'text-stock-down'"
          class="font-numeric font-bold"
        >
          {{ account.totalProfit >= 0 ? '+' : '' }}¥{{ fmtMoney(account.totalProfit) }}
        </span>
        <span
          :class="account.totalProfitPercent >= 0 ? 'text-stock-up' : 'text-stock-down'"
          class="font-numeric font-bold"
        >
          ({{ account.totalProfitPercent >= 0 ? '+' : '' }}{{ account.totalProfitPercent.toFixed(2) }}%)
        </span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-secondary">持仓比例</span>
        <span class="font-numeric font-bold">{{ positionRatio.toFixed(2) }}%</span>
      </div>
      <div class="flex items-center gap-1 pl-3 border-l border-outline-variant">
        <span class="text-secondary">第</span>
        <span class="font-numeric font-bold text-primary">{{ market.simDay }}</span>
        <span class="text-secondary">天</span>
      </div>
      <AxButton
        :size="CTRL_SIZE"
        :rounded="CTRL_ROUNDED"
        @click="handleReset"
      >
        重置
      </AxButton>
      <AxButton
        :size="CTRL_SIZE"
        :rounded="CTRL_ROUNDED"
        icon="delete"
        icon-size="14px"
        @click="handleClearCache"
      >
        清缓存
      </AxButton>
    </div>
  </div>
</template>
