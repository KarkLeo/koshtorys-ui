import type { Planning, ExchangeRate, Transaction } from '@/graphql/types.ts'
import { getMainCategory } from '@/helpers/category.ts'

const sortPlanning = (plannings: Planning[]) => {
  return plannings.sort((a, b) => {
    return a.amount - b.amount
  })
}

export const reducePlanningByCategory = (
  plannings: Planning[],
): { category: string; items: Planning[] }[] => {
  const result: Record<string, Planning[]> = plannings.reduce(
    (acc, planning) => {
      const mainCategory = getMainCategory(planning.categoryId || '')
      if (!acc[mainCategory]) {
        acc[mainCategory] = [planning]
      } else {
        acc[mainCategory].push(planning)
      }
      return acc
    },
    {} as Record<string, Planning[]>,
  )

  return Object.entries(result).map(([category, items]) => ({
    category,
    items: sortPlanning(items),
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

export const getTotalAmount = (
  plannings: Planning[],
  exchangeRate: ExchangeRate,
  baseCurrency: string,
): number => {
  return plannings.reduce((acc, planning) => {
    return acc + getExchangedAmount(exchangeRate, planning.amount, planning.currency, baseCurrency)
  }, 0)
}

export const getTransactionsAmount = (plannings: Planning, currency?: string): number | null => {
  if (
    !currency ||
    plannings.type === 'CATEGORY' ||
    !plannings.transactions ||
    plannings.transactions.length === 0
  ) {
    return null
  }

  return plannings.transactions.reduce((acc, transaction) => {
    if (transaction.currency !== currency) {
      return (
        acc +
        (transaction.amount / transaction.exchangeRate.rates[transaction.currency]) *
          transaction.exchangeRate.rates[currency]
      )
    } else {
      return acc + transaction.amount
    }
  }, 0)
}

export const getTransactionsAmountByCategory = (
  transactions: Transaction,
  category: string,
  currency?: string,
) => {
  if (transactions.length === 0) {
    return null
  }

  return transactions
    .filter((transaction) => {
      return transaction.categoryId === category && !transaction.planning
    })
    .reduce((acc, transaction) => {
      if (transaction.categoryId === category) {
        if (currency && transaction.currency !== currency) {
          return (
            acc +
            (transaction.amount / transaction.exchangeRate.rates[transaction.currency]) *
              transaction.exchangeRate.rates[currency]
          )
        } else {
          return acc + transaction.amount
        }
      }
      return acc
    }, 0)
}
