import { describe, it, expect } from 'vitest'
import {
  toLocalDateString,
  formatPlanDate,
  buildCreatePlanDto,
  buildUpdatePlanDto,
  type PlanFormState,
} from '@/helpers/plan-form'

const oneOffState: PlanFormState = {
  type: 'TRANSACTION',
  amount: '120.50',
  currency: 'EUR',
  description: 'New laptop',
  categoryId: 'food--groceries',
  date: new Date(2026, 7, 15), // 15 Aug 2026, local
  repeat: false,
}

const dynamicState: PlanFormState = {
  type: 'CATEGORY',
  amount: '200',
  currency: 'UAH',
  description: 'ignored',
  categoryId: 'food--groceries',
  date: new Date(2026, 7, 15),
  repeat: true,
}

describe('toLocalDateString', () => {
  it('formats a local date without shifting the day', () => {
    expect(toLocalDateString(new Date(2026, 7, 15))).toBe('2026-08-15')
  })

  it('zero-pads month and day', () => {
    expect(toLocalDateString(new Date(2026, 0, 3))).toBe('2026-01-03')
  })

  it('keeps the local day even just before midnight', () => {
    expect(toLocalDateString(new Date(2026, 7, 15, 23, 59))).toBe('2026-08-15')
  })
})

describe('formatPlanDate', () => {
  it('returns an empty string for null and undefined', () => {
    expect(formatPlanDate(null)).toBe('')
    expect(formatPlanDate(undefined)).toBe('')
  })

  it('reads the calendar day out of a UTC ISO string without drifting', () => {
    expect(formatPlanDate('2026-08-15T00:00:00.000Z', 'en-GB')).toBe('15 Aug 2026')
  })

  it('accepts a bare YYYY-MM-DD string', () => {
    expect(formatPlanDate('2026-01-03', 'en-GB')).toBe('3 Jan 2026')
  })
})

describe('buildCreatePlanDto', () => {
  it('builds a one-off plan payload with description and local date', () => {
    expect(buildCreatePlanDto(oneOffState, 7, 2026)).toEqual({
      type: 'TRANSACTION',
      amount: 120.5,
      currency: 'EUR',
      categoryId: 'food--groceries',
      monthIndex: 7,
      year: 2026,
      repeat: false,
      description: 'New laptop',
      date: '2026-08-15',
    })
  })

  it('omits description and date for a dynamic plan', () => {
    const dto = buildCreatePlanDto(dynamicState, 7, 2026)
    expect(dto).toEqual({
      type: 'CATEGORY',
      amount: 200,
      currency: 'UAH',
      categoryId: 'food--groceries',
      monthIndex: 7,
      year: 2026,
      repeat: true,
    })
    expect(dto).not.toHaveProperty('description')
    expect(dto).not.toHaveProperty('date')
  })

  it('omits date when a one-off plan has none', () => {
    const dto = buildCreatePlanDto({ ...oneOffState, date: null }, 7, 2026)
    expect(dto).not.toHaveProperty('date')
    expect(dto.description).toBe('New laptop')
  })

  it('parses an empty amount as 0', () => {
    expect(buildCreatePlanDto({ ...dynamicState, amount: '' }, 7, 2026).amount).toBe(0)
  })
})

describe('buildUpdatePlanDto', () => {
  it('mirrors the create payload for a one-off plan', () => {
    expect(buildUpdatePlanDto(oneOffState, 7, 2026)).toEqual(buildCreatePlanDto(oneOffState, 7, 2026))
  })

  it('mirrors the create payload for a dynamic plan', () => {
    expect(buildUpdatePlanDto(dynamicState, 7, 2026)).toEqual(
      buildCreatePlanDto(dynamicState, 7, 2026),
    )
  })
})
