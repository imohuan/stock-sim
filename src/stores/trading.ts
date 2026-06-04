import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Position, TradeRecord, AccountInfo, OrderRequest } from '@/types/stock'
import { useNotify } from '@ui/hooks/useNotify'
import { useMarketStore } from './market'
import dayjs from 'dayjs'

const INITIAL_CAPITAL = 100000

export const useTradingStore = defineStore('trading', () => {
  const notify = useNotify()

  const account = ref<AccountInfo>({
    totalAssets: INITIAL_CAPITAL,
    availableCash: INITIAL_CAPITAL,
    frozenCash: 0,
    marketValue: 0,
    totalProfit: 0,
    totalProfitPercent: 0,
    initialCapital: INITIAL_CAPITAL,
  })

  const positions = ref<Map<string, Position>>(new Map())
  const tradeRecords = ref<TradeRecord[]>([])

  const positionList = computed(() => Array.from(positions.value.values()))

  /** 下单 */
  function placeOrder(order: OrderRequest) {
    const { code, type, price, quantity } = order
    const name = order.name || positions.value.get(code)?.name || code
    const amount = price * quantity

    // A 股手续费：佣金（万三，最低5元）+ 过户费（万一，双向）+ 印花税（万五，仅卖出）
    const commission = Math.max(5, Math.round(amount * 0.0003 * 100) / 100)
    const transferFee = Math.round(amount * 0.00001 * 100) / 100
    const stampDuty = type === 'sell' ? Math.round(amount * 0.0005 * 100) / 100 : 0
    const fee = Math.round((commission + transferFee + stampDuty) * 100) / 100

    if (amount <= 0 || quantity <= 0) {
      notify.error('请输入有效的价格和数量')
      return
    }

    if (type === 'buy') {
      const totalCost = amount + fee
      if (totalCost > account.value.availableCash) {
        notify.error('可用资金不足')
        return
      }
      account.value.availableCash -= totalCost

      // 更新持仓
      const existing = positions.value.get(code)
      if (existing) {
        const totalQty = existing.quantity + quantity
        const totalCostBasis = existing.avgCost * existing.quantity + amount
        existing.avgCost = Math.round((totalCostBasis / totalQty) * 100) / 100
        existing.quantity = totalQty
        existing.marketValue = existing.quantity * existing.currentPrice
        existing.profit = Math.round((existing.currentPrice - existing.avgCost) * existing.quantity * 100) / 100
        existing.profitPercent = existing.avgCost > 0
          ? Math.round(((existing.currentPrice - existing.avgCost) / existing.avgCost) * 10000) / 100
          : 0
      } else {
        positions.value.set(code, {
          code,
          name,
          quantity,
          avgCost: price,
          currentPrice: price,
          marketValue: amount,
          profit: 0,
          profitPercent: 0,
        })
      }
    } else {
      // 卖出
      const holding = positions.value.get(code)
      if (!holding || holding.quantity < quantity) {
        notify.error('持仓不足')
        return
      }
      account.value.availableCash += amount - fee

      holding.quantity -= quantity
      if (holding.quantity <= 0) {
        positions.value.delete(code)
      } else {
        holding.marketValue = Math.round(holding.quantity * holding.currentPrice * 100) / 100
        holding.profit = Math.round((holding.currentPrice - holding.avgCost) * holding.quantity * 100) / 100
      }
    }

    // 记账
    const simDay = useMarketStore().simDay

    const record: TradeRecord = {
      id: uid(),
      code,
      name,
      type,
      price,
      quantity,
      amount,
      fee,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      simDay,
    }
    tradeRecords.value.unshift(record)

    // 刷新总资产
    updateAccount()

    positions.value = new Map(positions.value) // 触发响应式
    notify.success(`${type === 'buy' ? '买入' : '卖出'}成功`)
  }

  /** 根据最新行情刷新持仓市值 */
  function refreshPositions(quotes: Map<string, { price: number; name: string }>) {
    for (const [code, pos] of positions.value) {
      const quote = quotes.get(code)
      if (quote) {
        pos.currentPrice = quote.price
        pos.name = quote.name
        pos.marketValue = pos.quantity * quote.price
        pos.profit = Math.round((quote.price - pos.avgCost) * pos.quantity * 100) / 100
        pos.profitPercent = pos.avgCost > 0
          ? Math.round(((quote.price - pos.avgCost) / pos.avgCost) * 10000) / 100
          : 0
      }
    }
    positions.value = new Map(positions.value)
    updateAccount()
  }

  function updateAccount() {
    let marketValue = 0
    let totalProfit = 0
    for (const [, pos] of positions.value) {
      marketValue += pos.marketValue
      totalProfit += pos.profit
    }
    account.value.marketValue = Math.round(marketValue * 100) / 100
    account.value.totalProfit = Math.round(totalProfit * 100) / 100
    account.value.totalAssets = Math.round(
      (account.value.availableCash + account.value.marketValue) * 100
    ) / 100
    account.value.totalProfitPercent = account.value.initialCapital > 0
      ? Math.round((account.value.totalProfit / account.value.initialCapital) * 10000) / 100
      : 0
  }

  function uid(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }

  /** 重置账户到初始状态 */
  function resetAccount() {
    account.value = {
      totalAssets: INITIAL_CAPITAL,
      availableCash: INITIAL_CAPITAL,
      frozenCash: 0,
      marketValue: 0,
      totalProfit: 0,
      totalProfitPercent: 0,
      initialCapital: INITIAL_CAPITAL,
    }
    positions.value = new Map()
    tradeRecords.value = []
  }

  /** 设置初始资金 */
  function setInitialCapital(value: number) {
    if (value <= 0) return
    account.value.totalAssets = value
    account.value.availableCash = value
    account.value.initialCapital = value
  }

  return {
    account,
    positions,
    tradeRecords,
    positionList,
    placeOrder,
    refreshPositions,
    updateAccount,
    setInitialCapital,
    resetAccount,
  }
})
