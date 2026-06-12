import type { components } from '@/api/types'

export type CreateTransactionDto = components['schemas']['CreateTransactionDto']

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

/** Достаёт errorCodes из ApiError (см. api/client.ts), иначе {}. */
export function mapApiErrorCodes(e: unknown): Record<string, string> {
  if (e && typeof e === 'object' && 'errorCodes' in e) {
    const codes = (e as { errorCodes?: unknown }).errorCodes
    if (codes && typeof codes === 'object') return codes as Record<string, string>
  }
  return {}
}
