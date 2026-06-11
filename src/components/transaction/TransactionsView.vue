<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MonthSwitcher from '@/components/MonthSwitcher.vue'
import BudgetProgress from './BudgetProgress.vue'
import TransactionsToolbar from './TransactionsToolbar.vue'
import TransactionCard from './TransactionCard.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { filterAndSortTransactions } from '@/helpers/transaction-filters.ts'
import {
  createEmptyFilters,
  type DisplayTransaction,
  type TransactionFilters,
  type TransactionSort,
} from './types'

const props = defineProps<{
  transactions: DisplayTransaction[]
  loading?: boolean
  monthStartDay: number
  monthlyBudget: number
  currency: string
  budgetVariant?: 'bar' | 'wave'
  /** Только для Storybook: стартовое состояние фильтров */
  initialFilters?: TransactionFilters
}>()

const emit = defineEmits<{ edit: [id: string]; delete: [id: string] }>()

const month = defineModel<Date>('month', { default: () => new Date() })

const filters = ref<TransactionFilters>(props.initialFilters ?? createEmptyFilters())
const sort = ref<TransactionSort>('date-desc')

// Фильтры месяца не должны молча прятать данные другого месяца.
watch(month, () => {
  filters.value = createEmptyFilters()
})

const visible = computed(() =>
  filterAndSortTransactions(props.transactions, filters.value, sort.value),
)

// Бюджет считается по всему месяцу, не по отфильтрованному списку.
const spent = computed(() =>
  props.transactions.reduce((acc, transaction) => acc + transaction.amount, 0),
)

const hasActiveFilters = computed(
  () =>
    filters.value.search !== '' ||
    filters.value.categories.length > 0 ||
    filters.value.plan !== 'all',
)
</script>

<template>
  <div class="mx-auto flex w-full max-w-[600px] flex-col gap-4">
    <MonthSwitcher v-model="month" :month-start-day="monthStartDay" />

    <BudgetProgress
      :current="spent"
      :max="monthlyBudget"
      :currency="currency"
      :variant="budgetVariant"
    />

    <TransactionsToolbar v-model:filters="filters" v-model:sort="sort" />

    <template v-if="loading">
      <Skeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-xl" />
    </template>

    <p
      v-else-if="transactions.length === 0"
      class="mt-6 text-center text-sm italic text-muted-foreground"
    >
      {{ $t('transaction.list.empty') }}
    </p>

    <div
      v-else-if="visible.length === 0 && hasActiveFilters"
      class="mt-6 flex flex-col items-center gap-3"
    >
      <p class="text-sm italic text-muted-foreground">
        {{ $t('transaction.list.empty_filtered') }}
      </p>
      <Button variant="outline" size="sm" @click="filters = createEmptyFilters()">
        {{ $t('transaction.list.reset_filters') }}
      </Button>
    </div>

    <ul v-else class="m-0 flex list-none flex-col gap-3 p-0">
      <li v-for="transaction in visible" :key="transaction.id">
        <TransactionCard
          :transaction="transaction"
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </li>
    </ul>
  </div>
</template>
