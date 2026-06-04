/**
 * 真实数据源 — 模拟回放模式
 *
 * 与 MockDataSource 接口对齐，但数据来自真实 K 线：
 *   1. 启动时只批量拉取行情（quote），不拉 K 线
 *   2. 选中股票时才拉该股的 K 线，缓存到 CacheManager + 内存（每天 0 点过期）
 *   3. 默认展示前 x 根 K 线
 *   4. manualRefresh() 推进 1 天，所有已缓存 K 线的股票同步更新行情
 *   5. reset() 回到第 x 天
 */
import type { DataSourceAdapter } from '../types/data-source'
import type { StockInfo, StockQuote, KlineData, KlinePeriod, MinutePoint, DepthData } from '../types/stock'
import { STOCK_LIST } from './stock-list'
import { cacheManager, CacheManager } from './CacheManager'
import { aggregateKline } from './klineAggregator'

const API_BASE = '/api/stock'
// 以下从统一配置引入：SIM_INITIAL_DAYS, CLI_MAX_KLINES, FETCH_KLINES_LIMIT
import { SIM_INITIAL_DAYS, FETCH_KLINES_LIMIT } from '@/config/simulation'

function toWestockCode(info: StockInfo): string {
  return `${info.market}${info.code}`
}

function findInfo(code: string): StockInfo | undefined {
  return STOCK_LIST.find((s) => s.code === code)
}

function fromWestockCode(fc: string): string {
  return fc.replace(/^(sh|sz|bj|hk|us)/, '')
}

export class RealDataSource implements DataSourceAdapter {
  name = '真实行情'

  simDay = SIM_INITIAL_DAYS
  private _paused = false
  private subscribers = new Map<string, Set<(quote: StockQuote) => void>>()

  /** K 线内存缓存：code → KlineData[] */
  private klineStore = new Map<string, KlineData[]>()
  /** 行情内存缓存：code → StockQuote */
  private quoteStore = new Map<string, StockQuote>()
  /** 当前关注的股票列表 */
  private watchlist: string[] = []

  // ---- 初始化 ----

  /** 初始化：按单只股票逐条缓存，只拉取未缓存的股票 */
  async init(codes: string[]): Promise<void> {
    this.watchlist = [...codes]

    const cacheKey = CacheManager.quoteKey()
    // 读取全局 quotes 缓存对象：{ code: StockQuote, ... }
    const cachedQuotes: Record<string, StockQuote> = cacheManager.get<Record<string, StockQuote>>(cacheKey) ?? {}

    // 区分已缓存和未缓存的股票
    const uncachedCodes: string[] = []
    for (const code of codes) {
      if (cachedQuotes[code]) {
        this.quoteStore.set(code, cachedQuotes[code])
      } else {
        uncachedCodes.push(code)
      }
    }

    // 只拉取未缓存的股票
    if (uncachedCodes.length > 0) {
      const fullCodes = uncachedCodes
        .map((c) => {
          const info = findInfo(c) ?? {
            code: c,
            name: c,
            market: (c.startsWith('6') ? 'sh' : c.startsWith('0') || c.startsWith('3') ? 'sz' : 'sh') as 'sh' | 'sz',
            industry: '未知',
            basePrice: 0,
          }
          return toWestockCode(info)
        })
        .join(',')

      if (!fullCodes) return  // 全部是未知代码，跳过请求
      try {
        const res = await fetch(`${API_BASE}/quote?codes=${fullCodes}`)
        if (res.ok) {
          const newQuotes: StockQuote[] = await res.json()
          for (const q of newQuotes) {
            const c = fromWestockCode(q.code)
            const quote = { ...q, code: c }
            this.quoteStore.set(c, quote)
            cachedQuotes[c] = quote
          }
        }
      } catch { /* fallback */ }
    }

    // 写回全局缓存对象
    if (uncachedCodes.length > 0) {
      cacheManager.set(cacheKey, cachedQuotes)
    }
  }

