/**
 * K 线聚合工具：从日 K 线聚合为周 K / 月 K
 */
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import type { KlineData, KlinePeriod } from '@/types/stock'

dayjs.extend(isoWeek)

/** 聚合日 K 为周 K / 月 K */
export function aggregateKline(klineData: KlineData[], period: KlinePeriod): KlineData[] {
  if (period === 'daily' || klineData.length === 0) return klineData

  const groups = new Map<string, KlineData[]>()

  for (const k of klineData) {
    const d = dayjs(k.time)
    if (!d.isValid()) continue
    const key = period === 'weekly'
      ? `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, '0')}`
      : `${d.year()}-${String(d.month() + 1).padStart(2, '0')}`

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(k)
  }

  const result: KlineData[] = []
  for (const [, bars] of groups) {
    bars.sort((a, b) => a.time.localeCompare(b.time))
    const first = bars[0]
    const last = bars[bars.length - 1]
    let high = -Infinity
    let low = Infinity
    let volume = 0
    for (const b of bars) {
      if (b.high > high) high = b.high
      if (b.low < low) low = b.low
      volume += b.volume || 0
    }
    result.push({
      time: last.time,
      open: first.open,
      close: last.close,
      high,
      low,
      volume,
    })
  }

  result.sort((a, b) => a.time.localeCompare(b.time))
  return result
}
