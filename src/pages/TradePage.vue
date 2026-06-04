<script setup lang="ts">
import { onMounted, onUnmounted, ref, provide } from 'vue'
import TradeLayout from '@/components/layout/TradeLayout.vue'
import Toolbar from '@/components/common/Toolbar.vue'
import WatchlistPanel from '@/components/watchlist/WatchlistPanel.vue'
import ChartPanel from '@/components/chart/ChartPanel.vue'
import DepthPanel from '@/components/order/DepthPanel.vue'
import OrderPanel from '@/components/order/OrderPanel.vue'
import PositionPanel from '@/components/position/PositionPanel.vue'
import TradeLogPanel from '@/components/trade-log/TradeLogPanel.vue'
import { useWatchlistStore } from '@/stores/watchlist'
import { useMarketStore } from '@/stores/market'

const watchlistStore = useWatchlistStore()
const marketStore = useMarketStore()

const isChartFullscreen = ref(false)
provide('isChartFullscreen', isChartFullscreen)

onMounted(() => {
  marketStore.initQuoteSubscription(watchlistStore.watchlist)
})

onUnmounted(() => {
  marketStore.cleanup()
})
</script>

<template>
  <TradeLayout>
    <template #toolbar>
      <Toolbar />
    </template>
    <template #left>
      <WatchlistPanel v-if="!isChartFullscreen" />
    </template>
    <template #center>
      <ChartPanel />
    </template>
    <template #right-top>
      <DepthPanel v-if="!isChartFullscreen" />
    </template>
    <template #right-bottom>
      <OrderPanel v-if="!isChartFullscreen" />
    </template>
    <template #bottom-left>
      <PositionPanel v-if="!isChartFullscreen" />
    </template>
    <template #bottom-right>
      <TradeLogPanel v-if="!isChartFullscreen" />
    </template>
  </TradeLayout>
</template>
