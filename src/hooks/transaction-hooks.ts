import { ref, computed, watch, onMounted } from 'vue'

import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { useMe } from '@/hooks/auth-hooks.ts'

import { transactionApi } from '@/api/services/transaction.service'
import type { CreateTransactionDto, UpdateTransactionDto } from '@/helpers/transaction-form'
import { useTransactionsStore, monthKeyOf } from '@/stores/transactionsStore.ts'
import { toDisplayTransaction } from '@/mappers/transaction-mapper.ts'
import type { DisplayTransaction } from '@/components/transaction/types'
import type { components } from '@/api/types'

type TransactionsByCategoryResponseDto = components['schemas']['TransactionsByCategoryResponseDto']
type TransactionsByMonthDayResponseDto = components['schemas']['TransactionsByMonthDayResponseDto']

export function useCreateTransaction() {
  const { user } = useMe()
  const store = useTransactionsStore()
  const loading = ref(false)

  const createTransaction = async (dto: CreateTransactionDto) => {
    loading.value = true
    try {
      const created = await transactionApi.create(dto)
      store.invalidate(new Date(created.date), user.value?.monthStartDay || 1)
      return created
    } finally {
      loading.value = false
    }
  }

  return { createTransaction, loading }
}

export function useDeleteTransaction() {
  const { user } = useMe()
  const store = useTransactionsStore()
  const loading = ref(false)

  const deleteTransaction = async (id: number) => {
    loading.value = true
    try {
      const deleted = await transactionApi.delete(id)
      store.invalidate(new Date(deleted.date), user.value?.monthStartDay || 1)
      return deleted
    } finally {
      loading.value = false
    }
  }

  return { deleteTransaction, loading }
}

export function useUpdateTransaction() {
  const { user } = useMe()
  const { statisticDate } = useStatisticDateStore()
  const store = useTransactionsStore()
  const loading = ref(false)

  const updateTransaction = async (id: number, dto: UpdateTransactionDto) => {
    loading.value = true
    try {
      const updated = await transactionApi.update(id, dto)
      // Инвалидируем месяц назначения транзакции И текущий просматриваемый месяц:
      // при переносе транзакции в другой месяц нужно обновить оба. НЕ удалять второй вызов.
      store.invalidate(new Date(updated.date), user.value?.monthStartDay || 1)
      store.invalidate(statisticDate.value, user.value?.monthStartDay || 1)
      return updated
    } finally {
      loading.value = false
    }
  }

  return { updateTransaction, loading }
}

/**
 * Cross-month spending averages (per category and per day-of-month) for the statistics charts.
 * These endpoints take no date — they are global averages over all months, so we fetch once.
 */
export function useTransactionsStatistic() {
  const byCategory = ref<TransactionsByCategoryResponseDto[]>([])
  const byMonthDay = ref<TransactionsByMonthDayResponseDto[]>([])
  const loading = ref(false)

  onMounted(async () => {
    loading.value = true
    try {
      const [categories, monthDays] = await Promise.all([
        transactionApi.statisticsByCategory(),
        transactionApi.statisticsByMonthDay(),
      ])
      byCategory.value = categories
      // The line chart consumes the daily averages in day order.
      byMonthDay.value = [...monthDays].sort((a, b) => a.period_index - b.period_index)
    } finally {
      loading.value = false
    }
  })

  return { byCategory, byMonthDay, loading }
}

export function useMonthlyTransactions() {
  const { statisticDate } = useStatisticDateStore()
  const { user } = useMe()
  const store = useTransactionsStore()

  const monthStartDay = computed(() => user.value?.monthStartDay ?? 1)
  const monthKey = computed(() => monthKeyOf(statisticDate.value, monthStartDay.value))

  // Единый реактивный эффект: грузит месяц при смене и реагирует на инвалидацию
  // активного месяца (мост удалил ключ -> has стал false -> дозагрузка).
  watch(
    () => [monthKey.value, store.has(monthKey.value)] as const,
    () => {
      if (!store.has(monthKey.value) && !store.isLoading(monthKey.value)) {
        store.fetchMonth(statisticDate.value, monthStartDay.value)
      }
    },
    { immediate: true },
  )

  const transactions = computed<DisplayTransaction[]>(() => {
    const currency = user.value?.currency
    const raw = store.getMonth(monthKey.value)
    if (!currency || !raw) return []
    return raw.map((dto) => toDisplayTransaction(dto, currency))
  })

  const loading = computed(() => store.isLoading(monthKey.value))
  const error = computed(() => store.hasError(monthKey.value))
  const refetch = () => store.fetchMonth(statisticDate.value, monthStartDay.value, { force: true })

  return { transactions, loading, error, refetch }
}
