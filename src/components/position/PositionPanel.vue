<script setup lang="ts">
import { watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTradingStore } from '@/stores/trading'
import { useMarketStore } from '@/stores/market'
import { useWatchlistStore } from '@/stores/watchlist'
import GridTable from '@/components/common/GridTable.vue'
import { html } from 'gridjs'

const trading = useTradingStore()
const marketStore = useMarketStore()
const watchlistStore = useWatchlistStore()
const { positionList } = storeToRefs(trading)

const columns = [
  { name: '证券名称', id: 'stock' },
  { name: '数量', id: 'quantity' },
  { name: '成本价', id: 'avgCost' },
  { name: '现价', id: 'currentPrice' },
  {
    name: '浮动盈亏',
    id: 'profit',
    formatter: (cell: number) =>
      html(`<span class="font-numeric ${cell >= 0 ? 'text-stock-up' : 'text-stock-down'}">${cell >= 0 ? '+' : ''}${cell.toFixed(2)}</span>`),
  },
  {
    name: '盈亏比',
    id: 'profitPercent',
    formatter: (cell: number) =>
      html(`<span class="font-numeric ${cell >= 0 ? 'text-stock-up' : 'text-stock-down'}">${cell >= 0 ? '+' : ''}${cell.toFixed(2)}%</span>`),
  },
  { name: '市值', id: 'marketValue' },
]

const rows = computed(() =>
  positionList.value.map((p) => ({
    id: p.code,
    stock: `${p.name} ${p.code}`,
    quantity: p.quantity,
    avgCost: p.avgCost.toFixed(2),
    currentPrice: p.currentPrice.toFixed(2),
    profit: p.profit,
    profitPercent: p.profitPercent,
    marketValue: p.marketValue.toFixed(2),
  })),
)

const totalMarketValue = computed(() =>
  positionList.value.reduce((sum, p) => sum + p.marketValue, 0),
)

const totalProfit = computed(() =>
  positionList.value.reduce((sum, p) => sum + p.profit, 0),
)

function onRowClick(code: string) {
  watchlistStore.selectStock(code)
}

watch(
  () => marketStore.quotes,
  (quotes) => {
    const map = new Map<string, { price: number; name: string }>()
    for (const [code, q] of quotes) {
      map.set(code, { price: q.price, name: q.name })
    }
    trading.refreshPositions(map)
  },
  { deep: true },
)
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="text-body-sm font-semibold px-2 py-1.5 border-b border-outline-variant flex items-center justify-between shrink-0">
      <span>持仓明细</span>
      <span class="text-secondary font-normal">初始资金 ¥{{ trading.account.initialCapital.toLocaleString() }}</span>
    </div>

    <div class="flex-1 overflow-auto">
      <GridTable
        v-if="rows.length > 0"
        :columns="columns"
        :rows="rows"
        :selected-id="watchlistStore.selectedStock"
        @row-click="onRowClick"
      />
      <div v-else class="px-2 py-4 text-center text-secondary text-body-sm">暂无持仓</div>
    </div>

    <!-- 持仓汇总 -->
    <div
      v-if="positionList.length > 0"
      class="shrink-0 border-t border-outline-variant bg-surface-container-low px-2 py-1 text-body-sm flex items-center gap-4"
    >
      <span class="text-secondary">总市值</span>
      <span class="font-numeric font-bold">¥{{ totalMarketValue.toFixed(2) }}</span>
      <span class="text-secondary ml-2">总盈亏</span>
      <span :class="totalProfit >= 0 ? 'text-stock-up' : 'text-stock-down'" class="font-numeric font-bold">
        {{ totalProfit >= 0 ? '+' : '' }}¥{{ totalProfit.toFixed(2) }}
      </span>
    </div>
  </div>
</template>
