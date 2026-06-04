<script setup lang="ts">
import { onMounted } from 'vue'
import { Toaster } from 'vue-sonner'
import TradePage from '@/pages/TradePage.vue'
import { useMarketStore } from '@/stores/market'
import { useWatchlistStore } from '@/stores/watchlist'

onMounted(async () => {
  const market = useMarketStore()
  if (market.sourceType === 'real') {
    const watchlist = useWatchlistStore()
    await market.initRealMode([...watchlist.watchlist])
  }
})
</script>

<template>
  <div class="h-screen w-screen bg-background text-on-background overflow-hidden flex flex-col">
    <Toaster position="top-center" rich-colors close-button />
    <TradePage />
  </div>
</template>
