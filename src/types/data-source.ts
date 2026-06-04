import type { StockInfo, StockQuote, KlineData, KlinePeriod, MinutePoint, DepthData } from './stock'

export interface DataSourceAdapter {
  name: string
  getStockList(): Promise<StockInfo[]>
  getQuote(code: string): Promise<StockQuote>
  getQuotes(codes: string[]): Promise<Map<string, StockQuote>>
  getKline(code: string, period: KlinePeriod, count?: number): Promise<KlineData[]>
  getMinuteLine(code: string): Promise<MinutePoint[]>
  getDepth(code: string): Promise<DepthData>
  subscribe(codes: string[], callback: (quote: StockQuote) => void): () => void
}

export type DataSourceKey = 'mock' | 'real'
