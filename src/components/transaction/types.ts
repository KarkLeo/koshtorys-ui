export interface DisplayTransaction {
  id: string
  /** Сумма в валюте пользователя (після конвертації) */
  amount: number
  /** Валюта користувача */
  currency: string
  /** Заповнені, якщо транзакція була в іншій валюті */
  originalAmount?: number
  originalCurrency?: string
  categoryId: string
  description?: string
  date: Date
  createdAt: Date
  planningId?: string | null
}

export interface TransactionFilters {
  /** Case-insensitive підстрока в description */
  search: string
  /** Батьківські категорії; матчать і всі свої підкатегорії */
  categories: string[]
  plan: 'all' | 'linked' | 'unlinked'
}

export type TransactionSort = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'category'

export const createEmptyFilters = (): TransactionFilters => ({
  search: '',
  categories: [],
  plan: 'all',
})
