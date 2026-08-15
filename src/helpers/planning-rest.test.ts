import { describe, it, expect } from 'vitest'
import {
  getPlanSpent,
  getConvertedPlanAmount,
  filterRepeatingPlans,
  reducePlansByCategory,
  countLinkedTransactions,
  type PreparedPlan,
} from '@/helpers/planning-rest'
import type { components } from '@/api/types'
import type { DisplayTransaction } from '@/components/transaction/types'

type Plan = components['schemas']['PlanResponseDto']

const basePlan = (over: Partial<Plan>): Plan => ({
  id: 1, type: 'CATEGORY', userId: 1, date: null, monthIndex: 6, year: 2026,
  amount: 100, description: null, currency: 'EUR', categoryId: 'food--groceries',
  repeat: false, repeatedPlanningId: null, parentPlanningId: null,
  createdAt: '2026-07-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z', ...over,
})

const tx = (over: Partial<DisplayTransaction>): DisplayTransaction => ({
  id: '1', amount: 10, currency: 'EUR', categoryId: 'food--groceries',
  date: new Date('2026-07-02'), createdAt: new Date('2026-07-02'),
  planningId: null, ...over,
})

describe('getPlanSpent', () => {
  it('one-off: sums transactions linked to the plan id', () => {
    const plan = basePlan({ id: 5, type: 'TRANSACTION' })
    const txs = [tx({ id: 'a', amount: 30, planningId: '5' }), tx({ id: 'b', amount: 7, planningId: '9' })]
    expect(getPlanSpent(plan, txs)).toBe(30)
  })
  it('dynamic: sums category transactions NOT linked to a one-off plan', () => {
    const plan = basePlan({ id: 5, type: 'CATEGORY', categoryId: 'food--groceries' })
    const txs = [
      tx({ id: 'a', amount: 30, categoryId: 'food--groceries', planningId: null }),
      tx({ id: 'b', amount: 5, categoryId: 'food--groceries', planningId: '7' }), // linked → excluded
      tx({ id: 'c', amount: 9, categoryId: 'car--fuel', planningId: null }), // other cat
    ]
    expect(getPlanSpent(plan, txs)).toBe(30)
  })
})

describe('getConvertedPlanAmount', () => {
  it('returns amount unchanged when plan currency == base', () => {
    expect(getConvertedPlanAmount(basePlan({ amount: 100, currency: 'EUR' }), { EUR: 0.9, USD: 1 }, 'EUR')).toBe(100)
  })
  it('converts via rates when currencies differ', () => {
    // 100 USD → EUR with USD:1, EUR:0.9  => (100/1)*0.9 = 90
    expect(getConvertedPlanAmount(basePlan({ amount: 100, currency: 'USD' }), { USD: 1, EUR: 0.9 }, 'EUR')).toBe(90)
  })
  it('converts in reverse direction (EUR → USD)', () => {
    // 90 EUR → USD with USD:1, EUR:0.9  => (90/0.9)*1 = 100
    expect(getConvertedPlanAmount(basePlan({ amount: 90, currency: 'EUR' }), { USD: 1, EUR: 0.9 }, 'USD')).toBe(100)
  })
  it('falls back to the unconverted amount when rates are missing (e.g. exchange-rate fetch failed)', () => {
    expect(getConvertedPlanAmount(basePlan({ amount: 90, currency: 'USD' }), {}, 'EUR')).toBe(90)
  })
})

