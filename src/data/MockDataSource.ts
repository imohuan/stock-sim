import type { DataSourceAdapter } from '../types/data-source'
import type { StockInfo, StockQuote, KlineData, KlinePeriod, MinutePoint, DepthData } from '../types/stock'
import { STOCK_LIST } from './stock-list'
import dayjs from 'dayjs'
import { aggregateKline } from './klineAggregator'
import { SIM_INITIAL_DAYS, MOCK_HISTORY_DAYS } from '@/config/simulation'

/** 价格精度（小数位） */
function roundPrice(p: number): number {
  return Math.round(p * 100) / 100
}

function roundPercent(p: number): number {
  return Math.round(p * 10000) / 100
}

/**
 * 随机游走生成新价格
 */
function randomWalk(prevPrice: number, volatility = 0.015): number {
  const drift = (Math.random() - 0.5) * 0.002
  const shock = (Math.random() - 0.5) * 2 * volatility
  const change = drift + shock
  let newPrice = prevPrice * (1 + change)
  newPrice = Math.max(prevPrice * 0.9, Math.min(prevPrice * 1.1, newPrice))
  return roundPrice(newPrice)
}

/** 预生成的历史K线天数 */
// 从统一配置引入
// 从统一配置引入：SIM_INITIAL_DAYS, MOCK_HISTORY_DAYS

interface StockState {
  info: StockInfo
  currentPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  preClose: number
  volume: number
  amount: number
  /** 日内分时数据（分钟级） */
  minuteData: MinutePoint[]
  /** 累积的日K线数据（含历史+当天） */
  klineCache: KlineData[]
}

export class MockDataSource implements DataSourceAdapter {
  name = '模拟数据'

  private stockStates: Map<string, StockState> = new Map()
  private subscribers: Map<string, Set<(quote: StockQuote) => void>> = new Map()
  private tickTimer: ReturnType<typeof setInterval> | null = null
  private _paused = false

  /** 模拟起始日期 */
  private readonly baseDate = dayjs('2024-01-02')

  constructor(initialInterval = 2) {
    this.initStockStates()
    this.startTick(initialInterval)
  }

  /** 当前模拟天数 */
  simDay = SIM_INITIAL_DAYS

  /** 是否已暂停 */
  get paused(): boolean {
    return this._paused
  }

  /** 暂停自动刷新 */
  pause() {
    if (this._paused) return
    this._paused = true
    this.stopTick()
  }

  /** 恢复自动刷新 */
  resume(intervalSec = 2) {
    if (!this._paused) {
      this.stopTick()
    }
    this._paused = false
    this.startTick(intervalSec)
  }

  /** 设置刷新间隔（秒） */
  setInterval(seconds: number) {
    if (this._paused) return
    this.stopTick()
    this.startTick(seconds)
  }

  /** 手动推进一天 */
  manualRefresh() {
    if (this.simDay >= MOCK_HISTORY_DAYS) return
    this.simDay++
    this.nextDay()
  }

  // ==================== 初始化 ====================

  /**
   * 初始化所有股票状态，预生成 MOCK_HISTORY_DAYS 天历史K线
   */
  private initStockStates() {
    for (const info of STOCK_LIST) {
      const price = info.basePrice
      // 预生成历史K线（随机漫步）
      const klineCache: KlineData[] = []
      let prevClose = price
      for (let d = 0; d < MOCK_HISTORY_DAYS; d++) {
        const date = this.baseDate.add(d, 'day')
        const volatility = d > 0 ? 0.03 : 0 // 第一天波动为0
        const change = d > 0 ? (Math.random() - 0.48) * volatility : 0
        const open = roundPrice(prevClose * (1 + change * 0.5))
        const close = roundPrice(prevClose * (1 + change))
        const high = roundPrice(Math.max(open, close) * (1 + Math.random() * 0.01))
        const low = roundPrice(Math.min(open, close) * (1 - Math.random() * 0.01))
        const volume = Math.floor(Math.random() * 10000000) + 5000000
        klineCache.push({
          time: date.format('YYYY-MM-DD'),
          open,
          close,
          high,
          low,
          volume,
        })
        prevClose = close
      }

      // 用第 SIM_INITIAL_DAYS 天的数据初始化当前状态
      const startIdx = SIM_INITIAL_DAYS - 1
      const startK = klineCache[startIdx]
      this.stockStates.set(info.code, {
        info,
        currentPrice: startK.close,
        openPrice: startK.open,
        highPrice: startK.high,
        lowPrice: startK.low,
        preClose: startIdx > 0 ? klineCache[startIdx - 1].close : price,
        volume: startK.volume,
        amount: startK.volume * startK.close,
        minuteData: [],
        klineCache,
      })
    }
  }

