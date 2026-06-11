import { describe, it, expect } from 'vitest'
import { filterAndSortTransactions, groupTransactionsByDay } from './transaction-filters'
import { createEmptyFilters } from '@/components/transaction/types'
import { mockTransactions } from '@/components/transaction/__fixtures__/transactions'

const ids = (list: { id: string }[]) => list.map((t) => t.id)

describe('groupTransactionsByDay', () => {
  it('groups consecutive same-day transactions preserving order', () => {
    const sorted = filterAndSortTransactions(mockTransactions, createEmptyFilters(), 'date-desc')
    const groups = groupTransactionsByDay(sorted)
    // 03.06, 02.06, 30.05, 28.05, 27.05, 26.05 (две транзакции: 6 и 7)
    expect(groups).toHaveLength(6)
    expect(ids(groups[5].transactions)).toEqual(['6', '7'])
    expect(groups.map((g) => g.date.getDate())).toEqual([3, 2, 30, 28, 27, 26])
  })

  it('works for ascending order too', () => {
    const sorted = filterAndSortTransactions(mockTransactions, createEmptyFilters(), 'date-asc')
    const groups = groupTransactionsByDay(sorted)
    expect(groups).toHaveLength(6)
    expect(ids(groups[0].transactions)).toEqual(['7', '6'])
  })

  it('returns empty array for empty input', () => {
    expect(groupTransactionsByDay([])).toEqual([])
  })
})

describe('filterAndSortTransactions', () => {
  describe('search', () => {
    it('matches description case-insensitively', () => {
      const result = filterAndSortTransactions(
        mockTransactions,
        { ...createEmptyFilters(), search: 'jetbrains' },
        'date-desc',
      )
      expect(ids(result)).toEqual(['1'])
    })

    it('ignores surrounding whitespace', () => {
      const result = filterAndSortTransactions(
        mockTransactions,
        { ...createEmptyFilters(), search: '  суші  ' },
        'date-desc',
      )
      expect(ids(result)).toEqual(['2'])
    })
  })

  describe('categories', () => {
    it('parent category matches all its subcategories', () => {
      const result = filterAndSortTransactions(
        mockTransactions,
        { ...createEmptyFilters(), categories: ['food'] },
        'date-desc',
      )
      expect(ids(result)).toEqual(['2', '3'])
    })

    it('matches transaction with the parent category id itself', () => {
      const result = filterAndSortTransactions(
        mockTransactions,
        { ...createEmptyFilters(), categories: ['travel'] },
        'date-desc',
      )
      expect(ids(result)).toEqual(['5'])
    })

    it('multiple categories are OR-ed', () => {
      const result = filterAndSortTransactions(
        mockTransactions,
        { ...createEmptyFilters(), categories: ['car', 'housing'] },
        'date-desc',
      )
      expect(ids(result)).toEqual(['4', '7'])
    })
  })

  describe('plan link', () => {
    it('linked returns only transactions with planningId', () => {
      const result = filterAndSortTransactions(
        mockTransactions,
        { ...createEmptyFilters(), plan: 'linked' },
        'date-desc',
      )
      expect(ids(result)).toEqual(['7'])
    })

    it('unlinked returns only transactions without planningId', () => {
      const result = filterAndSortTransactions(
        mockTransactions,
        { ...createEmptyFilters(), plan: 'unlinked' },
        'date-desc',
      )
      expect(ids(result)).not.toContain('7')
      expect(result).toHaveLength(6)
    })
  })

  describe('sorting', () => {
    it('date-desc: newest first, same-day tiebreak by createdAt desc', () => {
      const result = filterAndSortTransactions(mockTransactions, createEmptyFilters(), 'date-desc')
      // 26.05: id 6 (16:45) раньше в списке, чем id 7 (08:00)
      expect(ids(result)).toEqual(['1', '2', '3', '4', '5', '6', '7'])
    })

    it('date-asc: oldest first, same-day tiebreak by createdAt asc', () => {
      const result = filterAndSortTransactions(mockTransactions, createEmptyFilters(), 'date-asc')
      expect(ids(result)).toEqual(['7', '6', '5', '4', '3', '2', '1'])
    })

    it('amount-desc: most expensive first', () => {
      const result = filterAndSortTransactions(mockTransactions, createEmptyFilters(), 'amount-desc')
      expect(ids(result).slice(0, 2)).toEqual(['2', '5']) // 52, затем 18 (date-desc tiebreak: 27.05 > 26.05)
    })

    it('amount-asc: cheapest first', () => {
      const result = filterAndSortTransactions(mockTransactions, createEmptyFilters(), 'amount-asc')
      expect(ids(result)[0]).toBe('4') // 2 EUR
    })

    it('category: alphabetical by categoryId', () => {
      const result = filterAndSortTransactions(mockTransactions, createEmptyFilters(), 'category')
      // car < entertainment < food--food-delivery < food--groceries < housing < travel < work
      expect(ids(result)).toEqual(['4', '6', '2', '3', '7', '5', '1'])
    })
  })

  it('does not mutate the input array', () => {
    const input = [...mockTransactions]
    filterAndSortTransactions(input, createEmptyFilters(), 'amount-asc')
    expect(input).toEqual(mockTransactions)
  })
})
