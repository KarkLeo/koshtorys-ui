<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { useTransactionStatisticsMapper } from '@/mappers/transaction-statistics-mapper.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { getMainCategory } from '@/helpers/category.ts'
import { useI18n } from 'vue-i18n'
import { useMe } from '@/hooks/auth-hooks.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'

use([CanvasRenderer, BarChart, TitleComponent, TooltipComponent, LegendComponent])

const { transactionsByAllCategory } = useTransactionStatisticsMapper()
const { user } = useMe()
const { t } = useI18n()

const getCategoriesLabel = (category: string) => t(`categories.${category}`)
const getCategoryStyle = (category: string) =>
  TRANSACTION_CATEGORIES_COLORS[getMainCategory(category)] || ''

const option = computed(() => {
  const colors = transactionsByAllCategory.value.map((category) =>
    getCategoryStyle(category.categoryId),
  )

  const formatedCurrency = CURRENCIES_SYMBOL[user.value?.currency as string] || user.value?.currency

  const options = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none',
      },
      backgroundColor: '#222',
      borderColor: '#444',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
      },
      // eslint-disable-next-line
      formatter: function (params: any) {
        // eslint-disable-next-line
        const current = params.find((p: any) => p.seriesName === 'current')
        // eslint-disable-next-line
        const average = params.find((p: any) => p.seriesName === 'average')
        return `
      <b>${current.name}</b><br/>
      ${t(`statistics.chart.amount`)}: ${current.value} ${formatedCurrency}<br/>
      ${t(`statistics.chart.average`)}: ${average.value} ${formatedCurrency}
    `
      },
    },
    grid: {
      left: 20,
      right: 0,
      top: 20,
      bottom: 0,
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      show: false,
    },
    yAxis: {
      type: 'category',
      show: false,
      data: transactionsByAllCategory.value.map((category) =>
        getCategoriesLabel(category.categoryId),
      ),
    },
    series: [
      {
        emphasis: {
          disabled: true,
        },
        name: 'current',
        type: 'bar',
        barWidth: 20,
        barGap: 0,
        label: {
          show: true,
          color: '#F5F5F6',
          fontFamily: `'Inter', sans-serif`,
          // eslint-disable-next-line
          formatter: function (params: any) {
            return `${params.name}: ${params.value} ${formatedCurrency}`
          },
          position: [4, '-80%'],
          verticalAlign: 'middle',
          distance: 10,
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowBlur: 2,
          textBorderWidth: 2,
        },
        data: transactionsByAllCategory.value.map((category) => Math.round(category.amount)),
        itemStyle: {
          // eslint-disable-next-line
          color: function (params: any) {
            return colors[params.dataIndex]
          },
          borderRadius: 2,
          opacity: 1,
        },
      },
      {
        emphasis: {
          disabled: true,
        },
        name: 'average',
        type: 'bar',
        barWidth: 26,
        barGap: '-115%',
        z: 0,
        data: transactionsByAllCategory.value.map((category) => category.average),
        itemStyle: {
          // eslint-disable-next-line
          color: function (params: any) {
            return colors[params.dataIndex]
          },
          borderRadius: 2,
          opacity: 0.4,
        },
      },
    ],
  }

  return options
})
</script>

<template>
  <v-chart
    class="chart"
    :option="option"
    autoresize
    :style="{
      height: `${20 + 52 * transactionsByAllCategory.length}px`,
    }"
  />
</template>

<style scoped>
.chart {
  width: 100%;
}
</style>
