import type { PlanningQuery } from '@/graphql/types.ts'
import { getMainCategory } from '@/helpers/category.ts'

export type PlanningItem = PlanningQuery['planning'][number]
export type ExchangeRate = PlanningQuery['exchangeRate']

const sortPlanning = (plannings: PlanningItem[]) => {
  return plannings.sort((a, b) => {
    return a.amount - b.amount
  })
}

export const reducePlanningByCategory = (
  plannings: PlanningItem[],
): { category: string; items: PlanningItem[] }[] => {
  const result: Record<string, PlanningItem[]> = plannings.reduce(
    (acc, planning) => {
      const mainCategory = getMainCategory(planning.categoryId || '')
      if (!acc[mainCategory]) {
        acc[mainCategory] = [planning]
      } else {
        acc[mainCategory].push(planning)
      }
      return acc
    },
    {} as Record<string, PlanningItem[]>,
  )

  return Object.entries(result).map(([category, items]) => ({
    category,
    items: sortPlanning(items),
  }))
}

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
  plannings: PlanningItem[],
  exchangeRate: ExchangeRate,
  baseCurrency: string,
): number => {
  return plannings.reduce((acc, planning) => {
    return acc + getExchangedAmount(exchangeRate, planning.amount, planning.currency, baseCurrency)
  }, 0)
}
