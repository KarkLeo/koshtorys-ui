import type { components } from '@/api/types'

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
