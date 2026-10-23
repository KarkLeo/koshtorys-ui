import type { components } from '@/api/types'
import { getIndexedYear, getMonthIndex, getStartMonthDate } from '@/helpers/date'
import {
  TRANSACTION_HISTORY_MONTHS,
  type DateBounds,
  type PlanMonth,
} from '@/helpers/transaction-form'

export type CreatePlanDto = components['schemas']['CreatePlanDto']
export type UpdatePlanDto = components['schemas']['UpdatePlanDto']

export interface PlanFormState {
  type: 'TRANSACTION' | 'CATEGORY'
  amount: string
  currency: string
  description: string
  categoryId: string
  date: Date | null
  repeat: boolean
}

/**
 * Локальная дата в виде YYYY-MM-DD.
 * НЕ использовать Date#toISOString(): при положительном смещении UTC локальная
 * полночь уезжает на предыдущий день (тот же баг, что чинили в 3A для курсов).
 */
export function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * Дата плана для отображения. Календарный день берём из первых 10 символов
 * ISO-строки и собираем локальный Date — так день не сдвигается ни в какую сторону.
 */
export function formatPlanDate(iso: string | null | undefined, locale?: string): string {
  if (!iso) return ''
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return ''
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Общая часть payload'а; description/date добавляются только для one-off планов. */
function buildPlanPayload(state: PlanFormState, monthIndex: number, year: number): CreatePlanDto {
  const dto: CreatePlanDto = {
    type: state.type,
    amount: parseFloat(state.amount || '0'),
    currency: state.currency,
    categoryId: state.categoryId,
    monthIndex,
    year,
    repeat: state.repeat,
  }
  if (state.type === 'TRANSACTION') {
    dto.description = state.description
    if (state.date) dto.date = toLocalDateString(state.date)
  }
  return dto
}

/** Собирает payload для POST /plans из состояния формы. */
export function buildCreatePlanDto(
  state: PlanFormState,
  monthIndex: number,
  year: number,
): CreatePlanDto {
  return buildPlanPayload(state, monthIndex, year)
}

/** Собирает payload для PATCH /plans/:id из состояния формы (edit). */
export function buildUpdatePlanDto(
  state: PlanFormState,
  monthIndex: number,
  year: number,
): UpdatePlanDto {
  return buildPlanPayload(state, monthIndex, year)
}

/** How many financial months after the current one a plan may be placed in (the API enforces it too). */
export const PLAN_MONTHS_AHEAD = 12

const monthNumber = (month: PlanMonth) => month.year * 12 + month.monthIndex
const fromMonthNumber = (n: number): PlanMonth => ({
  monthIndex: ((n % 12) + 12) % 12,
  year: Math.floor(n / 12),
})

/** The financial month a day falls in. */
export function planMonthOf(date: Date, monthStartDay: number): PlanMonth {
  return {
    monthIndex: getMonthIndex(date, monthStartDay),
    year: getIndexedYear(date, monthStartDay),
  }
}

/**
 * The months a plan may be placed in: back as far as its transactions can still be dated, and
 * `PLAN_MONTHS_AHEAD` forward.
 */
export function planMonthWindow(
  monthStartDay: number,
  now: Date,
): { min: PlanMonth; max: PlanMonth } {
  const current = monthNumber(planMonthOf(now, monthStartDay))
  return {
    min: fromMonthNumber(current - (TRANSACTION_HISTORY_MONTHS - 1)),
    max: fromMonthNumber(current + PLAN_MONTHS_AHEAD),
  }
}

/** The first and last day of a financial month. */
export function planMonthPeriod(month: PlanMonth, monthStartDay: number): DateBounds {
  const next = getStartMonthDate(month.year, month.monthIndex + 1, monthStartDay)
  return {
    min: getStartMonthDate(month.year, month.monthIndex, monthStartDay),
    max: new Date(next.getFullYear(), next.getMonth(), next.getDate() - 1),
  }
}

/**
 * A plan keeps its month once a transaction is linked to it, since that transaction must stay
 * inside the month, and when the month is already outside the window, where it can't come back.
 */
export function isPlanMonthLocked(
  month: PlanMonth,
  linkedCount: number,
  monthStartDay: number,
  now: Date,
): boolean {
  if (linkedCount > 0) return true
  const { min, max } = planMonthWindow(monthStartDay, now)
  return monthNumber(month) < monthNumber(min) || monthNumber(month) > monthNumber(max)
}

/** The days a one-off plan may be dated: anywhere in the window, or its own month once locked. */
export function planDateBounds(
  month: PlanMonth,
  locked: boolean,
  monthStartDay: number,
  now: Date,
): DateBounds {
  if (locked) return planMonthPeriod(month, monthStartDay)
  const { min, max } = planMonthWindow(monthStartDay, now)
  return {
    min: planMonthPeriod(min, monthStartDay).min,
    max: planMonthPeriod(max, monthStartDay).max,
  }
}
