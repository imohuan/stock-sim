<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  changePercent: number
  showIcon?: boolean
  size?: 'sm' | 'md'
}>(), {
  showIcon: true,
  size: 'sm',
})

const isUp = computed(() => props.changePercent > 0)
const isDown = computed(() => props.changePercent < 0)

const bgClass = computed(() => {
  if (isUp.value) return 'bg-stock-up text-white'
  if (isDown.value) return 'bg-stock-down text-white'
  return 'bg-surface-container-high text-on-surface-variant'
})

const icon = computed(() => {
  if (isUp.value) return 'arrow_drop_up'
  if (isDown.value) return 'arrow_drop_down'
  return 'remove'
})

const formatted = computed(() => {
  const sign = isUp.value ? '+' : ''
  return sign + props.changePercent.toFixed(2) + '%'
})

const sizeClass = computed(() => props.size === 'sm' ? 'text-body-sm px-1 py-px' : 'text-body-md px-2 py-0.5')
</script>

<template>
  <span
    :class="[bgClass, sizeClass]"
    class="inline-flex items-center gap-0.5 rounded font-numeric font-medium tabular-nums"
  >
    <!-- <span v-if="showIcon && (isUp || isDown)" class="material-symbols-outlined text-[12px] leading-none">{{ icon }}</span> -->
    {{ formatted }}
  </span>
</template>
