import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useStorage } from '@vueuse/core'
import { useMarketStore } from './market'

export const useWatchlistStore = defineStore('watchlist', () => {
  const watchlist = useStorage<string[]>('stock-sim-watchlist', [
    '000001', '000858', '002594', '300750',
    '600519', '601318', '000333', '600036',
    '300059', '000651', '002415', '600276',
  ])

  const selectedStock = ref<string>(watchlist.value[0] || '000001')

  const marketStore = useMarketStore

  function selectStock(code: string) {
    selectedStock.value = code
  }

  function addStock(code: string) {
    if (!watchlist.value.includes(code)) {
      watchlist.value.push(code)
      // 重新订阅
      marketStore().initQuoteSubscription(watchlist.value)
    }
  }

  function removeStock(code: string) {
    watchlist.value = watchlist.value.filter((c) => c !== code)
    if (selectedStock.value === code) {
      selectedStock.value = watchlist.value[0] || ''
    }
    marketStore().initQuoteSubscription(watchlist.value)
  }

  return {
    watchlist,
    selectedStock,
    selectStock,
    addStock,
    removeStock,
  }
})
