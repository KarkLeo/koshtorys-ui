import { describe, it, expect } from 'vitest'
import {
  toLocalDateString,
  formatPlanDate,
  buildCreatePlanDto,
  buildUpdatePlanDto,
  isPlanMonthLocked,
  planDateBounds,
  planMonthOf,
  planMonthPeriod,
  planMonthWindow,
  type PlanFormState,
} from '@/helpers/plan-form'
import { toLocalDateKey } from '@/helpers/date'

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

// 23 October 2026, local noon.
const now = new Date(2026, 9, 23, 12)
const days = (bounds: { min: Date; max: Date }) => [
  toLocalDateKey(bounds.min),
  toLocalDateKey(bounds.max),
]

describe('planMonthOf', () => {
  it('is the calendar month when the month starts on the 1st', () => {
    expect(planMonthOf(new Date(2026, 9, 23), 1)).toEqual({ monthIndex: 9, year: 2026 })
  })

  it('is indexed by the next month once a start day > 15 is reached', () => {
    expect(planMonthOf(new Date(2026, 9, 23), 20)).toEqual({ monthIndex: 10, year: 2026 })
    expect(planMonthOf(new Date(2026, 9, 10), 20)).toEqual({ monthIndex: 9, year: 2026 })
  })

  it('crosses into the next year', () => {
    expect(planMonthOf(new Date(2026, 11, 25), 20)).toEqual({ monthIndex: 0, year: 2027 })
  })
})

describe('planMonthWindow', () => {
  it('spans 11 months back and 12 ahead of the current month', () => {
    expect(planMonthWindow(1, now)).toEqual({
      min: { monthIndex: 10, year: 2025 },
      max: { monthIndex: 9, year: 2027 },
    })
  })

  it('counts from the current month index for start days > 15', () => {
    expect(planMonthWindow(20, now)).toEqual({
      min: { monthIndex: 11, year: 2025 },
      max: { monthIndex: 10, year: 2027 },
    })
  })
})

describe('planMonthPeriod', () => {
  it('runs from the start day to the day before it next month', () => {
    expect(days(planMonthPeriod({ monthIndex: 2, year: 2026 }, 20))).toEqual([
      '2026-02-20',
      '2026-03-19',
    ])
  })

  it('is the calendar month when the month starts on the 1st', () => {
    expect(days(planMonthPeriod({ monthIndex: 1, year: 2028 }, 1))).toEqual([
      '2028-02-01',
      '2028-02-29',
    ])
  })
})

describe('isPlanMonthLocked', () => {
  it('locks a plan with a linked transaction', () => {
    expect(isPlanMonthLocked({ monthIndex: 9, year: 2026 }, 1, 1, now)).toBe(true)
  })

  it('leaves a plan in the window free', () => {
    expect(isPlanMonthLocked({ monthIndex: 9, year: 2026 }, 0, 1, now)).toBe(false)
    expect(isPlanMonthLocked({ monthIndex: 10, year: 2025 }, 0, 1, now)).toBe(false)
    expect(isPlanMonthLocked({ monthIndex: 9, year: 2027 }, 0, 1, now)).toBe(false)
  })

  it('locks a plan whose month is already outside the window', () => {
    expect(isPlanMonthLocked({ monthIndex: 9, year: 2025 }, 0, 1, now)).toBe(true)
    expect(isPlanMonthLocked({ monthIndex: 10, year: 2027 }, 0, 1, now)).toBe(true)
  })
})

describe('planDateBounds', () => {
  it('spans the whole window while the month is free', () => {
    expect(days(planDateBounds({ monthIndex: 9, year: 2026 }, false, 1, now))).toEqual([
      '2025-11-01',
      '2027-10-31',
    ])
  })

  it('keeps a locked plan inside its own month', () => {
    expect(days(planDateBounds({ monthIndex: 9, year: 2026 }, true, 1, now))).toEqual([
      '2026-10-01',
      '2026-10-31',
    ])
  })
})
