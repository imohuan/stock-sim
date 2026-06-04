<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  price: number
  preClose?: number
  decimals?: number
  showSign?: boolean
}>(), {
  preClose: 0,
  decimals: 2,
  showSign: false,
})

const change = computed(() => props.preClose ? props.price - props.preClose : 0)

const colorClass = computed(() => {
  if (change.value > 0) return 'text-stock-up'
  if (change.value < 0) return 'text-stock-down'
  return ''
})

const formatted = computed(() => {
  const sign = props.showSign && change.value > 0 ? '+' : ''
  return sign + props.price.toFixed(props.decimals)
})
</script>

<template>
  <span :class="colorClass" class="font-numeric tabular-nums">{{ formatted }}</span>
</template>
