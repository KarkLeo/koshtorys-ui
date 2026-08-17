<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  GridComponent,
} from 'echarts/components'
import { useTransactionStatisticsMapper } from '@/mappers/transaction-statistics-mapper.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useI18n } from 'vue-i18n'
import { useChartTheme } from '@/composables/useChartTheme'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DatasetComponent,
  GridComponent,
])

const { transactionAmountByDate } = useTransactionStatisticsMapper()
const { user } = useMe()
const { t } = useI18n()
const theme = useChartTheme()

const option = computed(() => {
  const formatedCurrency = CURRENCIES_SYMBOL[user.value?.currency as string] || user.value?.currency
  const c = theme.value

  return {
    backgroundColor: 'transparent',
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.card,
      borderColor: c.border,
      borderWidth: 1,
      textStyle: {
        color: c.foreground,
      },
      axisPointer: {
        type: 'none',
      },
      // eslint-disable-next-line
      position(point: any, params: any, dom: any, rect: any, size: any) {
        return [point[0] - size.contentSize[0] / 2, point[1] - size.contentSize[1] - 10]
      },
      // eslint-disable-next-line
      formatter(params: any) {
        return (
          params
            // eslint-disable-next-line
            .filter((item: any) => item.seriesName !== 'bar' && item.value >= 0)
            // eslint-disable-next-line
            .map((item: any) => {
              return `${t(`statistics.chart.${item.seriesName}`)}: ${item.value || 0} ${formatedCurrency}`
            })
            .join('<br/>')
        )
      },
    },
    xAxis: {
      type: 'category',
      data: transactionAmountByDate.value.map((_, index) => {
        return index
      }),
      axisLabel: {
        color: c.mutedForeground,
        // eslint-disable-next-line
        formatter(value: any) {
          const parsedDate = new Date(transactionAmountByDate.value[value].date)
          return `${parsedDate.getDate()}.${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
        },
      },
      axisLine: {
        lineStyle: {
          color: c.border,
        },
      },
      offset: 0,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      show: false,
    },
    series: [
      {
        id: 'line',
        name: 'amount',
        data: transactionAmountByDate.value.map((data) => data?.amount && Math.round(data.amount)),
        type: 'line',
        smooth: false,
        showSymbol: false,
        symbolSize: 12,
        symbol: 'circle',
        encode: {
          x: 'Date',
          y: 'Amount',
          itemName: 'Date',
          tooltip: ['Amount'],
        },
        lineStyle: {
          color: c.primary,
          width: 2,
        },
        itemStyle: {
          color: c.card,
          borderColor: c.primary,
          borderWidth: 2,
        },
        // Hovering with an axis tooltip otherwise puts non-focused marks into ECharts' blur state,
        // which fades the whole line/area out. Disabling emphasis keeps the line drawn; the tooltip
        // (independent of emphasis) still shows.
        emphasis: { disabled: true },
        areaStyle: {
          opacity: 0.08,
          color: c.primary,
        },
      },
      {
        name: 'bar',
        id: 'bar',
        data: transactionAmountByDate.value.map((data) => data?.amount && Math.round(data.amount)),
        type: 'bar',
        barWidth: 2,
        barGap: '0%',
        showSymbol: false,
        label: {
          show: false,
        },
        itemStyle: {
          borderRadius: 4,
          color: c.muted,
          opacity: 0.6,
        },
        emphasis: { disabled: true },
        z: -12,
      },
      {
        id: 'line2',
        name: 'average',
        data: transactionAmountByDate.value.map((data) => Math.round(data.average)),
        type: 'line',
        smooth: false,
        showSymbol: false,
        symbolSize: 12,
        symbol: 'circle',
        encode: {
          x: 'Date',
          y: 'Amount',
          itemName: 'Date',
          tooltip: ['Amount'],
        },
        lineStyle: {
          color: c.mutedForeground,
          width: 2,
          type: 'dotted',
        },
        itemStyle: {
          color: c.card,
          borderColor: c.mutedForeground,
          borderWidth: 2,
        },
        emphasis: { disabled: true },
      },
    ],
  }
})
</script>

<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<style scoped>
.chart {
  width: 100%;
  height: 180px;
}
</style>
