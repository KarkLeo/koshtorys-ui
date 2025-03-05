import { computed } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'

import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { getDateRangeByDate, getIndexedYear, getMonthIndex } from '@/helpers/date.ts'

import type {
  CreateTransactionMutation,
  CreateTransactionMutationVariables,
  DeleteTransactionMutation,
  DeleteTransactionMutationVariables,
  Planning,
  Transaction,
  TransactionsQuery,
  TransactionsQueryVariables,
  UpdateTransactionMutation,
  UpdateTransactionMutationVariables,
} from '@/graphql/types.ts'
import CREATE_TRANSACTION from '@/graphql/create-transaction.graphql'
import DELETE_TRANSACTION from '@/graphql/delete-transaction.graphql'
import UPDATE_TRANSACTION from '@/graphql/update-transaction.graphql'
import TRANSACTIONS from '@/graphql/transactions.graphql'
import PLANNING from '@/graphql/planning.graphql'

export function useCreateTransaction() {
  const { me } = useMe()

  const { mutate, loading } = useMutation<
    CreateTransactionMutation,
    CreateTransactionMutationVariables
  >(CREATE_TRANSACTION, {
    update(cache, { data }) {
      if (!data?.createTransaction || !me.value?.me.monthStartDay) return

      const newTransaction = data.createTransaction
      const transactionDate = new Date(newTransaction.date)

      // ===== Update transactions =====
      try {
        const { startDate, endDate } = getDateRangeByDate(
          transactionDate,
          me.value?.me.monthStartDay || 1,
        )

        cache.updateQuery<{ transactions: Transaction[] }>(
          {
            query: TRANSACTIONS,
            variables: { startDate, endDate },
          },
          (data) =>
            data && {
              ...data,
              transactions: [newTransaction, ...(data?.transactions || [])] as Transaction[],
            },
        )
      } catch (e) {
        console.error('CreateTransaction - Error updating cache TRANSACTIONS:', e)
      }

      // ===== Update planning =====
      if (newTransaction.planningId) {
        try {
          const monthIndex = getMonthIndex(transactionDate, me.value?.me.monthStartDay)
          const year = getIndexedYear(transactionDate, me.value?.me.monthStartDay)

          const preparedTransaction = {
            id: newTransaction.id,
            amount: newTransaction.amount,
            currency: newTransaction.currency,
            exchangeRate: {
              rates: newTransaction.exchangeRate.rates,
            },
          }

          cache.updateQuery<{ planning: Planning[] }>(
            {
              query: PLANNING,
              variables: { monthIndex, year },
            },
            (data) =>
              data && {
                ...data,
                planning: (data?.planning || []).map((planning) => {
                  if (String(planning.id) === String(newTransaction.planningId)) {
                    return {
                      ...planning,
                      transactions: planning?.transactions
                        ? [...planning.transactions, preparedTransaction]
                        : [preparedTransaction],
                    }
                  }
                  return planning
                }) as Planning[],
              },
          )
        } catch (e) {
          console.error('CreateTransaction - Error updating cache PLANNING:', e)
        }
      }
    },
  })
  const createTransaction = async (variables: CreateTransactionMutationVariables) => {
    try {
      const result = await mutate(variables)
      return result?.data?.createTransaction || null
    } catch (e) {
      throw e
    }
  }

  return { createTransaction, loading }
}

export function useDeleteTransaction() {
  const { me } = useMe()

  const { mutate, loading } = useMutation<
    DeleteTransactionMutation,
    DeleteTransactionMutationVariables
  >(DELETE_TRANSACTION, {
    update(cache, { data }) {
      if (!data?.deleteTransaction || !me.value?.me.monthStartDay) return

      const deletedTransaction = data.deleteTransaction
      const transactionDate = new Date(deletedTransaction.date)

      // ===== Update transactions =====
      try {
        const { startDate, endDate } = getDateRangeByDate(
          transactionDate,
          me.value?.me.monthStartDay || 1,
        )

        cache.updateQuery<{ transactions: Transaction[] }>(
          {
            query: TRANSACTIONS,
            variables: { startDate, endDate },
          },
          (data) =>
            data && {
              ...data,
              transactions: (data?.transactions || []).filter(
                (transaction) => transaction.id !== deletedTransaction.id,
              ) as Transaction[],
            },
        )
      } catch (e) {
        console.error('Delete Transaction - Error updating cache TRANSACTIONS:', e)
      }

      // ===== Update planning =====
      if (deletedTransaction.planningId) {
        try {
          const monthIndex = getMonthIndex(transactionDate, me.value?.me.monthStartDay)
          const year = getIndexedYear(transactionDate, me.value?.me.monthStartDay)

          cache.updateQuery<{ planning: Planning[] }>(
            {
              query: PLANNING,
              variables: { monthIndex, year },
            },
            (data) =>
              data && {
                ...data,
                planning: (data?.planning || []).map((planning) => {
                  if (String(planning.id) === String(deletedTransaction.planningId)) {
                    return {
                      ...planning,
                      transactions:
                        planning?.transactions?.length === 1
                          ? null
                          : planning?.transactions?.filter(
                              (transaction) => transaction.id !== deletedTransaction.id,
                            ) || null,
                    }
                  }
                  return planning
                }) as Planning[],
              },
          )
        } catch (e) {
          console.error('Delete Transaction - Error updating cache PLANNING:', e)
        }
      }
    },
  })
  const deleteTransaction = async (variables: DeleteTransactionMutationVariables) => {
    try {
      const result = await mutate(variables)
      return result?.data?.deleteTransaction || null
    } catch (e) {
      throw e
    }
  }

  return { deleteTransaction, loading }
}

