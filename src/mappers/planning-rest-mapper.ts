import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMe } from '@/hooks/auth-hooks'
import { useMonthlyTransactions } from '@/hooks/transaction-hooks'
import { useMonthlyPlanning } from '@/hooks/planning-rest-hooks'
import {
  getPlanSpent,
  getConvertedPlanAmount,
  filterRepeatingPlans,
  reducePlansByCategory,
  getMainCategory,
  countLinkedTransactions,
  type PreparedPlan,
} from '@/helpers/planning-rest'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories'
import { CURRENCIES_SYMBOL } from '@/constants/currencies'
import type { components } from '@/api/types'
import type { DisplayTransaction } from '@/components/transaction/types'

type Plan = components['schemas']['PlanResponseDto']

const formatCurrency = (c: string) => CURRENCIES_SYMBOL[c] || c

function mapPlan(
  plan: Plan,
  transactions: DisplayTransaction[],
  rates: Record<string, number>,
  baseCurrency: string,
  t: (k: string) => string,
): PreparedPlan {
  const mainCategory = getMainCategory(plan.categoryId)
  const converted = Math.round(getConvertedPlanAmount(plan, rates, baseCurrency))
  return {
    original: plan,
    id: String(plan.id),
    type: plan.type,
    amount: converted,
    currency: formatCurrency(baseCurrency),
    originalAmount: plan.currency === baseCurrency ? null : plan.amount,
    originalCurrency: plan.currency === baseCurrency ? null : formatCurrency(plan.currency),
    spent: Math.round(getPlanSpent(plan, transactions)),
    linkedCount: countLinkedTransactions(plan, transactions),
    categoryId: plan.categoryId,
    categoryName: t(`categories.${plan.categoryId}`),
    mainCategory,
    categoryColor: TRANSACTION_CATEGORIES_COLORS[mainCategory] || '',
    date: plan.date,
    repeat: plan.repeat,
    description: plan.description,
  }
}

export function usePlanningMapperRest() {
  const { t } = useI18n()
  const { user } = useMe()
  const { plans, repeating, rates, loading, invalidate, refetch } = useMonthlyPlanning()
  const { transactions } = useMonthlyTransactions()

  const ready = computed(() => !!user.value && Object.keys(rates.value).length > 0)

  const prepared = computed<PreparedPlan[]>(() => {
    if (!ready.value) return []
    const base = user.value!.currency
    return plans.value.map((p) => mapPlan(p, transactions.value, rates.value, base, t))
  })

  const planningTables = computed(() => reducePlansByCategory(prepared.value))

  const repeatingPlanningTables = computed(() => {
    if (!ready.value) return []
    const base = user.value!.currency
    return reducePlansByCategory(
      filterRepeatingPlans(repeating.value, plans.value).map((p) =>
        mapPlan(p, transactions.value, rates.value, base, t),
      ),
    )
  })

  const planningStatistics = computed(() => {
    if (!ready.value) return null
    const monthlyBudget = user.value!.monthlyBudget ?? 0
    const items = prepared.value
    const plannedExpenses = items.reduce((acc, p) => acc + p.amount, 0)
    // free money = budget - (spent-or-planned per plan) - free (unplanned) transactions
    const plannedCategoryIds = new Set(
      plans.value.filter((p) => p.type === 'CATEGORY').map((p) => p.categoryId),
    )
    const freeTx = transactions.value
      .filter((tx) => !tx.planningId && !plannedCategoryIds.has(tx.categoryId))
      .reduce((acc, tx) => acc + tx.amount, 0)
    const usedByPlans = items.reduce(
      (acc, p) => acc + (p.type === 'TRANSACTION' && p.spent ? p.spent : p.amount),
      0,
    )
    const freeMoney = monthlyBudget - usedByPlans - freeTx
    const remainingToPay = items.reduce((acc, p) => {
      if (p.type === 'TRANSACTION' && p.spent) return acc
      if (p.type === 'CATEGORY' && p.spent) return acc + Math.max(0, p.amount - p.spent)
      return acc + p.amount
    }, 0)
    return { monthlyBudget, plannedExpenses, freeMoney, remainingToPay }
  })

  return {
    planningTables,
    repeatingPlanningTables,
    planningStatistics,
    loading,
    invalidate,
    refetch,
  }
}
