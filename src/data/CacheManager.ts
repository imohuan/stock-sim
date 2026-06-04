/**
 * 前端缓存模块：缓存 quote / kline 数据到 localStorage，每天 0 点自动过期
 *
 * Key 格式（存储在 localStorage）：
 *   stock-cache:{prefix}:...
 *
 * 子 key 规则：
 *   quote   → quote:{codes_sorted}
 *   kline   → kline:{code}:{period}
 */
import dayjs from 'dayjs'

const LS_PREFIX = 'stock-cache'

const PREFIX = 'stock'
const SEP = ':'

interface CacheEntry<T> {
  data: T
  expireAt: number // Unix ms
}

export class CacheManager {
  /** 计算当天 23:59:59.999 的时间戳 */
  private todayMidnight(): number {
    return dayjs().endOf('day').valueOf()
  }

  /** 完整 localStorage key */
  private lsKey(key: string): string {
    return `${LS_PREFIX}${SEP}${key}`
  }

  /** 生成 quote 缓存 key（所有股票行情存同一个对象，key 固定不变） */
  static quoteKey(): string {
    return `${PREFIX}${SEP}quotes`
  }

  /** 生成 kline 缓存 key */
  static klineKey(code: string, period: string): string {
    return `${PREFIX}${SEP}kline${SEP}${code}${SEP}${period}`
  }

  /** 读缓存 — 过期返回 null */
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.lsKey(key))
      if (!raw) return null
      const entry: CacheEntry<T> = JSON.parse(raw)
      if (Date.now() > entry.expireAt) {
        localStorage.removeItem(this.lsKey(key))
        return null
      }
      return entry.data
    } catch {
      return null
    }
  }

  /** 写缓存 */
  set<T>(key: string, data: T): void {
    try {
      const entry: CacheEntry<T> = { data, expireAt: this.todayMidnight() }
      localStorage.setItem(this.lsKey(key), JSON.stringify(entry))
    } catch {
      // localStorage 满了或不可用，静默失败
    }
  }

  /** 检查缓存是否有效 */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /** 清除全部股票缓存 */
  clear(): void {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(LS_PREFIX)) keys.push(k)
    }
    for (const k of keys) localStorage.removeItem(k)
  }

  /** 清除指定前缀缓存 */
  clearByPrefix(prefix: string): void {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(this.lsKey(prefix))) keys.push(k)
    }
    for (const k of keys) localStorage.removeItem(k)
  }
}

/** 全局单例 */
export const cacheManager = new CacheManager()
