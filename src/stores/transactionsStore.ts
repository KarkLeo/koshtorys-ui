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

  const has = (key: string) => cache.has(key)
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

    // endDate — эксклюзивная граница (первый момент следующего фин. месяца), как в getDateRangeByDate.
    const { startDate, endDate } = getDateRangeByDate(date, monthStartDay)
    loadingKeys.add(key)
    errorKeys.delete(key)
    try {
      const data = await transactionApi.findAll(startDate.toISOString(), endDate.toISOString())
      cache.set(key, data)
    } catch (e) {
      errorKeys.add(key)
      console.error('[transactionsStore] fetchMonth failed:', e)
    } finally {
      loadingKeys.delete(key)
    }
  }

  /** Инвалидация: оба аргумента — конкретный месяц; без аргументов — весь кэш. */
  const invalidate = (date?: Date, monthStartDay?: number) => {
    if (date && monthStartDay != null) {
      cache.delete(monthKeyOf(date, monthStartDay))
    } else {
      cache.clear()
    }
  }

  return { has, isLoading, hasError, getMonth, fetchMonth, invalidate }
})
