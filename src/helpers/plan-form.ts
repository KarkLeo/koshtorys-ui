import type { components } from '@/api/types'

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
