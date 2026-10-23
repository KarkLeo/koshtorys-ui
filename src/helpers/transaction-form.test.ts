// src/helpers/transaction-form.test.ts
import { describe, it, expect } from 'vitest'
import {
  applyPlanningToForm,
  buildCreateTransactionDto,
  buildUpdateTransactionDto,
  clampToBounds,
  transactionDateBounds,
} from '@/helpers/transaction-form'
import { mapApiErrorCodes } from '@/helpers/api-errors'
import { toLocalDateKey } from '@/helpers/date'

const keys = (bounds: { min: Date | null; max: Date } | null) =>
  bounds && { min: bounds.min && toLocalDateKey(bounds.min), max: toLocalDateKey(bounds.max) }

describe('transactionDateBounds', () => {
  // Month starts on the 20th, so the index shifts: Oct 20 – Nov 19 is month 10 (November).
  const now = new Date(2026, 9, 23, 15, 0)

  it('without a plan, allows any day up to today', () => {
    expect(keys(transactionDateBounds(null, 20, now))).toEqual({ min: null, max: '2026-10-23' })
  })

  it("with a plan in the current month, allows that month's days up to today", () => {
    expect(keys(transactionDateBounds({ monthIndex: 10, year: 2026 }, 20, now))).toEqual({
      min: '2026-10-20',
      max: '2026-10-23',
    })
  })

  it("with a plan in a past month, allows exactly that month's days", () => {
    expect(keys(transactionDateBounds({ monthIndex: 9, year: 2026 }, 20, now))).toEqual({
      min: '2026-09-20',
      max: '2026-10-19',
    })
  })

  it('follows the month across a year boundary', () => {
    const january = new Date(2027, 0, 5, 9, 0)
    expect(keys(transactionDateBounds({ monthIndex: 0, year: 2027 }, 20, january))).toEqual({
      min: '2026-12-20',
      max: '2027-01-05',
    })
  })

  it('with a month starting on the 1st, ends on the last calendar day', () => {
    const november = new Date(2026, 10, 10)
    expect(keys(transactionDateBounds({ monthIndex: 9, year: 2026 }, 1, november))).toEqual({
      min: '2026-10-01',
      max: '2026-10-31',
    })
  })

  it("returns null when the plan's month has not started yet", () => {
    expect(transactionDateBounds({ monthIndex: 11, year: 2026 }, 20, now)).toBeNull()
  })
})

describe('clampToBounds', () => {
  const bounds = { min: new Date(2026, 8, 20), max: new Date(2026, 9, 19) }

  it('keeps a date that already fits, time included', () => {
    const inside = new Date(2026, 9, 1, 18, 30)
    expect(clampToBounds(inside, bounds)).toBe(inside)
  })

  it('moves a later date back to the last allowed day', () => {
    expect(toLocalDateKey(clampToBounds(new Date(2026, 9, 23, 12), bounds))).toBe('2026-10-19')
  })

  it('moves an earlier date forward to the first allowed day', () => {
    expect(toLocalDateKey(clampToBounds(new Date(2026, 8, 1), bounds))).toBe('2026-09-20')
  })

  it('with no lower bound, only caps at the maximum', () => {
    const early = new Date(2020, 0, 1)
    expect(clampToBounds(early, { min: null, max: bounds.max })).toBe(early)
  })
})

describe('applyPlanningToForm', () => {
  const plan = {
    amount: 50,
    currency: 'EUR',
    description: 'Суші',
    categoryId: 'food--food-delivery',
    date: '2026-05-02T00:00:00.000Z',
  }

  it('заполняет поля из плана, когда amount и description пусты', () => {
    const result = applyPlanningToForm(
      {
        amount: '',
        currency: 'USD',
        description: '',
        categoryId: '',
        date: new Date('2026-01-01'),
      },
      plan,
      'USD',
    )
    expect(result.amount).toBe('50')
    expect(result.currency).toBe('EUR')
    expect(result.description).toBe('Суші')
    expect(result.categoryId).toBe('food--food-delivery')
    expect(result.date).toEqual(new Date('2026-05-02T00:00:00.000Z'))
  })

  it('НЕ перетирает, если amount уже заполнен', () => {
    const current = {
      amount: '10',
      currency: 'USD',
      description: '',
      categoryId: '',
      date: new Date('2026-01-01'),
    }
    const result = applyPlanningToForm(current, plan, 'USD')
    expect(result).toEqual(current)
  })

  it('НЕ перетирает, если description уже заполнен', () => {
    const current = {
      amount: '',
      currency: 'USD',
      description: 'моё',
      categoryId: '',
      date: new Date('2026-01-01'),
    }
    const result = applyPlanningToForm(current, plan, 'USD')
    expect(result).toEqual(current)
  })

  it('фолбэк валюты на userCurrency, если у плана нет валюты', () => {
    const result = applyPlanningToForm(
      {
        amount: '',
        currency: 'USD',
        description: '',
        categoryId: '',
        date: new Date('2026-01-01'),
      },
      { amount: 0, description: '', categoryId: 'food', date: null },
      'UAH',
    )
    expect(result.currency).toBe('UAH')
    expect(result.amount).toBe('0')
  })
})

describe('buildCreateTransactionDto', () => {
  it('собирает DTO с planningId', () => {
    const dto = buildCreateTransactionDto({
      amount: '52.5',
      currency: 'EUR',
      description: 'Суші',
      categoryId: 'food--food-delivery',
      date: new Date('2026-05-02T10:00:00.000Z'),
      planningId: '7',
    })
    expect(dto).toEqual({
      amount: 52.5,
      currency: 'EUR',
      description: 'Суші',
      categoryId: 'food--food-delivery',
      date: '2026-05-02T10:00:00.000Z',
      planningId: 7,
    })
  })

  it('опускает planningId, когда привязки нет', () => {
    const dto = buildCreateTransactionDto({
      amount: '10',
      currency: 'USD',
      description: '',
      categoryId: 'food',
      date: new Date('2026-05-02T10:00:00.000Z'),
      planningId: null,
    })
    expect(dto.planningId).toBeUndefined()
    expect(dto.amount).toBe(10)
  })
})

describe('buildUpdateTransactionDto', () => {
  it('собирает DTO с planningId', () => {
    const dto = buildUpdateTransactionDto({
      amount: '75.5',
      currency: 'EUR',
      description: 'Оновлено',
      categoryId: 'car--parking',
      date: new Date('2026-05-02T10:00:00.000Z'),
      planningId: '7',
    })
    expect(dto).toEqual({
      amount: 75.5,
      currency: 'EUR',
      description: 'Оновлено',
      categoryId: 'car--parking',
      date: '2026-05-02T10:00:00.000Z',
      planningId: 7,
    })
  })

  it('опускает planningId, когда привязки нет', () => {
    const dto = buildUpdateTransactionDto({
      amount: '10',
      currency: 'USD',
      description: '',
      categoryId: 'food',
      date: new Date('2026-05-02T10:00:00.000Z'),
      planningId: null,
    })
    expect(dto.planningId).toBeUndefined()
    expect(dto.amount).toBe(10)
  })
})

describe('mapApiErrorCodes', () => {
  it('возвращает errorCodes из ApiError', () => {
    const err = Object.assign(new Error('bad'), {
      name: 'ApiError',
      errorCodes: { amount: 'amount_min' },
    })
    expect(mapApiErrorCodes(err)).toEqual({ amount: 'amount_min' })
  })

  it('возвращает пустой объект для неизвестной ошибки', () => {
    expect(mapApiErrorCodes(new Error('boom'))).toEqual({})
  })
})