  // ---- 模拟控制 ----

  get paused(): boolean { return this._paused }
  pause() { this._paused = true }
  resume(_intervalSec?: number) { this._paused = false }
  setInterval(_seconds: number) {}

  manualRefresh() {
    const maxDays = this.maxKlineDays()
    if (this.simDay < maxDays) {
      this.simDay++
      this.pushQuotes()
    }
  }

  reset() {
    // 重置时根据实际 K 线数量 clamp simDay，避免超出数据范围导致刷新卡死
    this.simDay = Math.min(SIM_INITIAL_DAYS, this.maxKlineDays())
    this.pushQuotes()
  }

  destroy() {
    this.subscribers.clear()
    this.klineStore.clear()
    this.quoteStore.clear()
  }

  /** 计算当前所有已缓存 K 线的最大天数 */
  private maxKlineDays(): number {
    let max = 0
    for (const k of this.klineStore.values()) {
      if (k.length > max) max = k.length
    }
    return max
  }

  /** 刷新所有订阅者的行情（价格 = 当前 simDay 对应的日 K 线 close） */
  private pushQuotes() {
    const dayIdx = this.simDay - 1
    for (const code of this.watchlist) {
      const klines = this.klineStore.get(this.klineStoreKey(code, 'daily'))
      const prevQuote = this.quoteStore.get(code)
      if (!klines || klines.length === 0) continue
      const k = klines[Math.min(dayIdx, klines.length - 1)]
      const prevK = dayIdx > 0 ? klines[dayIdx - 1] : null
      const preClose = prevK ? prevK.close : (prevQuote?.preClose ?? k.close)
      const price = k.close
      const quote: StockQuote = {
        code,
        name: prevQuote?.name ?? '',
        price,
        open: k.open,
        high: k.high,
        low: k.low,
        preClose,
        volume: k.volume,
        amount: 0,
        change: +(price - preClose).toFixed(2),
        changePercent: +((price - preClose) / preClose * 100).toFixed(2),
        time: k.time,
      }
      this.quoteStore.set(code, quote)
      const subs = this.subscribers.get(code)
      if (subs) for (const cb of subs) cb(quote)
    }
  }

  /** 同步获取已缓存的行情 */
  getQuoteSync(code: string): StockQuote | null {
    return this.quoteStore.get(code) ?? null
  }

  // ---- DataSourceAdapter ----

  async getStockList(): Promise<StockInfo[]> {
    return STOCK_LIST
  }

  async getQuote(code: string): Promise<StockQuote> {
    const cached = this.quoteStore.get(code)
    if (cached) return cached
    const result = await this.getQuotes([code])
    const q = result.get(code)
    if (!q) throw new Error(`No quote for ${code}`)
    return q
  }

  async getQuotes(codes: string[]): Promise<Map<string, StockQuote>> {
    const result = new Map<string, StockQuote>()

    // 1) 先从内存缓存取
    const uncached: string[] = []
    for (const code of codes) {
      const cached = this.quoteStore.get(code)
      if (cached) {
        result.set(code, cached)
      } else {
        uncached.push(code)
      }
    }

    if (uncached.length === 0) return result

    // 2) 再从 localStorage 缓存取
    const cacheKey = CacheManager.quoteKey()
    const diskCache: Record<string, StockQuote> = cacheManager.get<Record<string, StockQuote>>(cacheKey) ?? {}
    const needFetch: string[] = []
    for (const code of uncached) {
      if (diskCache[code]) {
        this.quoteStore.set(code, diskCache[code])
        result.set(code, diskCache[code])
      } else {
        needFetch.push(code)
      }
    }

    if (needFetch.length === 0) return result

    // 3) 仅对未缓存的代码批量请求
    const fullCodes = needFetch
      .map((c) => {
        const info = findInfo(c) ?? {
          code: c,
          name: c,
          market: (c.startsWith('6') ? 'sh' : c.startsWith('0') || c.startsWith('3') ? 'sz' : 'sh') as 'sh' | 'sz',
          industry: '未知',
          basePrice: 0,
        }
        return toWestockCode(info)
      })
      .join(',')

    try {
      const res = await fetch(`${API_BASE}/quote?codes=${fullCodes}`)
      if (res.ok) {
        const quotes: StockQuote[] = await res.json()
        for (const q of quotes) {
          const c = fromWestockCode(q.code)
          const quote = { ...q, code: c }
          this.quoteStore.set(c, quote)
          result.set(c, quote)
          diskCache[c] = quote
        }
        // 写回 localStorage 缓存
        cacheManager.set(cacheKey, diskCache)
      }
    } catch { /* 网络错误 */ }

    return result
  }

