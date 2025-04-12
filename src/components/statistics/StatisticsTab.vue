<script setup lang="ts">
import KitMonthSwitcher from '@/components/kit/KitMonthSwitcher.vue'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import TrPieChart from '@/components/statistics/TrPieChart.vue'
import TrLineChart from '@/components/statistics/TrLineChart.vue'
import TrBarChart from '@/components/statistics/TrBarChart.vue'

const { statisticDate } = useStatisticDateStore()
</script>

<template>
  <div class="chart-wrapper">
    <KitMonthSwitcher v-model="statisticDate" />
    <div class="chart-inner">
      <TrLineChart />
      <TrPieChart />
      <TrBarChart />
    </div>
  </div>
</template>
<style scoped>
.chart-wrapper {
  max-width: 600px;
  margin: 0 auto 300px;
}
.chart-inner {
  margin-top: var(--spacing-xl);
}
</style>
