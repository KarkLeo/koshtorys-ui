// ===== Types =====

import { computed } from 'vue'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useTransactionList, useTransactionsStatistic } from '@/hooks/transaction-hooks.ts'
import { getMainCategory } from '@/helpers/category.ts'
import { getDateRangeByDate } from '@/helpers/date.ts'
import type { TransactionsQuery } from '@/graphql/types.ts'

type BaseTransaction = TransactionsQuery['transactions'][number]

interface ExtendedTransaction extends BaseTransaction {
  originalAmount?: number
  originalCurrency?: string
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
  const { transactions, loading } = useTransactionList()

  const { transactionsStatistic } = useTransactionsStatistic()

  const extendedTransactions = computed<ExtendedTransaction[]>(() => {
    const meCurrency = user.value?.currency
    if (!meCurrency || !transactions.value?.transactions) return []

    return transactions.value.transactions.map((transaction: BaseTransaction) => {
      if (meCurrency !== transaction.currency) {
        const amount =
          (transaction.amount / transaction.exchangeRate.rates[transaction.currency]) *
          transaction.exchangeRate.rates[meCurrency]

        return {
          ...transaction,
          amount,
          currency: meCurrency,
          originalAmount: transaction.amount,
          originalCurrency: transaction.currency,
          date: new Date(transaction.date),
          mainCategory: getMainCategory(transaction.categoryId as string),
        }
      }
      return {
        ...transaction,
        date: new Date(transaction.date),
        mainCategory: getMainCategory(transaction.categoryId as string),
      }
    })
  })

  const transactionsByCategory = computed(() => {
    return Object.values(reduceTransactionsByCategory(extendedTransactions.value)).sort(
      (a, b) => a.amount - b.amount,
    )
  })

  const transactionAmountByDate = computed(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    let averageByDate: number[] = []
    if (transactionsStatistic.value) {
      averageByDate = transactionsStatistic.value?.transactionsByMonthDay.map((item) =>
        Math.round(item.average),
      )
    }

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

      const date = currentDate.toISOString().split('T')[0]
      const amount = amountByDate[date] || 0
      const average = averageByDate[averageIndex] || averageByDate[averageIndex - 1] || 0
      delta += amount
      averageIndex += 1
      if (extendedTransactions.value?.length && currentDate <= tomorrow) {
        arr.push({ date, amount: delta, average })
      } else {
        arr.push({ date, average })
      }

      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
    }

    return arr
  })

  const transactionsByAllCategory = computed(() => {
    let averageByCategory: Record<string, number> = {}
    if (transactionsStatistic.value) {
      averageByCategory =
        transactionsStatistic.value?.transactionsByCategory.reduce(
          (acc, item) => {
            acc[item.categoryId] = Math.round(item.average)
            return acc
          },
          {} as Record<string, number>,
        ) || {}
    }

    const res = transactionsByCategory.value
      .map((category) => {
        const reducedSubCategories = category.items.reduce(
          (acc, transaction) => {
            const categoryId = transaction.categoryId as string
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
    transactionsStatistic,
    loading,
  }
}