  /** K 线内存缓存 key */
  private klineStoreKey(code: string, period: KlinePeriod): string {
    return `${code}:${period}`
  }

  /** 获取 K 线：日K 按需拉取，周/月K 从日K 聚合计算，按 simDay 截取实现渐进式展示 */
  async getKline(code: string, period: KlinePeriod = 'daily', count = FETCH_KLINES_LIMIT): Promise<KlineData[]> {
    // 先获取日 K
    const daily = await this.fetchDailyKline(code, count)
    // 截取到当前 simDay（与 MockDataSource 行为一致，实现刷新时渐进添加数据）
    const visible = daily.slice(0, Math.min(this.simDay, daily.length))
    // 周/月K 由日K 聚合
    const aggregated = aggregateKline(visible, period)
    return aggregated.slice(-count)
  }

  /** 加载日 K 线（内存 → localStorage → API） */
  private async fetchDailyKline(code: string, count: number): Promise<KlineData[]> {
    const memKey = this.klineStoreKey(code, 'daily')

    // 1) 内存缓存
    const mem = this.klineStore.get(memKey)
    if (mem) return mem

    // 2) localStorage 缓存
    const kKey = CacheManager.klineKey(code, 'daily')
    const persistent = cacheManager.get<KlineData[]>(kKey)
    if (persistent) {
      this.klineStore.set(memKey, persistent)
      this.clampSimDay(persistent)
      return persistent
    }

    // 3) API 拉取
    const info = findInfo(code) ?? {
      code,
      name: code,
      market: code.startsWith('6') ? 'sh' : code.startsWith('0') || code.startsWith('3') ? 'sz' : 'sh',
      industry: '未知',
      basePrice: 0,
    }
    const fc = toWestockCode(info)
    const res = await fetch(`${API_BASE}/kline?code=${fc}&period=day&limit=${count}`)
    if (!res.ok) throw new Error('Failed to fetch kline')
    const allKlines: KlineData[] = await res.json()
    this.klineStore.set(memKey, allKlines)
    cacheManager.set(kKey, allKlines)

    // 根据实际 K 线数量调整 simDay，防止超出数据范围导致刷新卡死
    this.clampSimDay(allKlines)

    return allKlines
  }

  /** 根据实际 K 线数量 clamp simDay，确保初始展示不超出数据范围 */
  private clampSimDay(klines: KlineData[]) {
    const target = Math.min(this.simDay, klines.length)
    if (this.simDay !== target) {
      this.simDay = target
    }
  }

  async getMinuteLine(_code: string): Promise<MinutePoint[]> {
    return []
  }

  async getDepth(code: string): Promise<DepthData> {
    return { code, bids: [], asks: [] }
  }

  subscribe(codes: string[], callback: (quote: StockQuote) => void): () => void {
    for (const code of codes) {
      if (!this.subscribers.has(code)) this.subscribers.set(code, new Set())
      this.subscribers.get(code)!.add(callback)
    }
    return () => {
      for (const code of codes) {
        const subs = this.subscribers.get(code)
        if (subs) {
          subs.delete(callback)
          if (subs.size === 0) this.subscribers.delete(code)
        }
      }
    }
  }
}
