import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope, nextTick, type EffectScope } from 'vue'
import { setActivePinia, createPinia } from 'pinia'

// Мокаем REST-сервис и useMe до импорта хуков.
vi.mock('@/api/services/transaction.service', () => ({
  transactionApi: {
    findAll: vi.fn(),
  },
}))

vi.mock('@/hooks/auth-hooks.ts', async () => {
  const { ref } = await import('vue')
  const user = ref<{ currency: string; monthStartDay: number } | null>(null)
  return {
    useMe: () => ({ user }),
  }
})

import { transactionApi } from '@/api/services/transaction.service'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useMonthlyTransactions } from './transaction-hooks'
import { useTransactionsStore } from '@/stores/transactionsStore'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'

const findAll = transactionApi.findAll as ReturnType<typeof vi.fn>

const mayDate = new Date(2026, 4, 20) // фин. месяц при monthStartDay=6: 06.05–05.06
const monthStartDay = 6

const dtoEur = {
  id: 1,
  amount: 52,
  currency: 'EUR',
  date: '2026-05-20T00:00:00.000Z',
  categoryId: 'food--groceries',
  description: 'Продукти',
  planningId: null,
  createdAt: '2026-05-20T10:00:00.000Z',
  exchangeRate: { rates: { USD: 1.08, EUR: 1 } },
}

const dtoUsd = {
  ...dtoEur,
  id: 2,
  amount: 108,
  currency: 'USD',
}

describe('useMonthlyTransactions', () => {
  // В приложении watcher композабла живёт в scope компонента; в тесте — в явном
  // effectScope, иначе watcher'ы предыдущих тестов загрязняют счётчики вызовов.
  let scope: EffectScope
  const mount = () => {
    scope = effectScope()
    return scope.run(() => useMonthlyTransactions())!
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    findAll.mockReset()
    // useMe замокан на общий ref — выставляем юзера и месяц заново перед каждым тестом.
    const { user } = useMe()
    user.value = { currency: 'EUR', monthStartDay } as never
    const { statisticDate } = useStatisticDateStore()
    statisticDate.value = mayDate
  })

  afterEach(() => {
    scope?.stop()
  })

  it('fetches the active month immediately and maps DTOs to display transactions', async () => {
    findAll.mockResolvedValue([dtoEur, dtoUsd])
    const { transactions, loading } = mount()

    expect(findAll).toHaveBeenCalledTimes(1)
    expect(loading.value).toBe(true)

    await vi.waitFor(() => expect(loading.value).toBe(false))
    expect(transactions.value).toHaveLength(2)
    // Маппинг: id строкой, конвертация USD -> EUR по курсам (108 / 1.08 = 100).
    expect(transactions.value[0].id).toBe('1')
    expect(transactions.value[1].amount).toBeCloseTo(100, 6)
    expect(transactions.value[1].originalCurrency).toBe('USD')
  })

  it('fetches the new month when the selected month changes', async () => {
    findAll.mockResolvedValue([dtoEur])
    mount()
    await vi.waitFor(() => expect(findAll).toHaveBeenCalledTimes(1))

    const { statisticDate } = useStatisticDateStore()
    statisticDate.value = new Date(2026, 5, 20) // следующий фин. месяц: 06.06–05.07
    await vi.waitFor(() => expect(findAll).toHaveBeenCalledTimes(2))

    const [startDate] = findAll.mock.calls[1]
    expect(startDate).toContain('2026-06')
  })

  it('returns to a cached month without refetching', async () => {
    findAll.mockResolvedValue([dtoEur])
    mount()
    await vi.waitFor(() => expect(findAll).toHaveBeenCalledTimes(1))

    const { statisticDate } = useStatisticDateStore()
    statisticDate.value = new Date(2026, 5, 20)
    await vi.waitFor(() => expect(findAll).toHaveBeenCalledTimes(2))

    statisticDate.value = mayDate
    await nextTick()
    await nextTick()
    expect(findAll).toHaveBeenCalledTimes(2) // май уже в кэше
  })

  it('refetches when the active month is invalidated (refetch bridge)', async () => {
    findAll.mockResolvedValue([dtoEur])
    mount()
    await vi.waitFor(() => expect(findAll).toHaveBeenCalledTimes(1))

    const store = useTransactionsStore()
    store.invalidate(mayDate, monthStartDay)
    await vi.waitFor(() => expect(findAll).toHaveBeenCalledTimes(2))
  })

  it('exposes the error state and clears it after a successful refetch', async () => {
    findAll.mockRejectedValueOnce(new Error('network'))
    findAll.mockResolvedValue([dtoEur])
    const { error, refetch, transactions } = mount()

    await vi.waitFor(() => expect(error.value).toBe(true))
    expect(transactions.value).toHaveLength(0)

    refetch()
    await vi.waitFor(() => expect(error.value).toBe(false))
    expect(transactions.value).toHaveLength(1)
  })

  it('refetch() forces a reload of an already cached month', async () => {
    findAll.mockResolvedValue([dtoEur])
    const { refetch } = mount()
    await vi.waitFor(() => expect(findAll).toHaveBeenCalledTimes(1))

    refetch()
    await vi.waitFor(() => expect(findAll).toHaveBeenCalledTimes(2))
  })
})
