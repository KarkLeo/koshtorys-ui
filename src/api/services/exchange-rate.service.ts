import apiClient from '../client'
import type { components } from '../types'

type ExchangeRateResponseDto = components['schemas']['ExchangeRateResponseDto']

export const exchangeRateApi = {
  async findAll(): Promise<ExchangeRateResponseDto[]> {
    const response = await apiClient.get<ExchangeRateResponseDto[]>('/exchange-rates')
    return response.data
  },

  async findByDate(date: string): Promise<ExchangeRateResponseDto> {
    const response = await apiClient.get<ExchangeRateResponseDto>(`/exchange-rates/${date}`)
    return response.data
  },
}
