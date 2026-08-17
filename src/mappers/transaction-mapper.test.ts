import { describe, it, expect } from 'vitest'
import { toDisplayTransaction } from './transaction-mapper'
import type { components } from '@/api/types'

type TransactionResponseDto = components['schemas']['TransactionResponseDto']

const baseDto = (overrides: Partial<TransactionResponseDto> = {}): TransactionResponseDto =>
  ({
    id: 123,
    userId: 1,
    amount: 100,
    currency: 'EUR',
    date: '2026-05-30T10:30:00.000Z',
    categoryId: 'food--groceries',
    description: 'Продукти',
    exchangeRateId: 7,
    planningId: null,
    createdAt: '2026-05-30T10:35:00.000Z',
    updatedAt: '2026-05-30T10:35:00.000Z',
    exchangeRate: {
      id: 7,
      base: 'EUR',
      date: '2026-05-30T00:00:00.000Z',
      rates: { USD: 1.08, EUR: 1, UAH: 41.25 },
    },
    ...overrides,
  }) as TransactionResponseDto

describe('toDisplayTransaction', () => {
  it('maps scalar fields and parses dates', () => {
    const result = toDisplayTransaction(baseDto(), 'EUR')
    expect(result.id).toBe('123')
    expect(result.categoryId).toBe('food--groceries')
    expect(result.description).toBe('Продукти')
    expect(result.date).toBeInstanceOf(Date)
    expect(result.date.getTime()).toBe(new Date('2026-05-30T10:30:00.000Z').getTime())
    expect(result.createdAt).toBeInstanceOf(Date)
  })

  it('keeps amount as-is when transaction currency equals user currency', () => {
    const result = toDisplayTransaction(baseDto({ amount: 52, currency: 'EUR' }), 'EUR')
    expect(result.amount).toBe(52)
    expect(result.currency).toBe('EUR')
    expect(result.originalAmount).toBeUndefined()
    expect(result.originalCurrency).toBeUndefined()
  })

  it('converts amount to user currency and keeps the original', () => {
    // 108 USD при курсах USD:1.08, EUR:1 → 108 / 1.08 * 1 = 100 EUR
    const dto = baseDto({ amount: 108, currency: 'USD' })
    const result = toDisplayTransaction(dto, 'EUR')
    expect(result.amount).toBeCloseTo(100, 6)
    expect(result.currency).toBe('EUR')
    expect(result.originalAmount).toBe(108)
    expect(result.originalCurrency).toBe('USD')
  })

  it('maps null description to undefined and null planningId to null', () => {
    const result = toDisplayTransaction(baseDto({ description: null, planningId: null }), 'EUR')
    expect(result.description).toBeUndefined()
    expect(result.planningId).toBeNull()
  })

  it('stringifies a numeric planningId', () => {
    const result = toDisplayTransaction(baseDto({ planningId: 42 }), 'EUR')
    expect(result.planningId).toBe('42')
  })
})
