import type {
  DisplayTransaction,
  TransactionFilters,
  TransactionSort,
} from '@/components/transaction/types'

const matchesSearch = (transaction: DisplayTransaction, search: string) => {
  const query = search.trim().toLowerCase()
  if (!query) return true
  return (transaction.description ?? '').toLowerCase().includes(query)
}

const matchesCategories = (transaction: DisplayTransaction, categories: string[]) => {
  if (categories.length === 0) return true
  return categories.some(
    (category) =>
      transaction.categoryId === category || transaction.categoryId.startsWith(`${category}--`),
  )
}

const matchesPlan = (transaction: DisplayTransaction, plan: TransactionFilters['plan']) => {
  if (plan === 'all') return true
  return plan === 'linked' ? Boolean(transaction.planningId) : !transaction.planningId
}

const dayTime = (date: Date) => new Date(date).setHours(0, 0, 0, 0)

const byDateDesc = (a: DisplayTransaction, b: DisplayTransaction) => {
  const diff = dayTime(b.date) - dayTime(a.date)
  return diff !== 0 ? diff : b.createdAt.getTime() - a.createdAt.getTime()
}

const COMPARATORS: Record<
  TransactionSort,
  (a: DisplayTransaction, b: DisplayTransaction) => number
> = {
  'date-desc': byDateDesc,
  'date-asc': (a, b) => -byDateDesc(a, b),
  'amount-desc': (a, b) => b.amount - a.amount || byDateDesc(a, b),
  'amount-asc': (a, b) => a.amount - b.amount || byDateDesc(a, b),
  category: (a, b) => a.categoryId.localeCompare(b.categoryId) || byDateDesc(a, b),
}

export const filterAndSortTransactions = (
  list: DisplayTransaction[],
  filters: TransactionFilters,
  sort: TransactionSort,
): DisplayTransaction[] => {
  return list
    .filter(
      (transaction) =>
        matchesSearch(transaction, filters.search) &&
        matchesCategories(transaction, filters.categories) &&
        matchesPlan(transaction, filters.plan),
    )
    .sort(COMPARATORS[sort])
}

export interface TransactionDayGroup {
  date: Date
  transactions: DisplayTransaction[]
}

/** Группирует последовательные транзакции одного дня; порядок входа сохраняется. */
export const groupTransactionsByDay = (list: DisplayTransaction[]): TransactionDayGroup[] => {
  const groups: TransactionDayGroup[] = []
  for (const transaction of list) {
    const last = groups[groups.length - 1]
    if (last && dayTime(last.date) === dayTime(transaction.date)) {
      last.transactions.push(transaction)
    } else {
      groups.push({ date: transaction.date, transactions: [transaction] })
    }
  }
  return groups
}