describe('filterRepeatingPlans', () => {
  it('drops a repeating CATEGORY plan if the same category already planned this month', () => {
    const repeating = [basePlan({ id: 10, type: 'CATEGORY', categoryId: 'food--groceries' })]
    const current = [basePlan({ id: 20, type: 'CATEGORY', categoryId: 'food--groceries' })]
    expect(filterRepeatingPlans(repeating, current)).toHaveLength(0)
  })
  it('drops a repeating plan already carried over (current.repeatedPlanningId === rp.id)', () => {
    const repeating = [basePlan({ id: 10, categoryId: 'car--fuel' })]
    const current = [basePlan({ id: 20, categoryId: 'food--groceries', repeatedPlanningId: 10 })]
    expect(filterRepeatingPlans(repeating, current)).toHaveLength(0)
  })
  it('drops a repeating plan already carried over (rp.repeatedPlanningId === current.id)', () => {
    const repeating = [basePlan({ id: 10, categoryId: 'car--fuel', repeatedPlanningId: 20 })]
    const current = [basePlan({ id: 20, categoryId: 'food--groceries' })]
    expect(filterRepeatingPlans(repeating, current)).toHaveLength(0)
  })
  it('drops a repeating plan when current.parentPlanningId === rp.id', () => {
    const repeating = [basePlan({ id: 10, categoryId: 'car--fuel' })]
    const current = [basePlan({ id: 20, categoryId: 'food--groceries', parentPlanningId: 10 })]
    expect(filterRepeatingPlans(repeating, current)).toHaveLength(0)
  })
  it('drops a repeating plan when rp.parentPlanningId === current.id', () => {
    const repeating = [basePlan({ id: 10, categoryId: 'car--fuel', parentPlanningId: 20 })]
    const current = [basePlan({ id: 20, categoryId: 'food--groceries' })]
    expect(filterRepeatingPlans(repeating, current)).toHaveLength(0)
  })
  it('drops a repeating plan when sharing the same parentPlanningId', () => {
    const repeating = [basePlan({ id: 10, categoryId: 'car--fuel', parentPlanningId: 99 })]
    const current = [basePlan({ id: 20, categoryId: 'food--groceries', parentPlanningId: 99 })]
    expect(filterRepeatingPlans(repeating, current)).toHaveLength(0)
  })
  it('keeps an unrelated repeating plan', () => {
    const repeating = [basePlan({ id: 10, categoryId: 'car--fuel' })]
    const current = [basePlan({ id: 20, categoryId: 'food--groceries' })]
    expect(filterRepeatingPlans(repeating, current)).toHaveLength(1)
  })
})

describe('countLinkedTransactions', () => {
  it('counts transactions linked to this plan by planningId', () => {
    const plan = basePlan({ id: 7, type: 'TRANSACTION' })
    const transactions = [
      tx({ id: '1', planningId: '7', amount: 10 }),
      tx({ id: '2', planningId: '7', amount: 20 }),
      tx({ id: '3', planningId: null, amount: 30 }),
    ]
    expect(countLinkedTransactions(plan, transactions)).toBe(2)
  })

  it('compares ids as strings', () => {
    const plan = basePlan({ id: 7, type: 'TRANSACTION' })
    expect(countLinkedTransactions(plan, [tx({ id: '1', planningId: '7', amount: 10 })])).toBe(1)
  })

  it('returns 0 when nothing is linked', () => {
    const plan = basePlan({ id: 7, type: 'TRANSACTION' })
    expect(countLinkedTransactions(plan, [tx({ id: '1', planningId: null, amount: 10 })])).toBe(0)
  })
})

describe('reducePlansByCategory', () => {
  it('groups by main category, sums totals, sorts groups by total desc', () => {
    const p = (over: Partial<PreparedPlan>): PreparedPlan => ({
      original: basePlan({}), id: '1', type: 'CATEGORY', amount: 10, currency: '€',
      spent: 0, categoryId: 'food--groceries', categoryName: 'Groceries',
      mainCategory: 'food', categoryColor: '#f00', repeat: false, linkedCount: 0, ...over,
    })
    const groups = reducePlansByCategory([
      p({ id: '1', mainCategory: 'food', amount: 10 }),
      p({ id: '2', mainCategory: 'car', amount: 50 }),
      p({ id: '3', mainCategory: 'food', amount: 20 }),
    ])
    expect(groups[0]).toMatchObject({ category: 'car', total: 50 })
    expect(groups[1]).toMatchObject({ category: 'food', total: 30 })
    expect(groups[1].items).toHaveLength(2)
    // Verify intra-group items are sorted by amount desc: p3 (20) before p1 (10)
    expect(groups[1].items.map((i) => i.id)).toEqual(['3', '1'])
  })
})
