import type { Planning, ExchangeRate } from '@/graphql/types.ts'
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
