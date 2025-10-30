/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { getExchangedAmount, getTransactionsAmount, getTransactionsAmountByCategory } from './planning'
import type { Planning, ExchangeRate, Transaction, PlanningType } from '@/graphql/types'

describe('getExchangedAmount', () => {
  const mockExchangeRate: ExchangeRate = {
    id: '1',
    base: 'USD',
    date: new Date('2024-01-01'),
    rates: {
      USD: 1,
      EUR: 0.85,
      UAH: 40,
    },
    _count: { transaction: 0 },
    transaction: [],
  }

  it('should return the same amount when currency equals base currency', () => {
    const result = getExchangedAmount(mockExchangeRate, 100, 'USD', 'USD')
    expect(result).toBe(100)
  })

  it('should convert EUR to USD correctly', () => {
    const result = getExchangedAmount(mockExchangeRate, 85, 'EUR', 'USD')
    expect(result).toBeCloseTo(100, 2)
  })

  it('should convert UAH to USD correctly', () => {
    const result = getExchangedAmount(mockExchangeRate, 4000, 'UAH', 'USD')
    expect(result).toBeCloseTo(100, 2)
  })

  it('should convert USD to EUR correctly', () => {
    const result = getExchangedAmount(mockExchangeRate, 100, 'USD', 'EUR')
    expect(result).toBeCloseTo(85, 2)
  })
})

describe('getTransactionsAmount', () => {
  const mockExchangeRate: ExchangeRate = {
    id: '1',
    base: 'USD',
    date: new Date('2024-01-01'),
    rates: {
      USD: 1,
      EUR: 0.85,
    },
    _count: { transaction: 0 },
    transaction: [],
  }

  it('should return null when there are no transactions', () => {
    const planning: Planning = {
      id: '1',
      amount: 100,
      currency: 'USD',
      categoryId: 'groceries',
      type: 'TRANSACTION' as PlanningType,
      transactions: [],
      repeat: false,
      monthIndex: 0,
      year: 2024,
      userId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      _count: { parentPlannings: 0, repeatedPlannings: 0, transactions: 0 },
      parentPlannings: [],
      repeatedPlannings: [],
      user: {} as any,
    }

    const result = getTransactionsAmount(planning, 'USD')
    expect(result).toBeNull()
  })

  it('should return null when transactions array is empty', () => {
    const planning: Planning = {
      id: '1',
      amount: 100,
      currency: 'USD',
      categoryId: 'groceries',
      type: 'TRANSACTION' as PlanningType,
      transactions: [],
      repeat: false,
      monthIndex: 0,
      year: 2024,
      userId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      _count: { parentPlannings: 0, repeatedPlannings: 0, transactions: 0 },
      parentPlannings: [],
      repeatedPlannings: [],
      user: {} as any,
    }

    const result = getTransactionsAmount(planning, 'USD')
    expect(result).toBeNull()
  })

  it('should sum up transactions in the same currency', () => {
    const planning: Planning = {
      id: '1',
      amount: 100,
      currency: 'USD',
      categoryId: 'groceries',
      type: 'TRANSACTION' as PlanningType,
      transactions: [
        {
          id: '1',
          amount: 30,
          currency: 'USD',
          date: new Date('2024-01-01'),
          description: 'Transaction 1',
          exchangeRate: mockExchangeRate,
          exchangeRateId: 1,
          userId: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          user: {} as any,
          categoryId: 'groceries',
        },
        {
          id: '2',
          amount: 20,
          currency: 'USD',
          date: new Date('2024-01-02'),
          description: 'Transaction 2',
          exchangeRate: mockExchangeRate,
          exchangeRateId: 1,
          userId: 1,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          user: {} as any,
          categoryId: 'groceries',
        },
      ] as Transaction[],
      repeat: false,
      monthIndex: 0,
      year: 2024,
      userId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      _count: { parentPlannings: 0, repeatedPlannings: 0, transactions: 2 },
      parentPlannings: [],
      repeatedPlannings: [],
      user: {} as any,
    }

    const result = getTransactionsAmount(planning, 'USD')
    expect(result).toBe(50)
  })

  it('should convert and sum transactions in different currencies', () => {
    const planning: Planning = {
      id: '1',
      amount: 100,
      currency: 'USD',
      categoryId: 'groceries',
      type: 'TRANSACTION' as PlanningType,
      transactions: [
        {
          id: '1',
          amount: 50,
          currency: 'USD',
          date: new Date('2024-01-01'),
          description: 'Transaction 1',
          exchangeRate: mockExchangeRate,
          exchangeRateId: 1,
          userId: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          user: {} as any,
          categoryId: 'groceries',
        },
        {
          id: '2',
          amount: 42.5,
          currency: 'EUR',
          date: new Date('2024-01-02'),
          description: 'Transaction 2',
          exchangeRate: mockExchangeRate,
          exchangeRateId: 1,
          userId: 1,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          user: {} as any,
          categoryId: 'groceries',
        },
      ] as Transaction[],
      repeat: false,
      monthIndex: 0,
      year: 2024,
      userId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      _count: { parentPlannings: 0, repeatedPlannings: 0, transactions: 2 },
      parentPlannings: [],
      repeatedPlannings: [],
      user: {} as any,
    }

    const result = getTransactionsAmount(planning, 'USD')
    expect(result).toBeCloseTo(100, 2)
  })
})

