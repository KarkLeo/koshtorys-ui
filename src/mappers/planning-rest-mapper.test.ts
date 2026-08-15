import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { effectScope, type EffectScope } from 'vue'
import type { components } from '@/api/types'

type Plan = components['schemas']['PlanResponseDto']

// usePlanningMapperRest pulls in useI18n, useMe, useMonthlyPlanning and
// useMonthlyTransactions — mock all four so this is a true unit test of the mapper's
// own logic (the `ready` gate and the honesty of the converted-vs-fallback currency
// label), not an integration test of the underlying REST hooks.
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

vi.mock('@/hooks/auth-hooks', async () => {
  const { ref } = await import('vue')
  const user = ref<{ currency: string; monthStartDay: number; monthlyBudget?: number } | null>(null)
  return { useMe: () => ({ user }) }
})

vi.mock('@/hooks/planning-rest-hooks', async () => {
  const { ref } = await import('vue')
  const plans = ref<Plan[]>([])
  const repeating = ref<Plan[]>([])
  const rates = ref<Record<string, number>>({})
  const loading = ref(false)
  return {
    useMonthlyPlanning: () => ({
      plans,
      repeating,
      rates,
      loading,
      invalidate: async () => {},
      refetch: async () => {},
    }),
  }
})

vi.mock('@/hooks/transaction-hooks', async () => {
  const { ref } = await import('vue')
  const transactions = ref<import('@/components/transaction/types').DisplayTransaction[]>([])
  return { useMonthlyTransactions: () => ({ transactions }) }
})

import { useMe } from '@/hooks/auth-hooks'
import { useMonthlyPlanning } from '@/hooks/planning-rest-hooks'
import { usePlanningMapperRest } from './planning-rest-mapper'

const basePlan = (over: Partial<Plan>): Plan => ({
  id: 1,
  type: 'TRANSACTION',
  userId: 1,
  date: null,
  monthIndex: 6,
  year: 2026,
  amount: 100,
  description: 'A plan',
  currency: 'EUR',
  categoryId: 'food--groceries',
  repeat: false,
  repeatedPlanningId: null,
  parentPlanningId: null,
  createdAt: '2026-07-01T00:00:00Z',
  updatedAt: '2026-07-01T00:00:00Z',
  ...over,
})

describe('usePlanningMapperRest', () => {
  let scope: EffectScope
  const mount = () => {
    scope = effectScope()
    return scope.run(() => usePlanningMapperRest())!
  }

  beforeEach(() => {
    const { user } = useMe()
    user.value = { currency: 'EUR', monthStartDay: 1, monthlyBudget: 1000 } as never
  })

  afterEach(() => {
    scope?.stop()
  })

  it('maps plans even when rates is {} (the loosened `ready` gate)', () => {
    const { plans } = useMonthlyPlanning()
    plans.value = [basePlan({ id: 1, currency: 'EUR', amount: 50 })]
    // rates.value is already {} from the mock's initial state.

    const { planningTables } = mount()
    const items = planningTables.value.flatMap((t) => t.items)
    expect(items).toHaveLength(1)
    expect(items[0].amount).toBe(50)
  })

  it('labels a non-base-currency plan with its own currency (not base) when rates are missing', () => {
    const { plans, rates } = useMonthlyPlanning()
    plans.value = [basePlan({ id: 2, currency: 'USD', amount: 90 })]
    rates.value = {} // no exchange rate available — cannot convert USD -> EUR

    const { planningTables } = mount()
    const items = planningTables.value.flatMap((t) => t.items)
    expect(items).toHaveLength(1)
    // The number shown must match the currency it's labelled with: unconverted 90, in USD ($).
    expect(items[0].amount).toBe(90)
    expect(items[0].currency).toBe('$')
    // No contradicting "original" hint either — the primary figure already *is* the original.
    expect(items[0].originalAmount).toBeNull()
    expect(items[0].originalCurrency).toBeNull()
  })

  it('converts and labels with base currency, showing the original as a secondary hint, when rates are available', () => {
    const { plans, rates } = useMonthlyPlanning()
    plans.value = [basePlan({ id: 3, currency: 'USD', amount: 108 })]
    rates.value = { USD: 1.08, EUR: 1 }

    const { planningTables } = mount()
    const items = planningTables.value.flatMap((t) => t.items)
    expect(items).toHaveLength(1)
    expect(items[0].amount).toBe(100) // 108 / 1.08 * 1
    expect(items[0].currency).toBe('€')
    expect(items[0].originalAmount).toBe(108)
    expect(items[0].originalCurrency).toBe('$')
  })
})
