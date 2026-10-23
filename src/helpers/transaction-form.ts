import type { components } from '@/api/types'
import { getIndexedYear, getMonthIndex, getStartMonthDate, toLocalDateKey } from '@/helpers/date'

export type CreateTransactionDto = components['schemas']['CreateTransactionDto']
export type UpdateTransactionDto = components['schemas']['UpdateTransactionDto']

export interface TransactionFormState {
  amount: string
  currency: string
  description: string
  categoryId: string
  date: Date
}

export interface PlanningLike {
  amount?: number
  currency?: string
  description?: string
  categoryId?: string
  date?: string | null
}

/** Заполняет форму из плана только если сумма И описание пусты (поведение старой формы). */
export function applyPlanningToForm(
  current: TransactionFormState,
  plan: PlanningLike,
  userCurrency: string,
): TransactionFormState {
  if (current.amount !== '' || current.description !== '') return current
  return {
    amount: String(plan.amount ?? 0),
    currency: plan.currency || userCurrency,
    description: plan.description || '',
    categoryId: plan.categoryId || '',
    date: plan.date ? new Date(plan.date) : new Date(),
  }
}

/** The financial month a plan belongs to, as the API stores it. */
export interface PlanMonth {
  monthIndex: number
  year: number
}

export interface DateBounds {
  min: Date
  max: Date
}

/** How many financial months back, the current one included, a transaction may be dated. */
export const TRANSACTION_HISTORY_MONTHS = 12

/** First day of the oldest financial month a transaction may be dated in (the API enforces it too). */
export function transactionHistoryStart(monthStartDay: number, now: Date): Date {
  return getStartMonthDate(
    getIndexedYear(now, monthStartDay),
    getMonthIndex(now, monthStartDay) - (TRANSACTION_HISTORY_MONTHS - 1),
    monthStartDay,
  )
}

/**
 * The days a transaction may take: never after today or before the last
 * `TRANSACTION_HISTORY_MONTHS` financial months, and once it is linked to a plan, only inside
 * that plan's financial month. Null when the plan's month has not started yet, or ended before
 * the window.
 */
export function transactionDateBounds(
  planMonth: PlanMonth | null,
  monthStartDay: number,
  now: Date,
): DateBounds | null {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const historyStart = transactionHistoryStart(monthStartDay, now)
  if (!planMonth) return { min: historyStart, max: today }

  const start = getStartMonthDate(planMonth.year, planMonth.monthIndex, monthStartDay)
  if (start > today) return null
  const end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate() - 1)
  if (end < historyStart) return null
  return { min: start, max: end < today ? end : today }
}

/** Moves a date into the bounds by calendar day; a date that already fits comes back as is. */
export function clampToBounds(date: Date, bounds: DateBounds): Date {
  const day = toLocalDateKey(date)
  if (day < toLocalDateKey(bounds.min)) return bounds.min
  if (day > toLocalDateKey(bounds.max)) return bounds.max
  return date
}

/** Собирает payload для POST /transactions из состояния формы. */
export function buildCreateTransactionDto(
  state: TransactionFormState & { planningId: string | null },
): CreateTransactionDto {
  const dto: CreateTransactionDto = {
    amount: parseFloat(state.amount),
    currency: state.currency as CreateTransactionDto['currency'],
    description: state.description,
    categoryId: state.categoryId,
    date: state.date.toISOString(),
  }
  if (state.planningId) dto.planningId = Number(state.planningId)
  return dto
}

/** Собирает payload для PATCH /transactions/:id из состояния формы (edit). */
export function buildUpdateTransactionDto(
  state: TransactionFormState & { planningId: string | null },
): UpdateTransactionDto {
  const dto: UpdateTransactionDto = {
    amount: parseFloat(state.amount),
    currency: state.currency as UpdateTransactionDto['currency'],
    description: state.description,
    categoryId: state.categoryId,
    date: state.date.toISOString(),
  }
  if (state.planningId) dto.planningId = Number(state.planningId)
  return dto
}
