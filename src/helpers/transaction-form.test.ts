// src/helpers/transaction-form.test.ts
import { describe, it, expect } from 'vitest'
import {
  applyPlanningToForm,
  buildCreateTransactionDto,
  mapApiErrorCodes,
} from '@/helpers/transaction-form'

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
      { amount: '', currency: 'USD', description: '', categoryId: '', date: new Date('2026-01-01') },
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
    const current = { amount: '10', currency: 'USD', description: '', categoryId: '', date: new Date('2026-01-01') }
    const result = applyPlanningToForm(current, plan, 'USD')
    expect(result).toEqual(current)
  })

  it('НЕ перетирает, если description уже заполнен', () => {
    const current = { amount: '', currency: 'USD', description: 'моё', categoryId: '', date: new Date('2026-01-01') }
    const result = applyPlanningToForm(current, plan, 'USD')
    expect(result).toEqual(current)
  })

  it('фолбэк валюты на userCurrency, если у плана нет валюты', () => {
    const result = applyPlanningToForm(
      { amount: '', currency: 'USD', description: '', categoryId: '', date: new Date('2026-01-01') },
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

describe('mapApiErrorCodes', () => {
  it('возвращает errorCodes из ApiError', () => {
    const err = Object.assign(new Error('bad'), { name: 'ApiError', errorCodes: { amount: 'amount_min' } })
    expect(mapApiErrorCodes(err)).toEqual({ amount: 'amount_min' })
  })

  it('возвращает пустой объект для неизвестной ошибки', () => {
    expect(mapApiErrorCodes(new Error('boom'))).toEqual({})
  })
})