export function useUpdateTransaction() {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate, loading } = useMutation<
    UpdateTransactionMutation,
    UpdateTransactionMutationVariables
  >(UPDATE_TRANSACTION, {
    update(cache, { data }) {
      if (!data?.updateTransaction || !me.value?.me.monthStartDay) return

      const updatedTransaction = data.updateTransaction
      const transactionDate = new Date(updatedTransaction.date)
      const { startDate, endDate } = getDateRangeByDate(
        transactionDate,
        me.value?.me.monthStartDay || 1,
      )
      const statisticDateRange = getDateRangeByDate(statisticDate.value, me.value?.me.monthStartDay)
      const isDifferentLists = startDate.getTime() !== statisticDateRange.startDate.getTime()
      console.log('isDifferentLists', isDifferentLists)

      // ===== Update transactions =====
      try {
        if (isDifferentLists) {
          // Update new list
          cache.updateQuery<{ transactions: Transaction[] }>(
            {
              query: TRANSACTIONS,
              variables: { startDate, endDate },
            },
            (data) =>
              data && {
                ...data,
                transactions: [updatedTransaction, ...(data?.transactions || [])] as Transaction[],
              },
          )
          // Update old list
          cache.updateQuery<{ transactions: Transaction[] }>(
            {
              query: TRANSACTIONS,
              variables: {
                startDate: statisticDateRange.startDate,
                endDate: statisticDateRange.endDate,
              },
            },
            (data) =>
              data && {
                ...data,
                transactions: (data?.transactions || []).filter(
                  (transaction) => transaction.id !== updatedTransaction.id,
                ),
              },
          )
        } else {
          cache.updateQuery<{ transactions: Transaction[] }>(
            {
              query: TRANSACTIONS,
              variables: { startDate, endDate },
            },
            (data) =>
              data && {
                ...data,
                transactions: (data?.transactions || []).map((transaction) =>
                  transaction.id === updatedTransaction.id ? updatedTransaction : transaction,
                ) as Transaction[],
              },
          )
        }
      } catch (e) {
        console.error('UpdateTransaction - Error updating cache TRANSACTIONS:', e)
      }

      // ===== Update planning =====
      if (updatedTransaction.planningId) {
        try {
          const monthIndex = getMonthIndex(
            isDifferentLists ? statisticDate.value : transactionDate,
            me.value?.me.monthStartDay,
          )
          const year = getIndexedYear(
            isDifferentLists ? statisticDate.value : transactionDate,
            me.value?.me.monthStartDay,
          )

          const preparedTransaction = {
            id: updatedTransaction.id,
            amount: updatedTransaction.amount,
            currency: updatedTransaction.currency,
            exchangeRate: {
              rates: updatedTransaction.exchangeRate.rates,
            },
          }

          cache.updateQuery<{ planning: Planning[] }>(
            {
              query: PLANNING,
              variables: { monthIndex, year },
            },
            (data) =>
              data && {
                ...data,
                planning: (data?.planning || []).map((planning) => {
                  // Update current planning
                  if (String(planning.id) === String(updatedTransaction.planningId)) {
                    const isTransactionExist = planning.transactions?.some(
                      (transaction) => transaction.id === updatedTransaction.id,
                    )
                    const newTransactions = isTransactionExist
                      ? planning.transactions?.map((transaction) =>
                          transaction.id === updatedTransaction.id
                            ? preparedTransaction
                            : transaction,
                        )
                      : [...(planning.transactions || []), preparedTransaction]

                    return {
                      ...planning,
                      transactions: newTransactions,
                    }
                  }
                  // Update other (old) planning
                  if (planning.transactions) {
                    const newTransactions = planning.transactions.filter(
                      (transaction) => transaction.id !== updatedTransaction.id,
                    )
                    return {
                      ...planning,
                      transactions: newTransactions.length ? newTransactions : null,
                    }
                  }
                  // Planning without transactions
                  return planning
                }) as Planning[],
              },
          )
        } catch (e) {
          console.error('UpdateTransaction - Error updating cache PLANNING:', e)
        }
      }
    },
  })
  const updateTransaction = async (variables: UpdateTransactionMutationVariables) => {
    try {
      const result = await mutate(variables)
      return result?.data?.updateTransaction || null
    } catch (e) {
      throw e
    }
  }

  return { updateTransaction, loading }
}

export function useTransactionList() {
  const { statisticDate } = useStatisticDateStore()
  const { me } = useMe()

  const variables = computed(() =>
    getDateRangeByDate(statisticDate.value, me.value?.me.monthStartDay || 1),
  )

  const { result, loading } = useQuery<TransactionsQuery, TransactionsQueryVariables>(
    TRANSACTIONS,
    variables,
    {
      fetchPolicy: 'cache-first',
    },
  )

  return {
    transactions: result,
    loading,
  }
}
