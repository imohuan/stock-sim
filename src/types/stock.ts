export interface StockInfo {
  code: string
  name: string
  market: 'sh' | 'sz'
  industry: string
  basePrice: number
}

export interface StockQuote {
  code: string
  name: string
  price: number
  open: number
  high: number
  low: number
  preClose: number
  volume: number
  amount: number
  change: number
  changePercent: number
  time: string
}

export interface KlineData {
  time: string
  open: number
  close: number
  high: number
  low: number
  volume: number
}

export type KlinePeriod = 'daily' | 'weekly' | 'monthly'

export interface MinutePoint {
  time: string
  price: number
  volume: number
  avgPrice: number
}

export interface DepthLevel {
  price: number
  volume: number
}

export interface DepthData {
  code: string
  bids: DepthLevel[]
  asks: DepthLevel[]
}

export interface OrderRequest {
  code: string
  name?: string
  type: 'buy' | 'sell'
  price: number
  quantity: number
}

export interface Position {
  code: string
  name: string
  quantity: number
  avgCost: number
  currentPrice: number
  marketValue: number
  profit: number
  profitPercent: number
}

export interface TradeRecord {
  id: string
  code: string
  name: string
  type: 'buy' | 'sell'
  price: number
  quantity: number
  amount: number
  fee: number
  time: string
  simDay: number
}

export interface AccountInfo {
  totalAssets: number
  availableCash: number
  frozenCash: number
  marketValue: number
  totalProfit: number
  totalProfitPercent: number
  initialCapital: number
}