  // ==================== 定时器 ====================

  private startTick(intervalSec = 2) {
    this.stopTick()
    this.tickTimer = setInterval(() => {
      this.tick()
    }, intervalSec * 1000)
  }

  private stopTick() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer)
      this.tickTimer = null
    }
  }

  // ==================== Tick 逻辑 ====================

  /**
   * 每次定时触发 = 推进一个交易日（与手动刷新效果一致）
   */
  private tick() {
    this.nextDay()
  }

  /**
   * 推进一天：优先用预生成 klineCache，超出则随机生成
   */
  private nextDay() {
    const dayIdx = this.simDay - 1
    for (const [code, state] of this.stockStates) {
      if (dayIdx < state.klineCache.length) {
        // 使用预生成 K 线数据
        const k = state.klineCache[dayIdx]
        state.preClose = dayIdx > 0 ? state.klineCache[dayIdx - 1].close : k.open
        state.openPrice = k.open
        state.currentPrice = k.close
        state.highPrice = k.high
        state.lowPrice = k.low
        state.volume = k.volume
        state.amount = k.volume * k.close
      } else {
        // 超出预生成范围：随机生成新数据
        const prevK = state.klineCache[state.klineCache.length - 1]
        const prevClose = state.currentPrice
        const volatility = 0.03
        const change = (Math.random() - 0.48) * volatility
        const newOpen = roundPrice(prevClose * (1 + change * 0.5))
        const newClose = roundPrice(prevClose * (1 + change))
        const newHigh = roundPrice(Math.max(newOpen, newClose) * (1 + Math.random() * 0.01))
        const newLow = roundPrice(Math.min(newOpen, newClose) * (1 - Math.random() * 0.01))
        const dailyVol = Math.floor(Math.random() * 10000000) + 5000000

        state.preClose = prevClose
        state.openPrice = newOpen
        state.currentPrice = newClose
        state.highPrice = newHigh
        state.lowPrice = newLow
        state.volume = dailyVol
        state.amount = dailyVol * newClose

        const simDate = this.baseDate.add(state.klineCache.length, 'day')
        state.klineCache.push({
          time: simDate.format('YYYY-MM-DD'),
          open: newOpen,
          close: newClose,
          high: newHigh,
          low: newLow,
          volume: dailyVol,
        })
      }
    }
    this.pushQuotes()
  }

  // ==================== 行情推送 ====================

  private pushQuotes() {
    for (const [code, subs] of this.subscribers) {
      const state = this.stockStates.get(code)
      if (!state) continue
      const quote = this.stateToQuote(state)
      for (const cb of subs) {
        cb(quote)
      }
    }
  }

  private stateToQuote(state: StockState): StockQuote {
    const change = roundPrice(state.currentPrice - state.preClose)
    const changePercent = roundPercent((change / state.preClose) * 100)
    const todayK = state.klineCache[state.klineCache.length - 1]
    const simDate = todayK ? dayjs(todayK.time) : this.baseDate
    return {
      code: state.info.code,
      name: state.info.name,
      price: state.currentPrice,
      open: state.openPrice,
      high: state.highPrice,
      low: state.lowPrice,
      preClose: state.preClose,
      volume: state.volume,
      amount: Math.round(state.amount / 10000 * 100) / 100,
      change,
      changePercent,
      time: simDate.format('HH:mm:ss'),
    }
  }

  // ==================== DataSourceAdapter ====================

  async getStockList(): Promise<StockInfo[]> {
    return STOCK_LIST
  }

  async getQuote(code: string): Promise<StockQuote> {
    const state = this.ensureState(code)
    return this.stateToQuote(state)
  }

  async getQuotes(codes: string[]): Promise<Map<string, StockQuote>> {
    const result = new Map<string, StockQuote>()
    for (const code of codes) {
      const state = this.ensureState(code)
      result.set(code, this.stateToQuote(state))
    }
    return result
  }

  async getKline(code: string, period: KlinePeriod, count = 60): Promise<KlineData[]> {
    const state = this.ensureState(code)

    const all = state.klineCache

    // 截取到当前模拟天数的数据
    const visible = all.slice(0, this.simDay)

    // 周/月K 由日K 聚合
    const aggregated = aggregateKline(visible, period)
    return aggregated.slice(-count)
  }

  async getMinuteLine(code: string): Promise<MinutePoint[]> {
    const state = this.ensureState(code)
    if (state.minuteData.length === 0) {
      const points: MinutePoint[] = []
      const currentHour = dayjs().hour()
      const currentMin = dayjs().minute()
      const totalMin = Math.max(currentHour * 60 + currentMin, 120) // 至少2小时
      let p = state.preClose
      for (let i = 0; i <= totalMin; i++) {
        const h = Math.floor(i / 60)
        const m = i % 60
        const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        p = roundPrice(p * (1 + (Math.random() - 0.5) * 0.005))
        points.push({ time: t, price: p, volume: 0, avgPrice: p })
      }
      return points
    }
    return state.minuteData
  }

  async getDepth(code: string): Promise<DepthData> {
    const state = this.ensureState(code)
    const price = state.currentPrice
    const step = price > 100 ? 0.05 : price > 10 ? 0.01 : 0.005

    const asks: { price: number; volume: number }[] = []
    const bids: { price: number; volume: number }[] = []

    for (let i = 1; i <= 5; i++) {
      asks.push({
        price: roundPrice(price + step * i),
        volume: Math.floor(Math.random() * 5000) + 100,
      })
    }
    for (let i = 1; i <= 5; i++) {
      bids.push({
        price: roundPrice(price - step * i),
        volume: Math.floor(Math.random() * 5000) + 100,
      })
    }

    return { code, bids, asks }
  }

  subscribe(codes: string[], callback: (quote: StockQuote) => void): () => void {
    for (const code of codes) {
      if (!this.subscribers.has(code)) {
        this.subscribers.set(code, new Set())
      }
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

  /** 确保股票状态存在：优先从预生成列表获取，不存在则动态创建 */
  private ensureState(code: string): StockState {
    let state = this.stockStates.get(code)
    if (state) return state

    // 动态创建：从 STOCK_LIST 查找 info，找不到则构造默认 info
    const info = STOCK_LIST.find((s) => s.code === code) ?? {
      code,
      name: code,
      market: code.startsWith('6') ? 'sh' : code.startsWith('0') || code.startsWith('3') ? 'sz' : 'sh',
      industry: '未知',
      basePrice: Math.round((5 + Math.random() * 45) * 100) / 100,
    }

    const price = info.basePrice
    const klineCache: KlineData[] = []
    let prevClose = price
    for (let d = 0; d < MOCK_HISTORY_DAYS; d++) {
      const date = this.baseDate.add(d, 'day')
      const volatility = d > 0 ? 0.03 : 0
      const change = d > 0 ? (Math.random() - 0.48) * volatility : 0
      const open = roundPrice(prevClose * (1 + change * 0.5))
      const close = roundPrice(prevClose * (1 + change))
      const high = roundPrice(Math.max(open, close) * (1 + Math.random() * 0.01))
      const low = roundPrice(Math.min(open, close) * (1 - Math.random() * 0.01))
      const volume = Math.floor(Math.random() * 10000000) + 5000000
      klineCache.push({ time: date.format('YYYY-MM-DD'), open, close, high, low, volume })
      prevClose = close
    }

    const startIdx = SIM_INITIAL_DAYS - 1
    const startK = klineCache[startIdx]
    state = {
      info,
      currentPrice: startK.close,
      openPrice: startK.open,
      highPrice: startK.high,
      lowPrice: startK.low,
      preClose: startIdx > 0 ? klineCache[startIdx - 1].close : price,
      volume: startK.volume,
      amount: startK.volume * startK.close,
      minuteData: [],
      klineCache,
    }
    this.stockStates.set(code, state)
    console.log('[MockDataSource] dynamically created state for', code, info.name, 'basePrice:', price)
    return state
  }

  /** 重置模拟：回到第1天，所有价格恢复初始 */
  reset() {
    this.simDay = SIM_INITIAL_DAYS
    this.stockStates.clear()
    this.initStockStates()
    this.pushQuotes()
  }

  destroy() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer)
      this.tickTimer = null
    }
    this.subscribers.clear()
  }
}
