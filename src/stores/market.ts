import { defineStore } from 'pinia'
import { ref, shallowRef, watch } from 'vue'
import type { StockQuote, StockInfo } from '@/types/stock'
import type { DataSourceKey } from '@/types/data-source'
import { useSettingsStore } from './settings'
import { MockDataSource } from '@/data/MockDataSource'
import { RealDataSource } from '@/data/RealDataSource'
import { cacheManager, CacheManager } from '@/data/CacheManager'

type DataSourceInstance = MockDataSource | RealDataSource

export const useMarketStore = defineStore('market', () => {
  const settings = useSettingsStore()
  const quotes = ref<Map<string, StockQuote>>(new Map())

  const sourceType = ref<DataSourceKey>(settings.dataSourceKey)
  const dataSource = shallowRef<DataSourceInstance>(createSource(settings.dataSourceKey))

  const autoRefresh = ref(true)
  let unsubscribe: (() => void) | null = null

  const simDay = ref(dataSource.value instanceof MockDataSource ? dataSource.value.simDay : 0)
  const chartTick = ref(0)

  function createSource(key: DataSourceKey): DataSourceInstance {
    return key === 'real'
      ? new RealDataSource()
      : new MockDataSource(settings.refreshInterval)
  }

  function isMock(): boolean {
    return sourceType.value === 'mock'
  }

  function toMock(): MockDataSource {
    return dataSource.value as MockDataSource
  }

  function toReal(): RealDataSource {
    return dataSource.value as RealDataSource
  }

  /** 创建订阅回调 */
  function makeSubscribeCallback() {
    return (quote: StockQuote) => {
      quotes.value.set(quote.code, quote)
      quotes.value = new Map(quotes.value)
      chartTick.value++
      // 同步 simDay（mock 和 real 都支持）
      if (dataSource.value instanceof MockDataSource) {
        simDay.value = dataSource.value.simDay
      } else {
        simDay.value = toReal().simDay
      }
    }
  }

  // 监听模拟间隔变化（仅 Mock）
  watch(
    () => settings.refreshInterval,
    (sec) => {
      if (isMock()) {
        toMock().setInterval(sec)
      }
    },
  )

  /** 初始化行情订阅 */
  async function initQuoteSubscription(codes: string[]) {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    unsubscribe = dataSource.value.subscribe(codes, makeSubscribeCallback())

    // 批量拉取初始行情
    try {
      const quoteMap = await dataSource.value.getQuotes(codes)
      for (const [code, q] of quoteMap) {
        quotes.value.set(code, q)
      }
      quotes.value = new Map(quotes.value)
    } catch (e) {
      console.warn('[MarketStore] Batch fetch quotes failed', e)
    }

    // 兜底：未被拉到的代码用占位行情
    const placeholders: StockQuote[] = []
    for (const code of codes) {
      if (!quotes.value.has(code)) {
        placeholders.push({
          code,
          name: code,
          price: 0, open: 0, high: 0, low: 0, preClose: 0,
          volume: 0, amount: 0, change: 0, changePercent: 0, time: '',
        })
      }
    }
    if (placeholders.length > 0) {
      for (const p of placeholders) quotes.value.set(p.code, p)
      quotes.value = new Map(quotes.value)
    }

    // 补充真实名称：对于 name === code 的占位行情（mock 模式动态创建的股票），
    // 先从 localStorage 缓存读取，未命中才请求后台
    const needNames = codes.filter((c) => {
      const q = quotes.value.get(c)
      return q && q.name === c
    })
    if (needNames.length > 0) {
      // 读取全局缓存
      const quoteCacheKey = CacheManager.quoteKey()
      const diskCache: Record<string, StockQuote> =
        cacheManager.get<Record<string, StockQuote>>(quoteCacheKey) ?? {}

      const stillNeed: string[] = []
      for (const code of needNames) {
        if (diskCache[code]?.name && diskCache[code].name !== code) {
          const existing = quotes.value.get(code)
          if (existing) {
            quotes.value.set(code, { ...existing, name: diskCache[code].name })
          }
        } else {
          stillNeed.push(code)
        }
      }

      if (stillNeed.length > 0) {
        const params = stillNeed
          .map((c) => {
            const market = c.startsWith('6') ? 'sh' : c.startsWith('0') || c.startsWith('3') ? 'sz' : 'sh'
            return market + c
          })
          .join(',')
        try {
          const res = await fetch(`/api/stock/quote?codes=${params}`)
          if (res.ok) {
            const realQuotes: StockQuote[] = await res.json()
            for (const rq of realQuotes) {
              const c = rq.code.replace(/^(sh|sz|bj|hk|us)/, '')
              const existing = quotes.value.get(c)
              if (existing) {
                quotes.value.set(c, { ...existing, name: rq.name, code: c })
                diskCache[c] = { ...existing, name: rq.name, code: c }
              }
            }
            cacheManager.set(quoteCacheKey, diskCache)
          }
        } catch { /* 名称补充失败不影响功能 */ }
      }
      quotes.value = new Map(quotes.value)
    }
  }

  function getQuote(code: string): StockQuote | undefined {
    return quotes.value.get(code)
  }

  async function getStockList(): Promise<StockInfo[]> {
    return dataSource.value.getStockList()
  }

  /** 切换自动刷新 */
  function toggleAutoRefresh() {
    autoRefresh.value = !autoRefresh.value
    if (autoRefresh.value) {
      if (isMock()) {
        toMock().resume(settings.refreshInterval)
      } else {
        dataSource.value.resume()
      }
    } else {
      dataSource.value.pause()
    }
  }

  /** 手动刷新：推进一天（mock 和 real 都支持） */
  function manualRefresh() {
    if (isMock()) {
      toMock().manualRefresh()
    } else {
      toReal().manualRefresh()
    }
    // simDay / chartTick 由 subscribe 回调（pushQuotes）自动更新
  }

  /** 直接跳转到指定天数（全屏模式等场景用） */
  function setSimDay(day: number) {
    if (isMock()) {
      toMock().simDay = day
    } else {
      toReal().simDay = day
    }
    simDay.value = day
    chartTick.value++
  }

  /** 重置模拟 */
  function resetSimulation(codes: string[]) {
    chartTick.value = 0
    if (isMock()) {
      const mock = toMock()
      mock.reset()
      simDay.value = mock.simDay
      if (unsubscribe) unsubscribe()
      unsubscribe = mock.subscribe(codes, makeSubscribeCallback())
      codes.forEach(async (code) => {
        const q = await mock.getQuote(code)
        quotes.value.set(code, q)
        quotes.value = new Map(quotes.value)
      })
    } else {
      const real = toReal()
      real.reset()
      simDay.value = real.simDay
      // pushQuotes 已在 reset 中调用，同步 quotes
      for (const code of codes) {
        const q = real.getQuoteSync(code)
        if (q) quotes.value.set(code, q)
      }
      quotes.value = new Map(quotes.value)
    }
  }

  /** 启动时初始化真实数据源（仅在 sourceType 为 real 时调用） */
  async function initRealMode(codes: string[]) {
    if (sourceType.value !== 'real') return
    const real = toReal()
    await real.init(codes)
    simDay.value = real.simDay
    initQuoteSubscription(codes)
    for (const code of codes) {
      const q = real.getQuoteSync(code)
      if (q) quotes.value.set(code, q)
    }
    quotes.value = new Map(quotes.value)
    if (!autoRefresh.value) dataSource.value.pause()
  }

  /** 切换数据源 */
  async function switchDataSource(key: DataSourceKey) {
    if (key === sourceType.value) return

    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    dataSource.value.destroy?.()

    sourceType.value = key
    settings.setDataSource(key)
    dataSource.value = createSource(key)

    const codes = Array.from(quotes.value.keys())

    if (key === 'real') {
      // 真实模式：初始化 K 线 + 行情缓存
      const real = toReal()
      await real.init(codes)
      simDay.value = real.simDay
      // 订阅
      initQuoteSubscription(codes)
      // 首次填充 quotes
      for (const code of codes) {
        const q = real.getQuoteSync(code)
        if (q) quotes.value.set(code, q)
      }
      quotes.value = new Map(quotes.value)
    } else {
      simDay.value = toMock().simDay
      if (codes.length > 0) {
        initQuoteSubscription(codes)
      }
    }

    if (!autoRefresh.value) {
      dataSource.value.pause()
    }
  }

  function cleanup() {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
    dataSource.value.destroy?.()
  }

  return {
    quotes,
    dataSource,
    sourceType,
    autoRefresh,
    simDay,
    chartTick,
    initQuoteSubscription,
    initRealMode,
    getQuote,
    getStockList,
    toggleAutoRefresh,
    manualRefresh,
    setSimDay,
    resetSimulation,
    switchDataSource,
    cleanup,
  }
})
