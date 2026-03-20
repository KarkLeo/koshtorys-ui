<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use, graphic } from 'echarts/core'
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

const option = computed(() => {
  const formatedCurrency =
    CURRENCIES_SYMBOL[user.value?.currency as string] || user.value?.currency

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
      backgroundColor: '#222',
      borderColor: '#444',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
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
        color: '#94979C',
        // eslint-disable-next-line
        formatter(value: any) {
          const parsedDate = new Date(transactionAmountByDate.value[value].date)
          return `${parsedDate.getDate()}.${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
        },
      },
      axisLine: {
        lineStyle: {
          color: '#373A41',
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
          color: '#7F56D9',
          width: 2,
        },
        itemStyle: {
          color: '#0C111D',
          borderColor: '#7F56D9',
          borderWidth: 2,
        },
        emphasis: {
          itemStyle: {
            color: '#0C111D',
            borderColor: '#7F56D9',
            borderWidth: 2,
          },
        },
        areaStyle: {
          opacity: 1,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(127,86,217,0.05)',
            },
            {
              offset: 1,
              color: 'rgba(127,86,217,0)',
            },
          ]),
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
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(55,58,65,0.8)' },
            { offset: 1, color: 'rgba(55,58,65,0.2)' },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#7F56D9' },
              { offset: 1, color: 'rgba(127,86,217,0.2)' },
            ]),
          },
        },
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
          color: '#373A41',
          width: 2,
          type: 'dotted',
        },
        itemStyle: {
          color: '#0C111D',
          borderColor: '#373A41',
          borderWidth: 2,
        },
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
