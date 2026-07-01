<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { useTransactionStatisticsMapper } from '@/mappers/transaction-statistics-mapper.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { getMainCategory } from '@/helpers/category.ts'
import { useI18n } from 'vue-i18n'
import { useMe } from '@/hooks/auth-hooks.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

const { reducedTransactionsByCategory } = useTransactionStatisticsMapper()
const { user } = useMe()
const { t } = useI18n()

const getCategoriesLabel = (category: string) => t(`categories.${category}`)
const getCategoryStyle = (category: string) =>
  TRANSACTION_CATEGORIES_COLORS[getMainCategory(category)] || ''

const option = computed(() => {
  const formatedCurrency = CURRENCIES_SYMBOL[user.value?.currency as string] || user.value?.currency

  return {
    backgroundColor: 'transparent',
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      containLabel: true,
    },
    textStyle: {
      fontFamily: `'Inter', sans-serif`,
      color: `#F5F5F6`,
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#0C111D',
      textStyle: {
        fontFamily: `'Inter', sans-serif`,
        color: `#F5F5F6`,
      },
      // eslint-disable-next-line
      formatter(params: any) {
        return `${params.name}: ${params.value} ${formatedCurrency}`
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          fontSize: 1,
          position: 'center',
          backgroundColor: 'transparent',
          fontFamily: `'Inter', sans-serif`,
          color: `#F5F5F6`,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: 'regular',
            fontFamily: `'Inter', sans-serif`,
            color: `#F5F5F6`,
          },
        },
        labelLine: {
          show: false,
        },
        data: reducedTransactionsByCategory.value.map((category) => ({
          name: getCategoriesLabel(category.categoryId),
          value: Math.round(category.amount),
        })),
        itemStyle: {
          borderRadius: 2,
          borderColor: '#0C111D',
          borderWidth: 1,
          // eslint-disable-next-line
          color: function (params: any) {
            const colors = reducedTransactionsByCategory.value.map((category) =>
              getCategoryStyle(category.categoryId),
            )
            return colors[params.dataIndex]
          },
        },
      },
    ],
  }
})
</script>

<template>
  <v-chart v-if="reducedTransactionsByCategory.length" class="chart" :option="option" autoresize />
</template>

<style scoped>
.chart {
  width: 100%;
  aspect-ratio: 1;
}
</style>
