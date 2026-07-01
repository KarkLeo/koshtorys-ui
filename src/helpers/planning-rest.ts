import type { components } from '@/api/types'
import type { DisplayTransaction } from '@/components/transaction/types'
import { getMainCategory } from '@/helpers/category'

type Plan = components['schemas']['PlanResponseDto']

export interface PreparedPlan {
  original: Plan
  id: string
  type: 'TRANSACTION' | 'CATEGORY'
  amount: number
  currency: string
  originalAmount?: number | null
  originalCurrency?: string | null
  spent: number
  categoryId: string
  categoryName: string
  mainCategory: string
  categoryColor: string
  date?: string | null
  repeat: boolean
  description?: string | null
}

/** planned-vs-spent numerator. Both plan types read from the month's transactions. */
export function getPlanSpent(plan: Plan, transactions: DisplayTransaction[]): number {
  if (plan.type === 'TRANSACTION') {
    return transactions
      .filter((t) => t.planningId != null && String(t.planningId) === String(plan.id))
      .reduce((acc, t) => acc + t.amount, 0)
  }
  // CATEGORY (dynamic): category transactions not linked to a one-off plan
  return transactions
    .filter((t) => t.categoryId === plan.categoryId && !t.planningId)
    .reduce((acc, t) => acc + t.amount, 0)
}

export function getConvertedPlanAmount(
  plan: Plan,
  rates: Record<string, number>,
  baseCurrency: string,
): number {
  if (plan.currency === baseCurrency) return plan.amount
  return (plan.amount / rates[plan.currency]) * rates[baseCurrency]
}

/** Drop repeating plans already represented this month (same category, or parent/repeated link). */
export function filterRepeatingPlans(repeating: Plan[], current: Plan[]): Plan[] {
  return repeating.filter((rp) => {
    if (rp.type === 'CATEGORY' && current.some((p) => p.categoryId === rp.categoryId)) return false
    const linked = current.some(
      (p) =>
        (p.repeatedPlanningId != null && String(p.repeatedPlanningId) === String(rp.id)) ||
        (rp.repeatedPlanningId != null && String(rp.repeatedPlanningId) === String(p.id)) ||
        (p.parentPlanningId != null && String(p.parentPlanningId) === String(rp.id)) ||
        (rp.parentPlanningId != null && String(rp.parentPlanningId) === String(p.id)) ||
        (p.parentPlanningId != null &&
          rp.parentPlanningId != null &&
          String(p.parentPlanningId) === String(rp.parentPlanningId)),
    )
    return !linked
  })
}

export function reducePlansByCategory(
  plans: PreparedPlan[],
): { category: string; items: PreparedPlan[]; total: number }[] {
  const grouped = plans.reduce(
    (acc, p) => {
      ;(acc[p.mainCategory] ||= []).push(p)
      return acc
    },
    {} as Record<string, PreparedPlan[]>,
  )
  return Object.entries(grouped)
    .map(([category, items]) => ({
      category,
      items: [...items].sort((a, b) => b.amount - a.amount),
      total: items.reduce((acc, i) => acc + i.amount, 0),
    }))
    .sort((a, b) => b.total - a.total)
}

/** re-export kept for callers that need the main category resolver */
export { getMainCategory }
