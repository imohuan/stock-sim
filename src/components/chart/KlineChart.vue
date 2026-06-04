<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CandlestickChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { KlineData } from '@/types/stock'

use([
  CandlestickChart, BarChart, LineChart,
  TitleComponent, TooltipComponent, GridComponent,
  DataZoomComponent, LegendComponent, MarkLineComponent,
  CanvasRenderer,
])

const props = defineProps<{
  data: KlineData[]
  stockName?: string
}>()

const chartRef = ref<InstanceType<typeof VChart> | null>(null)

/** 保存用户缩放状态，刷新时保持不变 */
const zoomState = ref({ start: 50, end: 100 })

function onDataZoom(params: any) {
  const zoom = params.batch?.[0] ?? params
  zoomState.value = {
    start: zoom.start ?? 50,
    end: zoom.end ?? 100,
  }
}

// ECharts K线图配置
const option = computed(() => {
  const dates = props.data.map((d) => d.time)
  const ohlc = props.data.map((d) => [d.open, d.close, d.low, d.high])
  const volumes = props.data.map((d) => d.volume)
  const ma5 = calcMA(5, props.data)
  const ma10 = calcMA(10, props.data)
  const ma20 = calcMA(20, props.data)
  const ma30 = calcMA(30, props.data)
  const ma40 = calcMA(40, props.data)
  const ma50 = calcMA(50, props.data)
  const ma60 = calcMA(60, props.data)

  return {
    animation: false,
    legend: {
      top: 4,
      left: 'center',
      itemWidth: 14,
      itemHeight: 8,
      textStyle: { fontSize: 11, color: '#78767b' },
      data: ['K线', 'MA5', 'MA10', 'MA20', 'MA30', 'MA40', 'MA50', 'MA60'],
      selected: {
        MA30: false,
        MA40: false,
        MA50: false,
        MA60: false,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      backgroundColor: '#fff',
      borderColor: '#e2e2e3',
      textStyle: { color: '#1a1c1d', fontSize: 12 },
      formatter: (params: any) => {
        const k = params.find((p: any) => p.seriesName === 'K线')
        const v = params.find((p: any) => p.seriesName === '成交量')
        if (!k) return ''
        const d = k.data
        return `
          <div style="font-weight:600;margin-bottom:4px">${k.axisValue}</div>
          <div>开: ${d[1]}  收: ${d[2]}</div>
          <div>高: ${d[3]}  低: ${d[4]}</div>
          <div>量: ${(v?.data ?? 0).toLocaleString()}手</div>
        `
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
    },
    grid: [
      { left: 56, right: 16, top: 40, height: '60%' },
      { left: 56, right: 16, top: '76%', height: '14%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        gridIndex: 0,
        axisLine: { lineStyle: { color: '#e2e2e3' } },
        axisTick: { show: false },
        axisLabel: { color: '#78767b', fontSize: 10 },
        boundaryGap: true,
      },
      {
        type: 'category',
        data: dates,
        gridIndex: 1,
        axisLine: { lineStyle: { color: '#e2e2e3' } },
        axisTick: { show: false },
        axisLabel: { show: false },
        boundaryGap: true,
      },
    ],
    yAxis: [
      {
        type: 'value',
        gridIndex: 0,
        scale: true,
        splitLine: { lineStyle: { color: '#f3f3f4' } },
        axisLabel: { color: '#78767b', fontSize: 10 },
        position: 'left',
      },
      {
        type: 'value',
        gridIndex: 1,
        axisLabel: { show: false },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: zoomState.value.start,
        end: zoomState.value.end,
      },
      {
        type: 'slider',
        xAxisIndex: [0, 1],
        start: zoomState.value.start,
        end: zoomState.value.end,
        bottom: 4,
        height: 16,
        borderColor: '#e2e2e3',
        backgroundColor: '#f9f9fa',
        fillerColor: 'rgba(99,102,241,0.1)',
        handleStyle: { color: '#6366f1' },
        textStyle: { fontSize: 10 },
      },
    ],
    series: [
      {
        name: 'K线',
        type: 'candlestick',
        data: ohlc,
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: {
          color: '#e15241',
          color0: '#22ab5e',
          borderColor: '#e15241',
          borderColor0: '#22ab5e',
        },
      },
      {
        name: 'MA5',
        type: 'line',
        data: ma5,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 1, color: '#f59e0b' },
        itemStyle: { color: '#f59e0b' },
        symbol: 'none',
      },
      {
        name: 'MA10',
        type: 'line',
        data: ma10,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 1, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' },
        symbol: 'none',
      },
      {
        name: 'MA20',
        type: 'line',
        data: ma20,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 1, color: '#8b5cf6' },
        itemStyle: { color: '#8b5cf6' },
        symbol: 'none',
      },
      {
        name: 'MA30',
        type: 'line',
        data: ma30,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 1, color: '#ec4899' },
        itemStyle: { color: '#ec4899' },
        symbol: 'none',
      },
      {
        name: 'MA40',
        type: 'line',
        data: ma40,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 1, color: '#14b8a6' },
        itemStyle: { color: '#14b8a6' },
        symbol: 'none',
      },
      {
        name: 'MA50',
        type: 'line',
        data: ma50,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 1, color: '#f97316' },
        itemStyle: { color: '#f97316' },
        symbol: 'none',
      },
      {
        name: 'MA60',
        type: 'line',
        data: ma60,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 1, color: '#6366f1' },
        itemStyle: { color: '#6366f1' },
        symbol: 'none',
      },
      {
        name: '成交量',
        type: 'bar',
        data: volumes,
        xAxisIndex: 1,
        yAxisIndex: 1,
        itemStyle: {
          color: (params: any) => {
            const idx = params.dataIndex
            const k = ohlc[idx]
            if (!k) return '#c8c5ca'
            return k[1] >= k[0] ? '#fee8e6' : '#e2f5e8'
          },
        },
      },
    ],
  }
})

function calcMA(dayCount: number, data: KlineData[]): (number | null)[] {
  const result: (number | null)[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < dayCount - 1) {
      result.push(null)
      continue
    }
    let sum = 0
    for (let j = 0; j < dayCount; j++) {
      sum += data[i - j].close
    }
    result.push(+(sum / dayCount).toFixed(2))
  }
  return result
}
</script>

<template>
  <div class="h-full w-full">
    <VChart
      ref="chartRef"
      class="h-full w-full"
      :option="option"
      autoresize
      @datazoom="onDataZoom"
    />
  </div>
</template>
