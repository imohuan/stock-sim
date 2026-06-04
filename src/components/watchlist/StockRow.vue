<script setup lang="ts">
import { computed } from 'vue'
import type { StockQuote } from '@/types/stock'
import PriceText from '@/components/common/PriceText.vue'
import ChangeBadge from '@/components/common/ChangeBadge.vue'

const props = defineProps<{
  quote: StockQuote
  selected: boolean
}>()

const emit = defineEmits<{
  click: [code: string]
  remove: [code: string]
}>()

const isUp = computed(() => props.quote.changePercent > 0)
const isDown = computed(() => props.quote.changePercent < 0)
</script>

<template>
  <div
    :class="[
      'w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors cursor-pointer border-0',
      selected
        ? 'bg-primary/8 border-l-2 border-primary'
        : 'hover:bg-surface-container-low border-l-2 border-transparent',
    ]"
    role="button"
    tabindex="0"
    @click="emit('click', quote.code)"
    @keydown.enter="emit('click', quote.code)"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-1.5">
        <span class="text-body-sm font-medium truncate">{{ quote.name }}</span>
        <span class="text-secondary text-body-sm shrink-0">{{ quote.code }}</span>
      </div>
      <div class="flex items-center gap-2 mt-0.5">
        <PriceText :price="quote.price" :pre-close="quote.preClose" class="text-body-sm font-semibold" />
        <ChangeBadge :change-percent="quote.changePercent" size="sm" />
      </div>
    </div>
    <span
      class="shrink-0 w-4 h-4 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-opacity cursor-pointer"
      role="button"
      tabindex="0"
      @click.stop="emit('remove', quote.code)"
      @keydown.enter.stop="emit('remove', quote.code)"
    >
      <span class="material-symbols-outlined text-[12px] text-secondary">close</span>
    </span>
  </div>
</template>
