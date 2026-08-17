import type { PreparedPlan } from '@/helpers/planning-rest'
import type { DisplayTransaction } from '@/components/transaction/types'

/**
 * The four header figures on the Planning screen. All amounts are in the user's base currency.
 *
 * `plannedExpenses`, `remainingToPay` and `freeMoney` are `null` — rendered as a dash — whenever
 * any plan could not be converted to the base currency (missing exchange rate). Folding an
 * unconverted, foreign-currency amount into a base-currency sum would silently produce a number
 * that is in no single currency at all, so we refuse to show it. `monthlyBudget` is always a real
 * number: it comes straight from the profile and never touches conversion.
 */
export interface PlanningStats {
  monthlyBudget: number
  plannedExpenses: number | null
  remainingToPay: number | null
  freeMoney: number | null
}

const isOneOff = (plan: PreparedPlan) => plan.type === 'TRANSACTION'
const isDynamic = (plan: PreparedPlan) => plan.type === 'CATEGORY'

/**
 * A plan is "closed" once real money has been booked against it: a one-off plan gains a linked
 * transaction, a dynamic plan gains any spending in its category. `spent` is the base-currency
 * sum of those transactions (see `getPlanSpent`), so `> 0` is exactly that signal.
 */
const hasSpending = (plan: PreparedPlan) => plan.spent > 0

/**
 * How much a plan still adds to "remaining to pay":
 * - one-off: its full amount until it's closed, then nothing (it's a single purchase — done once paid)
 * - dynamic: the part of the planned amount not yet spent, never negative (overspend isn't "to pay")
 */
export function planRemainingToPay(plan: PreparedPlan): number {
  if (isOneOff(plan)) return hasSpending(plan) ? 0 : plan.amount
  return Math.max(0, plan.amount - plan.spent)
}

/**
 * How much of the monthly budget a plan actually consumes for the free-money calculation:
 * - one-off: the real spend once closed, otherwise the planned amount still reserved for it
 * - dynamic: the larger of planned vs already-spent, so a category overspend also eats free money
 */
export function planUsedBudget(plan: PreparedPlan): number {
  if (isOneOff(plan)) return hasSpending(plan) ? plan.spent : plan.amount
  return Math.max(plan.amount, plan.spent)
}

/**
 * Spending no plan accounts for: transactions not linked to a one-off plan AND not sitting in a
 * category that already has a dynamic plan. Those two exclusions are exactly what keeps this from
 * double-counting — a linked transaction is already inside its one-off's `spent`, and a dynamic
 * category's transactions are already inside that plan's `spent` (and thus its `planUsedBudget`).
 */
export function unplannedSpending(
  transactions: DisplayTransaction[],
  plans: PreparedPlan[],
): number {
  const dynamicCategoryIds = new Set(plans.filter(isDynamic).map((p) => p.categoryId))
  return transactions
    .filter((tx) => !tx.planningId && !dynamicCategoryIds.has(tx.categoryId))
    .reduce((sum, tx) => sum + tx.amount, 0)
}

export function computePlanningStats(
  monthlyBudget: number,
  plans: PreparedPlan[],
  transactions: DisplayTransaction[],
): PlanningStats {
  // A single unconverted plan makes every base-currency aggregate below dishonest — show dashes
  // instead of a mixed-currency sum. The budget itself is unaffected (pure profile value).
  if (plans.some((plan) => !plan.converted)) {
    return { monthlyBudget, plannedExpenses: null, remainingToPay: null, freeMoney: null }
  }

  const plannedExpenses = plans.reduce((sum, plan) => sum + plan.amount, 0)
  const remainingToPay = plans.reduce((sum, plan) => sum + planRemainingToPay(plan), 0)

  const budgetUsedByPlans = plans.reduce((sum, plan) => sum + planUsedBudget(plan), 0)
  const freeMoney = monthlyBudget - budgetUsedByPlans - unplannedSpending(transactions, plans)

  return { monthlyBudget, plannedExpenses, remainingToPay, freeMoney }
}
