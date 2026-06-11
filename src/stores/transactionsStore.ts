import { defineStore } from 'pinia'
import { reactive } from 'vue'

import { transactionApi } from '@/api/services/transaction.service'
import { getDateRangeByDate } from '@/helpers/date.ts'
import type { components } from '@/api/types'

type TransactionResponseDto = components['schemas']['TransactionResponseDto']

/** Ключ кэша = ISO начала финансового месяца. */
export const monthKeyOf = (date: Date, monthStartDay: number): string =>
  getDateRangeByDate(date, monthStartDay).startDate.toISOString()

export const useTransactionsStore = defineStore('transactions', () => {
  const cache = reactive(new Map<string, TransactionResponseDto[]>())
  const loadingKeys = reactive(new Set<string>())
  const errorKeys = reactive(new Set<string>())

  const isLoading = (key: string) => loadingKeys.has(key)
  const hasError = (key: string) => errorKeys.has(key)
  const getMonth = (key: string) => cache.get(key)

  const fetchMonth = async (
    date: Date,
    monthStartDay: number,
    opts: { force?: boolean } = {},
  ) => {
    const key = monthKeyOf(date, monthStartDay)
    if ((!opts.force && cache.has(key)) || loadingKeys.has(key)) return

    const { startDate, endDate } = getDateRangeByDate(date, monthStartDay)
    loadingKeys.add(key)
    errorKeys.delete(key)
    try {
      const data = await transactionApi.findAll(startDate.toISOString(), endDate.toISOString())
      cache.set(key, data)
    } catch {
      errorKeys.add(key)
    } finally {
      loadingKeys.delete(key)
    }
  }

  const invalidate = (date?: Date, monthStartDay?: number) => {
    if (date && monthStartDay != null) {
      cache.delete(monthKeyOf(date, monthStartDay))
    } else {
      cache.clear()
    }
  }

  return { cache, loadingKeys, errorKeys, isLoading, hasError, getMonth, fetchMonth, invalidate }
})
