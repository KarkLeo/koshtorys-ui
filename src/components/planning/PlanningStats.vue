<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'

defineProps<{
  stats: {
    monthlyBudget: number
    // null → the figure would mix converted and unconverted plan amounts (missing exchange
    // rate); render a dash rather than a number that silently isn't in one currency.
    plannedExpenses: number | null
    freeMoney: number | null
    remainingToPay: number | null
  }
  currency: string
}>()

const fmt = (n: number | null, currency: string) => (n !== null ? `${Math.round(n)} ${currency}` : '—')
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:flex">
    <Card class="w-full gap-2 py-4">
      <CardContent class="flex flex-col gap-1 px-4">
        <p class="text-xs text-muted-foreground">{{ $t('planning.header.monthlyBudget') }}</p>
        <p class="text-xl font-bold">{{ Math.round(stats.monthlyBudget) }} {{ currency }}</p>
      </CardContent>
    </Card>
    <Card class="w-full gap-2 py-4">
      <CardContent class="flex flex-col gap-1 px-4">
        <p class="text-xs text-muted-foreground">{{ $t('planning.header.plannedExpenses') }}</p>
        <p class="text-xl font-bold">{{ fmt(stats.plannedExpenses, currency) }}</p>
      </CardContent>
    </Card>
    <Card class="w-full gap-2 py-4">
      <CardContent class="flex flex-col gap-1 px-4">
        <p class="text-xs text-muted-foreground">{{ $t('planning.header.freeMoney') }}</p>
        <p class="text-xl font-bold">{{ fmt(stats.freeMoney, currency) }}</p>
      </CardContent>
    </Card>
    <Card class="w-full gap-2 py-4">
      <CardContent class="flex flex-col gap-1 px-4">
        <p class="text-xs text-muted-foreground">{{ $t('planning.header.remainingToPay') }}</p>
        <p class="text-xl font-bold">{{ fmt(stats.remainingToPay, currency) }}</p>
      </CardContent>
    </Card>
  </div>
</template>
