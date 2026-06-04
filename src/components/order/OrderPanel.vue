<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWatchlistStore } from '@/stores/watchlist'
import { useMarketStore } from '@/stores/market'
import { useTradingStore } from '@/stores/trading'
import { AxButton, AxInput } from '@ui'
import { useNotify } from '@ui/hooks/useNotify'
import { CTRL_SIZE, CTRL_ROUNDED } from '@/config/controls'

const watchlistStore = useWatchlistStore()
const marketStore = useMarketStore()
const trading = useTradingStore()
const notify = useNotify()

const orderType = ref<'buy' | 'sell'>('buy')
const price = ref('')
const quantity = ref(1) // 手数

const selectedQuote = computed(() =>
  marketStore.getQuote(watchlistStore.selectedStock)
)

// ---- 快捷数量选项 ----
interface QuickOption {
  label: string
  qty: number  // -1 表示动态计算（梭哈/清仓）
  key: string
}

const quickOptions = computed<QuickOption[]>(() => {
  const opts: QuickOption[] = [
    { label: '2手', qty: 2, key: '2' },
    { label: '4手', qty: 4, key: '4' },
    { label: '6手', qty: 6, key: '6' },
    { label: '8手', qty: 8, key: '8' },
  ]
  // 梭哈：买入=全部资金能买多少, 卖出=全部持仓
  const maxQty = orderType.value === 'buy' ? maxBuyQty.value : maxSellQty.value
  if (maxQty > 0) {
    opts.push({ label: '梭哈', qty: maxQty, key: 'allin' })
  }
  // 清仓：仅卖出时显示
  if (orderType.value === 'sell' && maxSellQty.value > 0 && maxSellQty.value !== maxQty) {
    opts.push({ label: '清仓', qty: maxSellQty.value, key: 'clear' })
  }
  return opts
})

/** 买入：当前价格 * 手数 * 100 + 佣金 <= 可用资金 */
function canAffordBuy(qty: number): boolean {
  if (!selectedQuote.value) return false
  const p = selectedQuote.value.price
  const amount = p * qty * 100
  const fee = Math.max(5, Math.round(amount * 0.0003 * 100) / 100)
  return amount + fee <= trading.account.availableCash
}

/** 卖出：是否持有足够股数 */
function canAffordSell(qty: number): boolean {
  const pos = trading.positions.get(watchlistStore.selectedStock)
  return pos ? pos.quantity >= qty * 100 : false
}

// ---- 价格校验 ----
const PRICE_RANGE = 0.1 // ±10% 涨跌幅限制

const priceError = computed(() => {
  if (!selectedQuote.value || !price.value) return ''
  const p = parseFloat(price.value)
  if (isNaN(p) || p <= 0) return '请输入有效价格'
  const marketPrice = selectedQuote.value.price
  const minPrice = marketPrice * (1 - PRICE_RANGE)
  const maxPrice = marketPrice * (1 + PRICE_RANGE)
  if (p < minPrice) return `最低 ¥${minPrice.toFixed(2)}（-10%）`
  if (p > maxPrice) return `最高 ¥${maxPrice.toFixed(2)}（+10%）`
  return ''
})

const priceValid = computed(() => !priceError.value && !!price.value)

// ---- 预估金额 ----
const estimatedAmount = computed(() => {
  const p = parseFloat(price.value) || selectedQuote.value?.price || 0
  const q = quantity.value || 0
  return p * q * 100
})

const estimatedFee = computed(() => {
  return Math.max(5, Math.round(estimatedAmount.value * 0.0003 * 100) / 100)
})

const estimatedTotal = computed(() => {
  return estimatedAmount.value + estimatedFee.value
})

// ---- 可买/可卖上限 ----
const maxBuyQty = computed(() => {
  if (!selectedQuote.value) return 0
  const p = selectedQuote.value.price
  return Math.floor(trading.account.availableCash / (p * 100))
})

const maxSellQty = computed(() => {
  const pos = trading.positions.get(watchlistStore.selectedStock)
  return pos ? Math.floor(pos.quantity / 100) : 0
})

// ---- 提交校验 ----
const canSubmit = computed(() => {
  if (!priceValid.value || quantity.value <= 0) return false
  if (orderType.value === 'buy') {
    return estimatedTotal.value <= trading.account.availableCash
  }
  return canAffordSell(quantity.value)
})

// ---- 同步最新价 ----
watch(selectedQuote, (newQuote, oldQuote) => {
  if (newQuote) {
    price.value = newQuote.price.toFixed(2)
    // 只在切换股票时重置数量，行情刷新不重置
    if (!oldQuote || oldQuote.code !== newQuote.code) {
      quantity.value = 1
    }
  }
}, { immediate: true })

// ---- 操作 ----
function setQuickQty(qty: number) {
  quantity.value = qty
}

