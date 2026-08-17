import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getMonthIndex,
  getIndexedYear,
  getExchangeDate,
  getMonthPeriod,
  getStartMonthDate,
  getChangedDateByMonthIndex,
} from './date'

describe('getMonthIndex', () => {
  it('should return the current month index if monthStartDay is not provided', () => {
    expect(getMonthIndex(new Date('2024-06-15'))).toBe(5)
    expect(getMonthIndex(new Date('2024-12-01'))).toBe(11)
  })

  it('should shift the month correctly when monthStartDay is provided', () => {
    expect(getMonthIndex(new Date('2024-06-10'), 5)).toBe(5)
    expect(getMonthIndex(new Date('2024-06-04'), 5)).toBe(4)
  })

  it('should handle month shift for start days > 15', () => {
    expect(getMonthIndex(new Date('2024-06-10'), 20)).toBe(5)
    expect(getMonthIndex(new Date('2024-05-21'), 20)).toBe(5)
  })

  it('should correctly handle year transitions (December -> January and vice versa)', () => {
    expect(getMonthIndex(new Date('2024-01-10'), 5)).toBe(0)
    expect(getMonthIndex(new Date('2024-01-04'), 5)).toBe(11)
    expect(getMonthIndex(new Date('2024-12-10'), 20)).toBe(11)
    expect(getMonthIndex(new Date('2024-12-21'), 20)).toBe(0)
  })
})

describe('getIndexedYear', () => {
  it('should return the current year if monthStartDay is not provided', () => {
    expect(getIndexedYear(new Date('2024-06-15'))).toBe(2024)
    expect(getIndexedYear(new Date('2024-12-01'))).toBe(2024)
    expect(getIndexedYear(new Date('2024-01-01'))).toBe(2024)
  })

  it('should shift the year correctly when monthStartDay is provided', () => {
    expect(getIndexedYear(new Date('2024-06-10'), 5)).toBe(2024)
    expect(getIndexedYear(new Date('2024-12-10'), 5)).toBe(2024)
    expect(getIndexedYear(new Date('2024-01-10'), 5)).toBe(2024)
    expect(getIndexedYear(new Date('2025-01-04'), 5)).toBe(2024)
  })

  it('should handle month shift for start days > 15', () => {
    expect(getIndexedYear(new Date('2024-06-10'), 20)).toBe(2024)
    expect(getIndexedYear(new Date('2024-12-21'), 20)).toBe(2025)
    expect(getIndexedYear(new Date('2024-12-10'), 20)).toBe(2024)
    expect(getIndexedYear(new Date('2025-01-01'), 20)).toBe(2025)
  })
})

/**
 * `getExchangeDate` compares the requested financial month against "now", so the
 * cases that expect today's date back cannot use hard-coded years — they rot as
 * soon as that year is in the past, which is exactly what happened to the 2025
 * ones. The clock is frozen three days before the test run instead: the months
 * under test stay relative to the real calendar, and `new Date()` inside the
 * helper matches the expectation exactly (the old `toEqual(new Date())` compared
 * two separate calls and could have raced on the millisecond).
 *
 * The cases that expect a computed past date keep their hard-coded years — those
 * are permanently in the past and stay stable.
 */
describe('getExchangeDate', () => {
  const anchor = new Date()
  anchor.setDate(anchor.getDate() - 3)

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(anchor)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  /** Financial month holding `anchor`, shifted by `delta` months. */
  const monthAt = (delta: number, monthStartDay: number): [number, number] => {
    const shifted = new Date(
      getIndexedYear(anchor, monthStartDay),
      getMonthIndex(anchor, monthStartDay) + delta,
      1,
    )
    return [shifted.getMonth(), shifted.getFullYear()]
  }

  it('should return the current date for the current month', () => {
    const [monthIndex, year] = monthAt(0, 5)
    const result = getExchangeDate(monthIndex, year, 5)
    expect(result).toEqual(anchor)
  })

  it('should return the current date for the next month', () => {
    const [monthIndex, year] = monthAt(1, 5)
    const result = getExchangeDate(monthIndex, year, 5)
    expect(result).toEqual(anchor)
  })

  it('should return the last day of the previous month', () => {
    const result = getExchangeDate(0, 2025, 5)
    expect(result).toEqual(new Date(2025, 1, 4))
  })

  it('should return the current date for the current month, monthStartDay > 15', () => {
    const [monthIndex, year] = monthAt(0, 20)
    const result = getExchangeDate(monthIndex, year, 20)
    expect(result).toEqual(anchor)
  })

  it('should return the current date for the next month, monthStartDay > 15', () => {
    const [monthIndex, year] = monthAt(1, 20)
    const result = getExchangeDate(monthIndex, year, 20)
    expect(result).toEqual(anchor)
  })

  it('should return the last day of the previous month, monthStartDay > 15', () => {
    const result = getExchangeDate(0, 2025, 20)
    expect(result).toEqual(new Date(2025, 0, 19))
  })

  it('should return the last day of the previous year for December', () => {
    const result = getExchangeDate(11, 2024, 5)
    expect(result).toEqual(new Date(2025, 0, 4))
  })

  it('should return the last day of the previous year for December, monthStartDay > 15', () => {
    const result = getExchangeDate(11, 2024, 20)
    expect(result).toEqual(new Date(2024, 11, 19))
  })
})

