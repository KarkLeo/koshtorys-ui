import { computed } from 'vue'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useMonthlyTransactions, useTransactionsStatistic } from '@/hooks/transaction-hooks.ts'
import { getMainCategory } from '@/helpers/category.ts'
import { getDateRangeByDate } from '@/helpers/date.ts'
import type { DisplayTransaction } from '@/components/transaction/types'

// The month's transactions already come from REST converted to the user's currency
// (see DisplayTransaction), so the statistics mapper only tags each with its top-level category.
interface ExtendedTransaction extends DisplayTransaction {
  mainCategory: string
}

const reduceTransactionsByCategory = (transactions: ExtendedTransaction[]) =>
  transactions.reduce(
    (acc, transaction) => {
      const categoryId = transaction.mainCategory
      const amount = transaction.amount

      if (!acc[categoryId]) {
        acc[categoryId] = { amount, categoryId, items: [transaction] }
      } else {
        acc[categoryId].amount += amount
        acc[categoryId].items.push(transaction)
      }

      return acc
    },
    {} as Record<string, { amount: number; categoryId: string; items: ExtendedTransaction[] }>,
  )

const reduceTransactionsByDate = (transactions: ExtendedTransaction[]) =>
  transactions.reduce(
    (acc, transaction) => {
      const date = transaction.date.toISOString().split('T')[0]

      if (!acc[date]) {
        acc[date] = transaction.amount
      } else {
        acc[date] += transaction.amount
      }

      return acc
    },
    {} as Record<string, number>,
  )

export const useTransactionStatisticsMapper = () => {
  const { user } = useMe()
  const { transactions, loading } = useMonthlyTransactions()
  const { byCategory, byMonthDay } = useTransactionsStatistic()

  const extendedTransactions = computed<ExtendedTransaction[]>(() =>
    transactions.value.map((transaction) => ({
      ...transaction,
      mainCategory: getMainCategory(transaction.categoryId),
    })),
  )

  const transactionsByCategory = computed(() => {
    return Object.values(reduceTransactionsByCategory(extendedTransactions.value)).sort(
      (a, b) => a.amount - b.amount,
    )
  })

  const transactionAmountByDate = computed(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Cross-month daily averages, in day order (see useTransactionsStatistic).
    const averageByDate = byMonthDay.value.map((item) => Math.round(item.average))

    let delta = 0
    const arr = []

    const amountByDate = reduceTransactionsByDate(extendedTransactions.value)
    const date = extendedTransactions.value?.[0]?.date || new Date()
    const { startDate, endDate } = getDateRangeByDate(date, user.value?.monthStartDay || 1)
    let currentDate = startDate
    let averageIndex = 0

    while (currentDate <= endDate) {
      if (averageIndex > 0 && averageByDate[averageIndex] < averageByDate[averageIndex - 1]) {
        averageByDate[averageIndex] = averageByDate[averageIndex - 1]
      }

      const day = currentDate.toISOString().split('T')[0]
      const amount = amountByDate[day] || 0
      const average = averageByDate[averageIndex] || averageByDate[averageIndex - 1] || 0
      delta += amount
      averageIndex += 1
      if (extendedTransactions.value?.length && currentDate <= tomorrow) {
        arr.push({ date: day, amount: delta, average })
      } else {
        arr.push({ date: day, average })
      }

      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
    }

    return arr
  })

  const transactionsByAllCategory = computed(() => {
    const averageByCategory = byCategory.value.reduce(
      (acc, item) => {
        acc[item.categoryId] = Math.round(item.average)
        return acc
      },
      {} as Record<string, number>,
    )

    const res = transactionsByCategory.value
      .map((category) => {
        const reducedSubCategories = category.items.reduce(
          (acc, transaction) => {
            const categoryId = transaction.categoryId
            const amount = transaction.amount

            if (!acc[categoryId]) {
              acc[categoryId] = {
                amount,
                categoryId,
                items: [transaction],
                average: averageByCategory[categoryId] || 0,
              }
            } else {
              acc[categoryId].amount += amount
              acc[categoryId].items.push(transaction)
            }

            return acc
          },
          {} as Record<
            string,
            { amount: number; categoryId: string; items: ExtendedTransaction[]; average: number }
          >,
        )

        return Object.values(reducedSubCategories).sort((a, b) => a.amount - b.amount)
      })
      .flat()

    return res
  })

  return {
    extendedTransactions,
    reducedTransactionsByCategory: transactionsByCategory,
    transactionAmountByDate,
    transactionsByAllCategory,
    loading,
  }
}
