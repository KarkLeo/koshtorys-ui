import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTransactionList } from '@/hooks/transaction-hooks.ts'
import {
  usePlanningExchangeRage,
  usePlanningList,
  useRepeatingPlanningList,
} from '@/hooks/planning-hooks.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import {
  type ExchangeRate,
  type Planning,
  type Transaction,
  PlanningType,
} from '@/graphql/types.ts'

import {
  filterPlanning,
  getExchangedAmount,
  getTransactionsAmount,
  getTransactionsAmountByCategory,
  reducePlanningByCategory,
} from '@/helpers/planning.ts'
import { getMainCategory } from '@/helpers/category.ts'

import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'

// ===== Types =====

export interface PreparedPlanning {
  original: Planning
  id: string
  type: PlanningType

  amount: number
  currency: string
  originalAmount?: number | null
  originalCurrency?: string | null
  transactionsAmount?: number | null

  categoryId: string
  categoryName: string
  mainCategory: string
  categoryColor: string

  date?: string
  repeat: boolean

  description?: string | null
}

// ===== Helpers =====

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (value: string) => {
  return CURRENCIES_SYMBOL[value] || value
}

// ===== Mapper =====
const mapPlanning = (
  planning: Planning,
  transactions: Transaction[],
  exchangeRate: ExchangeRate,
  baseCurrency: string,
  // eslint-disable-next-line
  t: (key: string, named?: Record<string, any>) => string,
): PreparedPlanning => {
  const preparedPlanning: PreparedPlanning = {
    original: planning,
    id: planning.id,
    type: planning.type,

    amount: Math.round(
      getExchangedAmount(exchangeRate, planning.amount, planning.currency, baseCurrency),
    ),
    currency: formatCurrency(baseCurrency),
    originalAmount: planning.currency === baseCurrency ? null : planning.amount,
    originalCurrency: planning.currency === baseCurrency ? null : formatCurrency(planning.currency),

    categoryId: planning.categoryId,
    categoryName: t(`categories.${planning.categoryId}`),
    mainCategory: getMainCategory(planning.categoryId),
    categoryColor: TRANSACTION_CATEGORIES_COLORS[getMainCategory(planning.categoryId)],

    repeat: planning.repeat,
    date: planning.date && formatDate(planning.date),

    description: planning?.description,
  }

  if (planning.type === 'TRANSACTION') {
    preparedPlanning.transactionsAmount = getTransactionsAmount(planning, baseCurrency)
  }
  if (planning.type === 'CATEGORY') {
    preparedPlanning.transactionsAmount = getTransactionsAmountByCategory(
      transactions,
      planning.categoryId,
      baseCurrency,
    )
  }

  return preparedPlanning
}

// ===== Hook =====

export const usePlanningMapper = () => {
  const { t } = useI18n()
  const { planning, loading: planningLoading } = usePlanningList()
  const { planningExchangeRage, loading: planningExchangeRageLoading } = usePlanningExchangeRage()
  const { repeatingPlanning } = useRepeatingPlanningList()
  const { transactions } = useTransactionList()
  const { me } = useMe()

  const planningTables = computed(() => {
    if (
      !planning?.value?.planning ||
      !transactions.value?.transactions ||
      !planningExchangeRage?.value?.exchangeRate ||
      !me.value
    )
      return []

    return reducePlanningByCategory(
      (planning.value?.planning as Planning[])?.map((planningItem) =>
        mapPlanning(
          planningItem,
          (transactions.value?.transactions || []) as Transaction[],
          planningExchangeRage.value?.exchangeRate as ExchangeRate,
          me.value?.me.currency as string,
          t,
        ),
      ),
    )
  })

  const repeatingPlanningTables = computed(() => {
    if (
      !repeatingPlanning?.value?.repeatingPlanning ||
      !planning?.value?.planning ||
      !transactions.value?.transactions ||
      !planningExchangeRage?.value?.exchangeRate ||
      !me.value
    )
      return []
    return reducePlanningByCategory(
      filterPlanning(
        repeatingPlanning.value?.repeatingPlanning as Planning[],
        planning?.value?.planning as Planning[],
      )?.map((planningItem) =>
        mapPlanning(
          planningItem,
          (transactions.value?.transactions || []) as Transaction[],
          planningExchangeRage.value?.exchangeRate as ExchangeRate,
          me.value?.me.currency as string,
          t,
        ),
      ),
    )
  })

  const planningStatistics = computed(() => {
    if (
      !planning?.value?.planning ||
      !transactions.value?.transactions ||
      !planningExchangeRage?.value?.exchangeRate ||
      !me.value
    )
      return null

    const preparedPlannings = (planning.value?.planning as Planning[])?.map((planningItem) =>
      mapPlanning(
        planningItem,
        (transactions.value?.transactions || []) as Transaction[],
        planningExchangeRage.value?.exchangeRate as ExchangeRate,
        me.value?.me.currency as string,
        t,
      ),
    )

    const monthlyBudget = me?.value?.me.monthlyBudget

    const plannedExpenses = preparedPlannings.reduce(
      (acc, planningItem) => acc + planningItem.amount,
      0,
    )

    const freeMoney =
      monthlyBudget -
      preparedPlannings.reduce(
        (acc, planningItem) =>
          acc +
          (planningItem.type === 'TRANSACTION' && planningItem.transactionsAmount
            ? planningItem.transactionsAmount
            : planningItem.amount),
        0,
      )

    const remainingToPay = preparedPlannings.reduce((acc, planningItem) => {
      if (planningItem.type === 'TRANSACTION' && planningItem.transactionsAmount) return acc

      if (planningItem.type === 'CATEGORY' && planningItem.transactionsAmount)
        return acc + planningItem.amount - planningItem.transactionsAmount

      return acc + planningItem.amount
    }, 0)
    return {
      monthlyBudget,
      plannedExpenses,
      freeMoney,
      remainingToPay,
    }
  })

  const loading = computed(() => {
    // Show preloader with loading main data
    return planningLoading.value || planningExchangeRageLoading.value
  })

  return { planningTables, repeatingPlanningTables, planningStatistics, loading }
}