describe('getMonthPeriod', () => {
  it('should return correct period for a date before monthStartDay', () => {
    const date = new Date(2024, 1, 5)
    const monthStartDay = 10
    const [start, end] = getMonthPeriod(monthStartDay, date)

    expect(start).toEqual(new Date(2024, 0, 10))
    expect(end).toEqual(new Date(2024, 1, 9))
  })

  it('should return correct period for a date on or after monthStartDay', () => {
    const date = new Date(2024, 1, 15)
    const monthStartDay = 10
    const [start, end] = getMonthPeriod(monthStartDay, date)

    expect(start).toEqual(new Date(2024, 1, 10))
    expect(end).toEqual(new Date(2024, 2, 9))
  })

  it('should handle default monthStartDay correctly', () => {
    const date = new Date(2024, 1, 5)
    const [start, end] = getMonthPeriod(undefined, date)

    expect(start).toEqual(new Date(2024, 1, 1))
    expect(end).toEqual(new Date(2024, 1, 29))
  })

  it('should handle edge case when date is exactly on monthStartDay', () => {
    const date = new Date(2024, 1, 10)
    const monthStartDay = 10
    const [start, end] = getMonthPeriod(monthStartDay, date)

    expect(start).toEqual(new Date(2024, 1, 10))
    expect(end).toEqual(new Date(2024, 2, 9))
  })
})

describe('getStartMonthDate', () => {
  it('should return the correct date without monthStartDay', () => {
    const result = getStartMonthDate(2025, 5)
    expect(result).toEqual(new Date(2025, 5, 1))
  })

  it('should return the correct date with monthStartDay < 15', () => {
    const result = getStartMonthDate(2025, 5, 5)
    expect(result).toEqual(new Date(2025, 5, 5))
  })

  it('should return the correct date for the next month, monthStartDay > 15', () => {
    const result = getStartMonthDate(2025, 5, 20)
    expect(result).toEqual(new Date(2025, 4, 20))
  })

  it('should return the correct date for December', () => {
    const result = getStartMonthDate(2024, 11, 10)
    expect(result).toEqual(new Date(2024, 11, 10))
  })

  it('should return the correct date for December, monthStartDay > 15', () => {
    const result = getStartMonthDate(2025, 0, 20)
    expect(result).toEqual(new Date(2024, 11, 20))
  })
})

describe('getChangedDateByMonthIndex', () => {
  it('should return the correct date without monthStartDay', () => {
    const result = getChangedDateByMonthIndex(new Date('2025-01-15T00:00:00.000Z'), 2025, 5)
    expect(result).toEqual(new Date(2025, 5, 15))
  })

  it('should return the correct date with monthStartDay', () => {
    const result = getChangedDateByMonthIndex(new Date('2025-01-15T00:00:00.000Z'), 2025, 5, 10)
    expect(result).toEqual(new Date(2025, 5, 15))
  })

  it('should return the correct date with monthStartDay, date < monthStartDay', () => {
    const result = getChangedDateByMonthIndex(new Date('2025-01-05T00:00:00.000Z'), 2025, 5, 10)
    expect(result).toEqual(new Date(2025, 6, 5))
  })

  it('should return the correct date with monthStartDay, monthStartDay > 15', () => {
    const result = getChangedDateByMonthIndex(new Date('2025-01-15T00:00:00.000Z'), 2025, 5, 20)
    expect(result).toEqual(new Date(2025, 5, 15))
  })

  it('should return the correct date with monthStartDay, monthStartDay > 15, date > monthStartDay', () => {
    const result = getChangedDateByMonthIndex(new Date('2025-01-25T00:00:00.000Z'), 2025, 5, 20)
    expect(result).toEqual(new Date(2025, 4, 25))
  })
})
