<script setup lang="ts">
import MonthSwitcher from '@/components/MonthSwitcher.vue'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TrPieChart from '@/components/statistics/TrPieChart.vue'
import TrLineChart from '@/components/statistics/TrLineChart.vue'
import TrBarChart from '@/components/statistics/TrBarChart.vue'

const { statisticDate } = useStatisticDateStore()
const { user } = useMe()
</script>

<template>
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pb-4 pt-4">
    <MonthSwitcher v-model="statisticDate" :month-start-day="user?.monthStartDay ?? 1" />

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ $t('statistics.titles.dynamics') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <TrLineChart />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ $t('statistics.titles.byCategory') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <TrPieChart />
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">{{ $t('statistics.titles.comparison') }}</CardTitle>
      </CardHeader>
      <CardContent>
        <TrBarChart />
      </CardContent>
    </Card>
  </div>
</template>