describe('getTransactionsAmountByCategory', () => {
  const mockExchangeRate: ExchangeRate = {
    id: '1',
    base: 'USD',
    date: new Date('2024-01-01'),
    rates: {
      USD: 1,
      EUR: 0.85,
    },
    _count: { transaction: 0 },
    transaction: [],
  }

  it('should return 0 when there are no transactions', () => {
    const result = getTransactionsAmountByCategory([], 'groceries', 'USD')
    expect(result).toBe(0)
  })

  it('should return 0 when there are no transactions in the category', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        amount: 30,
        currency: 'USD',
        categoryId: 'transport',
        date: new Date('2024-01-01'),
        description: 'Transaction 1',
        exchangeRate: mockExchangeRate,
        exchangeRateId: 1,
        userId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        user: {} as any,
      },
    ]

    const result = getTransactionsAmountByCategory(transactions, 'groceries', 'USD')
    expect(result).toBe(0)
  })

  it('should exclude transactions with planning', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        amount: 30,
        currency: 'USD',
        categoryId: 'groceries',
        date: new Date('2024-01-01'),
        description: 'Transaction 1',
        exchangeRate: mockExchangeRate,
        exchangeRateId: 1,
        userId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        user: {} as any,
        planning: {} as Planning,
        planningId: 1,
      },
      {
        id: '2',
        amount: 20,
        currency: 'USD',
        categoryId: 'groceries',
        date: new Date('2024-01-02'),
        description: 'Transaction 2',
        exchangeRate: mockExchangeRate,
        exchangeRateId: 1,
        userId: 1,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        user: {} as any,
      },
    ]

    const result = getTransactionsAmountByCategory(transactions, 'groceries', 'USD')
    expect(result).toBe(20)
  })

  it('should sum up transactions in the same category without planning', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        amount: 30,
        currency: 'USD',
        categoryId: 'groceries',
        date: new Date('2024-01-01'),
        description: 'Transaction 1',
        exchangeRate: mockExchangeRate,
        exchangeRateId: 1,
        userId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        user: {} as any,
      },
      {
        id: '2',
        amount: 20,
        currency: 'USD',
        categoryId: 'groceries',
        date: new Date('2024-01-02'),
        description: 'Transaction 2',
        exchangeRate: mockExchangeRate,
        exchangeRateId: 1,
        userId: 1,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
        user: {} as any,
      },
    ]

    const result = getTransactionsAmountByCategory(transactions, 'groceries', 'USD')
    expect(result).toBe(50)
  })
})
