<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps<{
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

// Warn as planned expenses approach the budget, alarm once they cross it. `text-primary` is the
// app's amber/orange brand colour; `text-destructive` is red. Empty string = default text colour.
const plannedExpensesClass = computed(() => {
  const { plannedExpenses, monthlyBudget } = props.stats
  if (plannedExpenses === null || monthlyBudget <= 0) return ''
  if (plannedExpenses > monthlyBudget) return 'text-destructive'
  if (plannedExpenses > monthlyBudget * 0.8) return 'text-primary'
  return ''
})

// Negative free money means spending has outgrown the budget — flag it red.
const freeMoneyClass = computed(() =>
  props.stats.freeMoney !== null && props.stats.freeMoney < 0 ? 'text-destructive' : '',
)
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:flex">
    <Card class="w-full gap-2 py-4">
      <CardContent class="flex flex-1 flex-col gap-1 px-4">
        <p class="text-xs text-muted-foreground">{{ $t('planning.header.monthlyBudget') }}</p>
        <p class="mt-auto text-xl font-bold">{{ Math.round(stats.monthlyBudget) }} {{ currency }}</p>
      </CardContent>
    </Card>
    <Card class="w-full gap-2 py-4">
      <CardContent class="flex flex-1 flex-col gap-1 px-4">
        <p class="text-xs text-muted-foreground">{{ $t('planning.header.plannedExpenses') }}</p>
        <p class="mt-auto text-xl font-bold" :class="plannedExpensesClass">
          {{ fmt(stats.plannedExpenses, currency) }}
        </p>
      </CardContent>
    </Card>
    <Card class="w-full gap-2 py-4">
      <CardContent class="flex flex-1 flex-col gap-1 px-4">
        <p class="text-xs text-muted-foreground">{{ $t('planning.header.freeMoney') }}</p>
        <p class="mt-auto text-xl font-bold" :class="freeMoneyClass">
          {{ fmt(stats.freeMoney, currency) }}
        </p>
      </CardContent>
    </Card>
    <Card class="w-full gap-2 py-4">
      <CardContent class="flex flex-1 flex-col gap-1 px-4">
        <p class="text-xs text-muted-foreground">{{ $t('planning.header.remainingToPay') }}</p>
        <p class="mt-auto text-xl font-bold">{{ fmt(stats.remainingToPay, currency) }}</p>
      </CardContent>
    </Card>
  </div>
</template>
