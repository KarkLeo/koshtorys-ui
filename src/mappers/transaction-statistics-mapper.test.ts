import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest'
import { effectScope, type EffectScope, type Ref } from 'vue'
import type { DisplayTransaction } from '@/components/transaction/types'

// useTransactionStatisticsMapper pulls in useMe, useMonthlyTransactions and
// useTransactionsStatistic — mock them so this tests the mapper's own date logic.
vi.mock('@/hooks/auth-hooks', async () => {
  const { ref } = await import('vue')
  const user = ref({ currency: 'UAH', monthStartDay: 20 })
  return { useMe: () => ({ user }) }
})

vi.mock('@/hooks/transaction-hooks', async () => {
  const { ref } = await import('vue')
  const transactions = ref<DisplayTransaction[]>([])
  const byCategory = ref([])
  const byMonthDay = ref([])
  return {
    useMonthlyTransactions: () => ({ transactions, loading: ref(false) }),
    useTransactionsStatistic: () => ({ byCategory, byMonthDay, loading: ref(false) }),
  }
})

import { useMonthlyTransactions, useTransactionsStatistic } from '@/hooks/transaction-hooks'
import { useTransactionStatisticsMapper } from './transaction-statistics-mapper'

const tx = (id: string, isoDate: string, amount: number): DisplayTransaction => ({
  id,
  amount,
  currency: 'UAH',
  categoryId: 'food--groceries',
  date: new Date(isoDate),
  createdAt: new Date(isoDate),
})

let scope: EffectScope

const mount = () => {
  // The real hook returns a read-only computed; the mock above hands out a writable ref.
  const { transactions } = useMonthlyTransactions() as unknown as {
    transactions: Ref<DisplayTransaction[]>
  }
  transactions.value = [
    tx('1', '2026-10-20T10:00:00Z', 1200), // 13:00 on the 20th, Kyiv time
    tx('2', '2026-10-20T21:30:00Z', 450), // 00:30 on the 21st, Kyiv time
  ]
  const { byMonthDay } = useTransactionsStatistic()
  byMonthDay.value = Array.from({ length: 31 }, (_, i) => ({
    period_index: i + 1,
    total: 100,
    average: 100,
    count_of_month: 1,
  }))

  scope = effectScope()
  return scope.run(() => useTransactionStatisticsMapper())!
}

const inTimezone = (tz: string) => {
  const originalTz = process.env.TZ

  beforeAll(() => {
    process.env.TZ = tz
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-22T12:00:00Z'))
  })

  afterAll(() => {
    vi.useRealTimers()
    process.env.TZ = originalTz
  })

  afterEach(() => scope?.stop())
}

describe.each([
  ['Europe/Kyiv', -180],
  ['UTC', 0],
  ['America/New_York', 240],
])('useTransactionStatisticsMapper — daily dynamics in %s', (tz, offset) => {
  inTimezone(tz)

  it('runs in the requested timezone', () => {
    expect(new Date(2026, 9, 20).getTimezoneOffset()).toBe(offset)
  })

  it('covers exactly the financial month, one point per day', () => {
    const points = mount().transactionAmountByDate.value

    expect(points).toHaveLength(31)
    expect(points[0]!.date).toBe('2026-10-20')
    expect(points.at(-1)!.date).toBe('2026-11-19')
  })
})

// Kyiv is UTC+3 here: local midnight of a day is still the previous day in UTC, which is
// exactly where a UTC day key and a local calendar disagree.
describe('useTransactionStatisticsMapper — transactions near midnight east of UTC', () => {
  inTimezone('Europe/Kyiv')

  it('puts each transaction on its local calendar day', () => {
    const points = mount().transactionAmountByDate.value
    const amountOn = (date: string) => points.find((p) => p.date === date)?.amount

    expect(amountOn('2026-10-20')).toBe(1200)
    expect(amountOn('2026-10-21')).toBe(1650)
  })
})
