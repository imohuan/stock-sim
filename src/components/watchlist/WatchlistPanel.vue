<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useWatchlistStore } from '@/stores/watchlist'
import { useMarketStore } from '@/stores/market'
import StockRow from './StockRow.vue'
import type { StockInfo } from '@/types/stock'
import { AxSelect } from '@ui'
import { CTRL_SIZE, CTRL_ROUNDED } from '@/config/controls'

const watchlistStore = useWatchlistStore()
const marketStore = useMarketStore()

const addStockCode = ref('')
const allStocks = ref<StockInfo[]>([])

const sortedWatchlist = computed(() => {
  const codes = watchlistStore.watchlist
  return codes
    .map((code) => marketStore.getQuote(code))
    .filter(Boolean)
    .sort((a, b) => {
      if (!a || !b) return 0
      return b.changePercent - a.changePercent
    })
})

const stockOptions = computed(() => {
  if (!allStocks.value.length) return []
  return allStocks.value
    .filter((s) => !watchlistStore.watchlist.includes(s.code))
    .map((s) => ({ value: s.code, label: `${s.name} (${s.code})` }))
})

// 选中股票后自动添加，然后重置
watch(addStockCode, (code) => {
  console.log('[WatchlistPanel watch] addStockCode changed:', code)
  if (code) {
    console.log('[WatchlistPanel watch] calling watchlistStore.addStock:', code)
    watchlistStore.addStock(code as string)
    addStockCode.value = ''
  }
})

onMounted(async () => {
  allStocks.value = await marketStore.getStockList()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 标题栏 -->
    <div class="flex items-center gap-2 px-2 py-1.5 border-b border-outline-variant">
      <span class="text-headline-sm font-semibold shrink-0">自选股</span>
      <div class="flex-1 flex items-center justify-end">
        <AxSelect v-model="addStockCode" :options="stockOptions" placeholder="添加股票..." searchable allow-create :size="CTRL_SIZE"
          :rounded="CTRL_ROUNDED" class="w-full max-w-[120px] min-w-0" />
      </div>
    </div>

    <!-- 列表 -->
    <div class="flex-1 overflow-y-auto">
      <StockRow v-for="quote in sortedWatchlist" :key="quote?.code" :quote="quote!"
        :selected="watchlistStore.selectedStock === quote!.code" @click="watchlistStore.selectStock($event)"
        @remove="watchlistStore.removeStock($event)" />
      <div v-if="sortedWatchlist.length === 0" class="px-2 py-4 text-center text-secondary text-body-sm">
        暂无自选股
      </div>
    </div>
  </div>
</template>
