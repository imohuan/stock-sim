<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWatchlistStore } from '@/stores/watchlist'
import { useMarketStore } from '@/stores/market'
import type { DepthData } from '@/types/stock'

const watchlistStore = useWatchlistStore()
const marketStore = useMarketStore()

const depth = ref<DepthData | null>(null)

async function loadDepth() {
  const code = watchlistStore.selectedStock
  if (!code) return
  try {
    depth.value = await marketStore.dataSource.getDepth(code)
  } catch {
    // 盘口数据加载失败静默处理
  }
}

// 切换股票时立即刷新
watch(
  () => watchlistStore.selectedStock,
  () => loadDepth(),
  { immediate: true },
)

// 行情更新（手动刷新/自动刷新）时同步刷新盘口
watch(
  () => marketStore.chartTick,
  () => {
    if (!watchlistStore.selectedStock) return
    loadDepth()
  },
)
</script>

<template>
  <div class="h-full flex flex-col" v-if="depth">
    <div class="text-body-sm font-semibold px-2 py-1.5 border-b border-outline-variant">盘口</div>
    <div class="flex-1 overflow-y-auto">
      <table class="w-full text-body-sm">
        <thead>
          <tr class="text-secondary text-body-sm border-b border-outline-variant">
            <th class="text-left pl-2 py-0.5 font-normal">卖</th>
            <th class="text-right font-normal">价格</th>
            <th class="text-right pr-2 font-normal">手数</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(ask, i) in [...depth.asks].reverse()"
            :key="'ask' + i"
            class="border-b border-outline-variant/50 hover:bg-surface-container-low"
          >
            <td class="pl-2 py-0.5 text-stock-down">卖{{ 5 - i }}</td>
            <td class="text-right text-stock-down font-numeric">{{ ask.price.toFixed(2) }}</td>
            <td class="text-right pr-2 font-numeric text-secondary">{{ ask.volume }}</td>
          </tr>
        </tbody>

        <tbody>
          <tr class="border-y border-outline-variant bg-surface-container-low">
            <td colspan="3" class="pl-2 py-1 text-xs text-secondary">最新价</td>
          </tr>
        </tbody>

        <tbody>
          <tr
            v-for="(bid, i) in depth.bids"
            :key="'bid' + i"
            class="border-b border-outline-variant/50 hover:bg-surface-container-low"
          >
            <td class="pl-2 py-0.5 text-stock-up">买{{ i + 1 }}</td>
            <td class="text-right text-stock-up font-numeric">{{ bid.price.toFixed(2) }}</td>
            <td class="text-right pr-2 font-numeric text-secondary">{{ bid.volume }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
