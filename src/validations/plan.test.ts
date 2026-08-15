import { describe, it, expect } from 'vitest'
import { ValidationError } from 'yup'
import { planSchema } from '@/validations/plan'

const oneOff = {
  type: 'TRANSACTION',
  amount: 100,
  currency: 'EUR',
  categoryId: 'food--groceries',
  description: 'New laptop',
  date: '2026-08-15',
  repeat: false,
}

const dynamic = {
  type: 'CATEGORY',
  amount: 200,
  currency: 'EUR',
  categoryId: 'food--groceries',
  repeat: true,
}

/** Собирает { path: message } из ValidationError, как это делают формы. */
const codesOf = async (input: unknown): Promise<Record<string, string>> => {
  try {
    await planSchema.validate(input, { abortEarly: false })
    return {}
  } catch (e) {
    return (e as ValidationError).inner.reduce((acc: Record<string, string>, err) => {
      if (err.path && !acc[err.path]) acc[err.path] = err.message
      return acc
    }, {})
  }
}

describe('planSchema — one-off (TRANSACTION)', () => {
  it('accepts a fully filled one-off plan', async () => {
    await expect(planSchema.validate(oneOff, { abortEarly: false })).resolves.toBeTruthy()
  })

  it('requires a description', async () => {
    expect(await codesOf({ ...oneOff, description: '' })).toMatchObject({
      description: 'description_required',
    })
  })

  it('rejects a description longer than 255 characters', async () => {
    expect(await codesOf({ ...oneOff, description: 'x'.repeat(256) })).toMatchObject({
      description: 'description_max',
    })
  })

  it('keeps description and date in the validated output', async () => {
    const result = await planSchema.validate(oneOff, { abortEarly: false })
    expect(result.description).toBe('New laptop')
    expect(result.date).toBeInstanceOf(Date)
  })

  it('allows a missing date', async () => {
    const { date, ...withoutDate } = oneOff
    void date
    await expect(planSchema.validate(withoutDate, { abortEarly: false })).resolves.toBeTruthy()
  })
})

describe('planSchema — dynamic (CATEGORY)', () => {
  it('accepts a dynamic plan without description or date', async () => {
    await expect(planSchema.validate(dynamic, { abortEarly: false })).resolves.toBeTruthy()
  })

  it('strips description and date from the validated output', async () => {
    const result = await planSchema.validate(
      { ...dynamic, description: 'ignored', date: '2026-08-15' },
      { abortEarly: false },
    )
    expect(result).not.toHaveProperty('description')
    expect(result).not.toHaveProperty('date')
  })
})

describe('planSchema — shared rules', () => {
  it('rejects an amount at or below zero', async () => {
    expect(await codesOf({ ...dynamic, amount: 0 })).toMatchObject({ amount: 'amount_min' })
  })

  it('rejects an unknown currency', async () => {
    expect(await codesOf({ ...dynamic, currency: 'XXX' })).toMatchObject({
      currency: 'currency_invalid',
    })
  })

  it('rejects an unknown category', async () => {
    expect(await codesOf({ ...dynamic, categoryId: 'not-a-category' })).toMatchObject({
      categoryId: 'category_invalid',
    })
  })

  it('rejects an unknown plan type', async () => {
    expect(await codesOf({ ...dynamic, type: 'SOMETHING' })).toMatchObject({ type: 'type_invalid' })
  })
})
