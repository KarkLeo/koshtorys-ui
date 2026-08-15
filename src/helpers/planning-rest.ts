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
  linkedCount: number
  /**
   * false → `amount` is unconverted (missing exchange rate) and `spent` (always base-currency,
   * see DisplayTransaction) is NOT comparable to it. Consumers must not compute a progress bar,
   * or a base-currency sum, from a plan with `converted: false`.
   */
  converted: boolean
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

/** Сколько транзакций месяца привязано к этому плану (для disable в SelectPlanningModal). */
export function countLinkedTransactions(plan: Plan, transactions: DisplayTransaction[]): number {
  return transactions.filter((t) => String(t.planningId) === String(plan.id)).length
}

export interface ConvertedPlanAmount {
  amount: number
  /**
   * true  → `amount` is denominated in `baseCurrency` (converted, or already the same currency).
   * false → a required rate was missing, so `amount` is the plan's own, unconverted amount and is
   *         still denominated in `plan.currency`. Callers MUST label it with `plan.currency`, not
   *         `baseCurrency`, or the figure silently lies about what currency it's in.
   */
  converted: boolean
}

export function getConvertedPlanAmount(
  plan: Plan,
  rates: Record<string, number>,
  baseCurrency: string,
): ConvertedPlanAmount {
  if (plan.currency === baseCurrency) return { amount: plan.amount, converted: true }
  const fromRate = rates[plan.currency]
  const toRate = rates[baseCurrency]
  // Rates missing (e.g. today's exchange-rate fetch failed) — report the unconverted amount
  // instead of NaN so the plan still renders, but flag it so callers don't mislabel it.
  if (!fromRate || !toRate) return { amount: plan.amount, converted: false }
  return { amount: (plan.amount / fromRate) * toRate, converted: true }
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
): { category: string; items: PreparedPlan[]; total: number | null }[] {
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
      // A group total in the base currency is only honest if every item summed into it was
      // actually converted (or already in base currency). A single unconverted item (missing
      // exchange rate) is still labelled with its OWN currency — summing it with base-currency
      // amounts would silently produce a number in no currency at all. Emit null instead and let
      // the UI render a dash, same call as PlanCard suppressing its progress bar in that state.
      total: items.some((i) => !i.converted) ? null : items.reduce((acc, i) => acc + i.amount, 0),
    }))
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
}

/** re-export kept for callers that need the main category resolver */
export { getMainCategory }
