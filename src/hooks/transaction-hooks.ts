import { watch } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'

import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { getExchangeDate, getIndexedYear, getMonthIndex } from '@/helpers/date.ts'

import type {
  CreateTransactionMutation,
  CreateTransactionMutationVariables,
  DeleteTransactionMutation,
  DeleteTransactionMutationVariables,
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
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<CreateTransactionMutation, CreateTransactionMutationVariables>(
    CREATE_TRANSACTION,
  )
  const createTransaction = async (variables: CreateTransactionMutationVariables) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
      const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
      const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

      const result = await mutate(variables, {
        refetchQueries: [
          { query: TRANSACTIONS, variables: { date: statisticDate.value.toISOString() } },
          { query: PLANNING, variables: { monthIndex, year, exchangeDate } },
        ],
      })
      return result?.data?.createTransaction || null
    } catch (e) {
      throw e
    }
  }

  return { createTransaction }
}

export function useDeleteTransaction() {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<DeleteTransactionMutation, DeleteTransactionMutationVariables>(
    DELETE_TRANSACTION,
  )
  const deleteTransaction = async (variables: DeleteTransactionMutationVariables) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
      const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
      const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

      const result = await mutate(variables, {
        refetchQueries: [
          { query: TRANSACTIONS, variables: { date: statisticDate.value.toISOString() } },
          { query: PLANNING, variables: { monthIndex, year, exchangeDate } },
        ],
      })
      return result?.data?.deleteTransaction || null
    } catch (e) {
      throw e
    }
  }

  return { deleteTransaction }
}

export function useUpdateTransaction() {
  const { me } = useMe()
  const { statisticDate } = useStatisticDateStore()

  const { mutate } = useMutation<UpdateTransactionMutation, UpdateTransactionMutationVariables>(
    UPDATE_TRANSACTION,
  )
  const updateTransaction = async (variables: UpdateTransactionMutationVariables) => {
    try {
      const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
      const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
      const exchangeDate = getExchangeDate(monthIndex, year, me.value?.me.monthStartDay)

      const result = await mutate(variables, {
        refetchQueries: [
          { query: TRANSACTIONS, variables: { date: statisticDate.value.toISOString() } },
          { query: PLANNING, variables: { monthIndex, year, exchangeDate } },
        ],
      })
      return result?.data?.updateTransaction || null
    } catch (e) {
      throw e
    }
  }

  return { updateTransaction }
}

export function useTransactionList() {
  const { statisticDate } = useStatisticDateStore()

  const { result, refetch } = useQuery<TransactionsQuery, TransactionsQueryVariables>(
    TRANSACTIONS,
    {
      date: statisticDate.value.toISOString(),
    },
  )

  watch(statisticDate, (date) => {
    refetch({ date: date.toISOString() })
  })

  return {
    transactions: result,
  }
}
