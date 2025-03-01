import type { Planning, ExchangeRate, Transaction } from '@/graphql/types.ts'
import type { PreparedPlanning } from '@/mappers/planning-mapper.ts'

const sortPlanning = (plannings: PreparedPlanning[]) => {
  return plannings.sort((a, b) => {
    return b.amount - a.amount
  })
}

export const reducePlanningByCategory = (
  plannings: PreparedPlanning[],
): { category: string; items: PreparedPlanning[]; total: number }[] => {
  const result: Record<string, PreparedPlanning[]> = plannings.reduce(
    (acc, planning) => {
      if (!acc[planning.mainCategory]) {
        acc[planning.mainCategory] = [planning]
      } else {
        acc[planning.mainCategory].push(planning)
      }
      return acc
    },
    {} as Record<string, PreparedPlanning[]>,
  )

  return Object.entries(result).map(([category, items]) => ({
    category,
    items: sortPlanning(items),
    total: items.reduce((acc, item) => acc + item.amount, 0),
  }))
}

export const filterPlanning = (
  repeatedPlannings: Planning[],
  currentPlannings: Planning[],
): Planning[] =>
  repeatedPlannings.filter((repeatedPlanning) => {
    if (
      repeatedPlanning.type === 'CATEGORY' &&
      currentPlannings.some((planning) => planning.categoryId === repeatedPlanning.categoryId)
    ) {
      return false
    }

    if (
      currentPlannings.some(
        (planning) =>
          (planning.repeatedPlanningId &&
            String(planning.repeatedPlanningId) === String(repeatedPlanning.id)) ||
          (repeatedPlanning.repeatedPlanningId &&
            String(repeatedPlanning.repeatedPlanningId) === String(planning.id)) ||
          (planning.parentPlanningId &&
            String(planning.parentPlanningId) === String(repeatedPlanning.id)) ||
          (repeatedPlanning.parentPlanningId &&
            String(repeatedPlanning.parentPlanningId) === String(planning.id)) ||
          (planning.parentPlanningId &&
            repeatedPlanning.parentPlanningId &&
            String(planning.parentPlanningId) === String(repeatedPlanning.parentPlanningId)),
      )
    )
      return false

    return true
  })

export const getExchangedAmount = (
  exchangeRate: ExchangeRate,
  amount: number,
  currency: string,
  baseCurrency: string,
): number => {
  if (currency === baseCurrency) {
    return amount
  }

  return (amount / exchangeRate.rates[currency]) * exchangeRate.rates[baseCurrency]
}

export const getTransactionsAmount = (plannings: Planning, baseCurrency: string): number | null => {
  if (!plannings.transactions || plannings.transactions.length === 0) {
    return null
  }

  return plannings.transactions.reduce((acc, transaction) => {
    return (
      acc +
      getExchangedAmount(
        transaction.exchangeRate,
        transaction.amount,
        transaction.currency,
        baseCurrency,
      )
    )
  }, 0)
}

export const getTransactionsAmountByCategory = (
  transactions: Transaction[],
  category: string,
  baseCurrency: string,
) =>
  transactions
    .filter((transaction) => {
      return transaction.categoryId === category && !transaction.planning
    })
    .reduce((acc, transaction) => {
      return (
        acc +
        getExchangedAmount(
          transaction.exchangeRate,
          transaction.amount,
          transaction.currency,
          baseCurrency,
        )
      )
    }, 0)
