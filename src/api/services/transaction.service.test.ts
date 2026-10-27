import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../client', () => ({
  default: { get: vi.fn() },
}))

import apiClient from '../client'
import { transactionApi } from './transaction.service'

const get = apiClient.get as ReturnType<typeof vi.fn>

// The statistics place each transaction on the user's local day, so the browser's zone
// has to reach the API: without it the server counts days in UTC.
describe('transactionApi statistics', () => {
  beforeEach(() => {
    get.mockReset().mockResolvedValue({ data: [] })
  })

  it('sends the time zone with the by-category request', async () => {
    await transactionApi.statisticsByCategory('Europe/Kyiv')
    expect(get).toHaveBeenCalledWith('/transactions/statistics/by-category', {
      params: { timeZone: 'Europe/Kyiv' },
    })
  })

  it('sends the time zone with the by-month-day request', async () => {
    await transactionApi.statisticsByMonthDay('America/New_York')
    expect(get).toHaveBeenCalledWith('/transactions/statistics/by-month-day', {
      params: { timeZone: 'America/New_York' },
    })
  })
})
