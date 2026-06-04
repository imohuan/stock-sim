<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { MinutePoint } from '@/types/stock'

use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer])

const props = defineProps<{
  data: MinutePoint[]
  preClose: number
  stockName?: string
}>()

const option = computed(() => {
  const times = props.data.map((d) => d.time)
  const prices = props.data.map((d) => d.price)
  const avgPrices = props.data.map((d) => d.avgPrice)
  const volumes = props.data.map((d) => d.volume)

  const isUp = prices.length > 0 && prices[prices.length - 1] >= props.preClose

  return {
    animation: false,
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e2e2e3',
      textStyle: { color: '#1a1c1d', fontSize: 12 },
      formatter: (params: any) => {
        if (!params?.length) return ''
        const p = params[0]
        return `<div>${p.axisValue}</div><div>价格: ${p.data}</div>`
      },
    },
    grid: { left: 56, right: 16, top: 12, bottom: 24 },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { lineStyle: { color: '#e2e2e3' } },
      axisTick: { show: false },
      axisLabel: { color: '#78767b', fontSize: 10 },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitLine: { lineStyle: { color: '#f3f3f4' } },
      axisLabel: { color: '#78767b', fontSize: 10 },
    },
    series: [
      {
        name: '价格',
        type: 'line',
        data: prices,
        smooth: false,
        lineStyle: { width: 1.5, color: isUp ? '#e15241' : '#22ab5e' },
        itemStyle: { color: isUp ? '#e15241' : '#22ab5e' },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: isUp ? 'rgba(225,82,65,0.15)' : 'rgba(34,171,94,0.15)' },
              { offset: 1, color: 'rgba(255,255,255,0)' },
            ],
          },
        },
      },
      {
        name: '均价',
        type: 'line',
        data: avgPrices,
        smooth: false,
        lineStyle: { width: 1, color: '#f59e0b', type: 'dashed' },
        itemStyle: { color: '#f59e0b' },
        symbol: 'none',
      },
    ],
  }
})
</script>

<template>
  <VChart class="h-full w-full" :option="option" autoresize />
</template>
