import apiClient from '../client'
import type { components } from '../types'

type TransactionResponseDto = components['schemas']['TransactionResponseDto']
type CreateTransactionDto = components['schemas']['CreateTransactionDto']
type UpdateTransactionDto = components['schemas']['UpdateTransactionDto']
type TransactionsByCategoryResponseDto = components['schemas']['TransactionsByCategoryResponseDto']
type TransactionsByMonthDayResponseDto = components['schemas']['TransactionsByMonthDayResponseDto']

export const transactionApi = {
  async findAll(startDate: string, endDate: string): Promise<TransactionResponseDto[]> {
    const response = await apiClient.get<TransactionResponseDto[]>('/transactions', {
      params: { startDate, endDate },
    })
    return response.data
  },

  async create(data: CreateTransactionDto): Promise<TransactionResponseDto> {
    const response = await apiClient.post<TransactionResponseDto>('/transactions', data)
    return response.data
  },

  async update(id: number, data: UpdateTransactionDto): Promise<TransactionResponseDto> {
    const response = await apiClient.patch<TransactionResponseDto>(`/transactions/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<TransactionResponseDto> {
    const response = await apiClient.delete<TransactionResponseDto>(`/transactions/${id}`)
    return response.data
  },

  async statisticsByCategory(): Promise<TransactionsByCategoryResponseDto[]> {
    const response = await apiClient.get<TransactionsByCategoryResponseDto[]>(
      '/transactions/statistics/by-category',
    )
    return response.data
  },

  async statisticsByMonthDay(): Promise<TransactionsByMonthDayResponseDto[]> {
    const response = await apiClient.get<TransactionsByMonthDayResponseDto[]>(
      '/transactions/statistics/by-month-day',
    )
    return response.data
  },
}
