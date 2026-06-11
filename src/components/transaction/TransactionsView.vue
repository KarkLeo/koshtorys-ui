<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MonthSwitcher from '@/components/MonthSwitcher.vue'
import BudgetProgress from './BudgetProgress.vue'
import TransactionsToolbar from './TransactionsToolbar.vue'
import TransactionCard from './TransactionCard.vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { filterAndSortTransactions, groupTransactionsByDay } from '@/helpers/transaction-filters.ts'
import {
  createEmptyFilters,
  type DisplayTransaction,
  type TransactionFilters,
  type TransactionSort,
} from './types'

const props = defineProps<{
  transactions: DisplayTransaction[]
  loading?: boolean
  error?: boolean
  monthStartDay: number
  monthlyBudget: number
  currency: string
  /** Только для Storybook: стартовое состояние фильтров */
  initialFilters?: TransactionFilters
}>()

const emit = defineEmits<{ edit: [id: string]; delete: [id: string]; retry: [] }>()

const month = defineModel<Date>('month', { default: () => new Date() })

const filters = ref<TransactionFilters>(props.initialFilters ?? createEmptyFilters())
const sort = ref<TransactionSort>('date-desc')

// Фильтры месяца не должны молча прятать данные другого месяца.
watch(month, () => {
  filters.value = createEmptyFilters()
})

const { locale } = useI18n()

const visible = computed(() =>
  filterAndSortTransactions(props.transactions, filters.value, sort.value),
)

// Группы по дням — только при сортировке по дате; в остальных сортировках
// список плоский и дата показывается в самой карточке.
const groupedByDay = computed(() => sort.value === 'date-desc' || sort.value === 'date-asc')
const dayGroups = computed(() => (groupedByDay.value ? groupTransactionsByDay(visible.value) : []))

const formatDayHeader = (date: Date) =>
  date.toLocaleDateString(locale.value, { day: 'numeric', month: 'long' })

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

    <BudgetProgress :current="spent" :max="monthlyBudget" :currency="currency" />

    <TransactionsToolbar v-model:filters="filters" v-model:sort="sort" />

    <template v-if="loading">
      <Skeleton v-for="i in 3" :key="i" class="h-24 w-full rounded-xl" />
    </template>

    <div
      v-else-if="error && transactions.length === 0"
      class="mt-6 flex flex-col items-center gap-3"
    >
      <p class="text-sm italic text-muted-foreground">{{ $t('transaction.list.error') }}</p>
      <Button variant="outline" size="sm" @click="emit('retry')">
        {{ $t('transaction.list.retry') }}
      </Button>
    </div>

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

    <template v-else-if="groupedByDay">
      <section v-for="group in dayGroups" :key="group.date.getTime()" class="flex flex-col gap-2">
        <h3 class="flex items-center gap-3 text-xs font-medium text-muted-foreground">
          {{ formatDayHeader(group.date) }}
          <span class="h-px flex-1 bg-border" />
        </h3>
        <ul class="m-0 flex list-none flex-col gap-2 p-0">
          <li v-for="transaction in group.transactions" :key="transaction.id">
            <TransactionCard
              :transaction="transaction"
              @edit="emit('edit', $event)"
              @delete="emit('delete', $event)"
            />
          </li>
        </ul>
      </section>
    </template>

    <ul v-else class="m-0 flex list-none flex-col gap-2 p-0">
      <li v-for="transaction in visible" :key="transaction.id">
        <TransactionCard
          :transaction="transaction"
          show-date
          @edit="emit('edit', $event)"
          @delete="emit('delete', $event)"
        />
      </li>
    </ul>
  </div>
</template>
