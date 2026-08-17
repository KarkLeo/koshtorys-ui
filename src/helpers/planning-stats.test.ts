import { describe, it, expect } from 'vitest'
import {
  planRemainingToPay,
  planUsedBudget,
  unplannedSpending,
  computePlanningStats,
} from './planning-stats'
import type { PreparedPlan } from './planning-rest'
import type { DisplayTransaction } from '@/components/transaction/types'

const plan = (over: Partial<PreparedPlan>): PreparedPlan => ({
  original: {} as never,
  id: '1',
  type: 'TRANSACTION',
  amount: 100,
  currency: '€',
  spent: 0,
  categoryId: 'food--groceries',
  categoryName: 'Groceries',
  mainCategory: 'food',
  categoryColor: '',
  repeat: false,
  linkedCount: 0,
  converted: true,
  ...over,
})

const tx = (over: Partial<DisplayTransaction>): DisplayTransaction => ({
  id: 't1',
  amount: 10,
  currency: '€',
  categoryId: 'fun--misc',
  date: new Date('2026-08-10'),
  createdAt: new Date('2026-08-10'),
  planningId: null,
  ...over,
})

describe('planRemainingToPay', () => {
  it('one-off: full amount while open, nothing once closed', () => {
    expect(planRemainingToPay(plan({ type: 'TRANSACTION', amount: 100, spent: 0 }))).toBe(100)
    expect(planRemainingToPay(plan({ type: 'TRANSACTION', amount: 100, spent: 100 }))).toBe(0)
  })

  it('dynamic: planned minus spent, floored at zero on overspend', () => {
    expect(planRemainingToPay(plan({ type: 'CATEGORY', amount: 100, spent: 40 }))).toBe(60)
    expect(planRemainingToPay(plan({ type: 'CATEGORY', amount: 100, spent: 130 }))).toBe(0)
  })
})

describe('planUsedBudget', () => {
  it('one-off: reserved planned amount while open, real spend once closed', () => {
    expect(planUsedBudget(plan({ type: 'TRANSACTION', amount: 100, spent: 0 }))).toBe(100)
    expect(planUsedBudget(plan({ type: 'TRANSACTION', amount: 100, spent: 70 }))).toBe(70)
  })

  it('dynamic: max of planned and spent, so overspend consumes more budget', () => {
    expect(planUsedBudget(plan({ type: 'CATEGORY', amount: 100, spent: 40 }))).toBe(100)
    expect(planUsedBudget(plan({ type: 'CATEGORY', amount: 100, spent: 130 }))).toBe(130)
  })
})

describe('unplannedSpending', () => {
  it('counts transactions that are neither linked nor in a dynamic-plan category', () => {
    const plans = [plan({ type: 'CATEGORY', categoryId: 'food--groceries' })]
    const txs = [
      tx({ id: 'a', amount: 30, categoryId: 'fun--misc', planningId: null }), // counts
      tx({ id: 'b', amount: 50, categoryId: 'food--groceries', planningId: null }), // in dynamic cat -> skip
      tx({ id: 'c', amount: 20, categoryId: 'fun--misc', planningId: '9' }), // linked -> skip
    ]
    expect(unplannedSpending(txs, plans)).toBe(30)
  })
})

describe('computePlanningStats', () => {
  it('dashes every aggregate (but keeps the budget) when a plan is unconverted', () => {
    const stats = computePlanningStats(1000, [plan({ converted: false, amount: 90 })], [])
    expect(stats).toEqual({
      monthlyBudget: 1000,
      plannedExpenses: null,
      remainingToPay: null,
      freeMoney: null,
    })
  })

  it('sums planned expenses across plans', () => {
    const stats = computePlanningStats(
      1000,
      [plan({ id: '1', amount: 200 }), plan({ id: '2', amount: 300, type: 'CATEGORY' })],
      [],
    )
    expect(stats.plannedExpenses).toBe(500)
  })

  it('free money reserves open plans and unplanned spending, without double counting', () => {
    const plans = [
      plan({ id: '1', type: 'TRANSACTION', amount: 100, spent: 0 }), // open one-off -> reserve 100
      plan({ id: '2', type: 'CATEGORY', categoryId: 'food--groceries', amount: 200, spent: 250 }), // overspent -> 250
    ]
    const txs = [
      tx({ id: 'a', amount: 250, categoryId: 'food--groceries', planningId: null }), // inside dynamic spent, skip
      tx({ id: 'b', amount: 40, categoryId: 'fun--misc', planningId: null }), // unplanned -> counts
    ]
    // 1000 - (100 + 250) - 40 = 610
    expect(computePlanningStats(1000, plans, txs).freeMoney).toBe(610)
  })

  it('free money goes negative when spending exceeds the budget', () => {
    const plans = [plan({ id: '1', type: 'CATEGORY', amount: 900, spent: 1100 })]
    expect(computePlanningStats(1000, plans, []).freeMoney).toBe(-100)
  })

  it('remaining to pay ignores closed one-offs and floors dynamic overspend', () => {
    const plans = [
      plan({ id: '1', type: 'TRANSACTION', amount: 100, spent: 100 }), // closed -> 0
      plan({ id: '2', type: 'TRANSACTION', amount: 80, spent: 0 }), // open -> 80
      plan({ id: '3', type: 'CATEGORY', amount: 200, spent: 130 }), // -> 70
      plan({ id: '4', type: 'CATEGORY', amount: 50, spent: 90 }), // overspent -> 0
    ]
    expect(computePlanningStats(1000, plans, []).remainingToPay).toBe(150)
  })
})
