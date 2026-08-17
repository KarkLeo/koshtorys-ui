// src/validations/transaction.test.ts
import { describe, it, expect } from 'vitest'
import { ValidationError } from 'yup'
import { transactionSchema } from '@/validations/transaction'

/** Прогоняет схему и возвращает карту { поле: код_ошибки } (как делает форма). */
async function collectErrors(data: unknown): Promise<Record<string, string>> {
  try {
    await transactionSchema.validate(data, { abortEarly: false })
    return {}
  } catch (e) {
    return (e as ValidationError).inner.reduce((acc: Record<string, string>, err) => {
      if (err.path && !acc[err.path]) acc[err.path] = err.message
      return acc
    }, {})
  }
}

const validTransaction = {
  amount: 52.5,
  currency: 'EUR',
  date: new Date('2020-01-01T10:00:00.000Z'),
  description: 'Sushi',
  categoryId: 'food--groceries',
}

describe('transactionSchema', () => {
  it('пропускает корректную транзакцию', async () => {
    await expect(transactionSchema.validate(validTransaction)).resolves.toBeTruthy()
  })

  it('пустой description допустим (notRequired)', async () => {
    const errors = await collectErrors({ ...validTransaction, description: '' })
    expect(errors).toEqual({})
  })

  it('требует обязательные поля, когда они отсутствуют', async () => {
    const errors = await collectErrors({})
    expect(errors.amount).toBe('amount_required')
    expect(errors.currency).toBe('currency_required')
    expect(errors.date).toBe('date_required')
    expect(errors.categoryId).toBe('category_required')
  })

  it('amount меньше 0.01 → amount_min', async () => {
    expect((await collectErrors({ ...validTransaction, amount: 0 })).amount).toBe('amount_min')
    expect((await collectErrors({ ...validTransaction, amount: -5 })).amount).toBe('amount_min')
  })

  it('будущая дата → date_max', async () => {
    const future = new Date(Date.now() + 86_400_000)
    expect((await collectErrors({ ...validTransaction, date: future })).date).toBe('date_max')
  })

  it('невалидная валюта → currency_invalid', async () => {
    expect((await collectErrors({ ...validTransaction, currency: 'XXX' })).currency).toBe(
      'currency_invalid',
    )
  })

  it('невалидная категория → category_invalid', async () => {
    expect((await collectErrors({ ...validTransaction, categoryId: 'not-a-category' })).categoryId).toBe(
      'category_invalid',
    )
  })

  it('описание длиннее 255 символов → description_max', async () => {
    const errors = await collectErrors({ ...validTransaction, description: 'x'.repeat(256) })
    expect(errors.description).toBe('description_max')
  })
})
