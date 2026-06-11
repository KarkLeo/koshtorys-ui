import type { components } from '@/api/types'
import type { DisplayTransaction } from '@/components/transaction/types'

type TransactionResponseDto = components['schemas']['TransactionResponseDto']

export const toDisplayTransaction = (
  dto: TransactionResponseDto,
  userCurrency: string,
): DisplayTransaction => {
  const base: DisplayTransaction = {
    id: String(dto.id),
    amount: dto.amount,
    currency: dto.currency,
    categoryId: dto.categoryId,
    description: dto.description ?? undefined,
    date: new Date(dto.date),
    createdAt: new Date(dto.createdAt),
    planningId: dto.planningId != null ? String(dto.planningId) : null,
  }

  if (userCurrency === dto.currency) return base

  const rates = dto.exchangeRate.rates as Record<string, number>
  const fromRate = rates[dto.currency]
  const toRate = rates[userCurrency]
  // Defensive: без валідних курсів залишаємо вихідну суму/валюту.
  if (!fromRate || !toRate) return base

  return {
    ...base,
    amount: (dto.amount / fromRate) * toRate,
    currency: userCurrency,
    originalAmount: dto.amount,
    originalCurrency: dto.currency,
  }
}
