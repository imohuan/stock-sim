<script setup lang="ts">
import { computed } from 'vue'
import { useTradingStore } from '@/stores/trading'
import GridTable from '@/components/common/GridTable.vue'
import { html } from 'gridjs'

const trading = useTradingStore()

const columns = [
  { name: '编号', id: 'seq', width: '50px' },
  { name: '成交日（天）', id: 'date' },
  { name: '证券名称', id: 'name' },
  { name: '股票', id: 'code' },
  {
    name: '买卖',
    id: 'type',
    formatter: (cell: string) =>
      html(`<span class="font-medium ${cell === '买入' ? 'text-stock-up' : 'text-stock-down'}">${cell}</span>`),
  },
  { name: '价格', id: 'price' },
  { name: '数量', id: 'quantity' },
  { name: '金额', id: 'amount' },
  { name: '手续费', id: 'fee' },
]

const rows = computed(() =>
  trading.tradeRecords.slice(0, 50).map((r, idx) => ({
    seq: idx + 1,
    date: r.simDay,
    name: r.name,
    code: r.code,
    type: r.type === 'buy' ? '买入' : '卖出',
    price: r.price.toFixed(2),
    quantity: r.quantity,
    amount: r.amount.toFixed(2),
    fee: r.fee.toFixed(2),
  })),
)
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <div class="text-body-sm font-semibold px-2 py-1.5 border-b border-outline-variant shrink-0">交易记录</div>
    <div class="flex-1 overflow-auto">
      <GridTable v-if="rows.length > 0" :columns="columns" :rows="rows" />
      <div v-else class="px-2 py-4 text-center text-secondary text-body-sm">暂无交易记录</div>
    </div>
  </div>
</template>