function submit() {
  const code = watchlistStore.selectedStock
  if (!code) return

  const p = parseFloat(price.value)
  const q = quantity.value
  if (!p || !q) {
    notify.error('请输入价格和数量')
    return
  }
  if (!priceValid.value) {
    notify.error(priceError.value)
    return
  }
  if (orderType.value === 'buy' && estimatedTotal.value > trading.account.availableCash) {
    notify.error('可用资金不足')
    return
  }
  if (orderType.value === 'sell' && !canAffordSell(q)) {
    notify.error('持仓不足')
    return
  }

  trading.placeOrder({
    code,
    name: selectedQuote.value?.name,
    type: orderType.value,
    price: p,
    quantity: q * 100,
  })

  quantity.value = 1
}
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="text-body-sm font-semibold px-2 py-1.5 border-b border-outline-variant">交易</div>
    <div class="p-2 flex flex-col gap-2 overflow-y-auto">

      <!-- 买卖方向按钮组 -->
      <div class="flex items-center bg-surface-container rounded-lg p-0.5 gap-0.5">
        <AxButton
          variant="ghost"
          :size="CTRL_SIZE"
          class="flex-1"
          :class="orderType === 'buy' ? '!bg-primary !text-on-primary hover:!opacity-90' : ''"
          @click="orderType = 'buy'"
        >
          买入
        </AxButton>
        <AxButton
          variant="ghost"
          :size="CTRL_SIZE"
          class="flex-1"
          :class="orderType === 'sell' ? '!bg-primary !text-on-primary hover:!opacity-90' : ''"
          @click="orderType = 'sell'"
        >
          卖出
        </AxButton>
      </div>

      <!-- 可用资金/可卖持仓 -->
      <div class="text-body-sm text-secondary flex justify-between" v-if="selectedQuote">
        <template v-if="orderType === 'buy'">
          <span>可用: ¥{{ trading.account.availableCash.toFixed(2) }}</span>
          <span>最多: {{ maxBuyQty }}手</span>
        </template>
        <template v-else>
          <span>持仓: {{ maxSellQty > 0 ? maxSellQty + '手' : '无' }}</span>
          <span>成本: ¥{{ (trading.positions.get(watchlistStore.selectedStock)?.avgCost ?? 0).toFixed(2) }}</span>
        </template>
      </div>
      <div v-else class="text-body-sm text-secondary">请先选择股票</div>

      <!-- 委托价格 -->
      <div>
        <label class="text-body-sm text-secondary mb-0.5 block">
          委托价格
          <span v-if="selectedQuote" class="ml-1">
            (最新 {{ selectedQuote.price.toFixed(2) }})
          </span>
        </label>
        <AxInput
          v-model="price"
          placeholder="0.00"
          :size="CTRL_SIZE"
          :rounded="CTRL_ROUNDED"
        />
        <p v-if="priceError" class="text-body-xs text-error mt-0.5">{{ priceError }}</p>
      </div>

      <!-- 委托数量 -->
      <div>
        <label class="text-body-sm text-secondary mb-0.5 block">委托数量（手）</label>
        <!-- 快捷按钮 -->
        <div class="flex gap-1 mb-1.5 flex-wrap">
          <AxButton
            v-for="opt in quickOptions"
            :key="opt.key"
            size="sm"
            :variant="quantity === opt.qty ? 'primary' : 'outline'"
            :disabled="orderType === 'buy' ? !canAffordBuy(opt.qty) : !canAffordSell(opt.qty)"
            class="flex-1 min-w-[40px] text-xs tracking-tight"
            @click="setQuickQty(opt.qty)"
          >
            {{ opt.label }}
          </AxButton>
        </div>
        <!-- 手动输入 -->
        <AxInput
          v-model.number="quantity"
          type="number"
          :min="1"
          placeholder="手数"
          :size="CTRL_SIZE"
          :rounded="CTRL_ROUNDED"
        />
      </div>

      <!-- 预估明细 -->
      <div v-if="selectedQuote && quantity > 0" class="text-body-sm text-secondary space-y-0.5">
        <div class="flex justify-between">
          <span>成交金额</span>
          <span class="font-numeric">¥{{ estimatedAmount.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span>佣金 (0.03%, 最低5元)</span>
          <span class="font-numeric">¥{{ estimatedFee.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between font-medium text-primary border-t border-outline-variant pt-0.5 mt-0.5">
          <span>{{ orderType === 'buy' ? '应付总额' : '应收总额' }}</span>
          <span class="font-numeric">
            {{ orderType === 'buy' ? '-' : '+' }}¥{{ estimatedTotal.toFixed(2) }}
          </span>
        </div>
        <!-- 购买力提示 -->
        <p
          v-if="orderType === 'buy' && estimatedTotal > trading.account.availableCash"
          class="text-error !mt-1"
        >
          资金不足，还差 ¥{{ (estimatedTotal - trading.account.availableCash).toFixed(2) }}
        </p>
      </div>

      <!-- 下单按钮 -->
      <AxButton
        block
        :size="CTRL_SIZE"
        :rounded="CTRL_ROUNDED"
        :variant="orderType === 'buy' ? 'primary' : 'danger'"
        :disabled="!canSubmit"
        @click="submit"
      >
        {{ orderType === 'buy' ? '买入' : '卖出' }}
        <template v-if="quantity > 0 && selectedQuote">
          {{ quantity }}手 (¥{{ estimatedAmount.toFixed(2) }})
        </template>
      </AxButton>
    </div>
  </div>
</template>
