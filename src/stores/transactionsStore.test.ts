import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Мокаем REST-сервис до импорта стора.
vi.mock('@/api/services/transaction.service', () => ({
  transactionApi: {
    findAll: vi.fn(),
  },
}))

import { transactionApi } from '@/api/services/transaction.service'
import { useTransactionsStore, monthKeyOf } from './transactionsStore'

const findAll = transactionApi.findAll as ReturnType<typeof vi.fn>

const date = new Date(2026, 4, 20) // фин. месяц при monthStartDay=6: 06.05–05.06
const monthStartDay = 6
const dummyTx = { id: 1, date: '2026-05-20T00:00:00.000Z' }

describe('transactionsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    findAll.mockReset()
  })

  it('monthKeyOf is stable for dates within the same financial month', () => {
    const k1 = monthKeyOf(new Date(2026, 4, 20), monthStartDay)
    const k2 = monthKeyOf(new Date(2026, 4, 25), monthStartDay)
    expect(k1).toBe(k2)
  })

  it('fetchMonth loads and caches transactions', async () => {
    findAll.mockResolvedValue([dummyTx])
    const store = useTransactionsStore()
    await store.fetchMonth(date, monthStartDay)
    expect(findAll).toHaveBeenCalledTimes(1)
    expect(store.getMonth(monthKeyOf(date, monthStartDay))).toEqual([dummyTx])
  })

  it('has() reflects whether a month is cached', async () => {
    findAll.mockResolvedValue([dummyTx])
    const store = useTransactionsStore()
    const key = monthKeyOf(date, monthStartDay)
    expect(store.has(key)).toBe(false)
    await store.fetchMonth(date, monthStartDay)
    expect(store.has(key)).toBe(true)
  })

  it('fetchMonth does not refetch a cached month', async () => {
    findAll.mockResolvedValue([dummyTx])
    const store = useTransactionsStore()
    await store.fetchMonth(date, monthStartDay)
    await store.fetchMonth(date, monthStartDay)
    expect(findAll).toHaveBeenCalledTimes(1)
  })

  it('fetchMonth with force refetches a cached month', async () => {
    findAll.mockResolvedValue([dummyTx])
    const store = useTransactionsStore()
    await store.fetchMonth(date, monthStartDay)
    await store.fetchMonth(date, monthStartDay, { force: true })
    expect(findAll).toHaveBeenCalledTimes(2)
  })

  it('invalidate(date) removes the cached month', async () => {
    findAll.mockResolvedValue([dummyTx])
    const store = useTransactionsStore()
    await store.fetchMonth(date, monthStartDay)
    store.invalidate(date, monthStartDay)
    expect(store.getMonth(monthKeyOf(date, monthStartDay))).toBeUndefined()
  })

  it('invalidate() with no args clears the whole cache', async () => {
    findAll.mockResolvedValue([dummyTx])
    const store = useTransactionsStore()
    await store.fetchMonth(date, monthStartDay)
    store.invalidate()
    expect(store.getMonth(monthKeyOf(date, monthStartDay))).toBeUndefined()
  })

  it('records an error when findAll rejects', async () => {
    findAll.mockRejectedValue(new Error('network'))
    const store = useTransactionsStore()
    await store.fetchMonth(date, monthStartDay)
    expect(store.hasError(monthKeyOf(date, monthStartDay))).toBe(true)
    expect(store.isLoading(monthKeyOf(date, monthStartDay))).toBe(false)
  })
})
