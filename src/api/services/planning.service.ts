import apiClient from '../client'
import type { components } from '../types'

type PlanResponseDto = components['schemas']['PlanResponseDto']
type CreatePlanDto = components['schemas']['CreatePlanDto']
type UpdatePlanDto = components['schemas']['UpdatePlanDto']
type RepeatPlanDto = components['schemas']['RepeatPlanDto']

export const planningApi = {
  async getList(monthIndex: number, year: number): Promise<PlanResponseDto[]> {
    const response = await apiClient.get<PlanResponseDto[]>('/plans', {
      params: { monthIndex, year },
    })
    return response.data
  },

  async getRepeating(monthIndex: number, year: number): Promise<PlanResponseDto[]> {
    const response = await apiClient.get<PlanResponseDto[]>('/plans/repeating', {
      params: { monthIndex, year },
    })
    return response.data
  },

  async create(data: CreatePlanDto): Promise<PlanResponseDto> {
    const response = await apiClient.post<PlanResponseDto>('/plans', data)
    return response.data
  },

  async update(id: number, data: UpdatePlanDto): Promise<PlanResponseDto> {
    const response = await apiClient.patch<PlanResponseDto>(`/plans/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<PlanResponseDto> {
    const response = await apiClient.delete<PlanResponseDto>(`/plans/${id}`)
    return response.data
  },

  async repeat(id: number, data: RepeatPlanDto): Promise<PlanResponseDto> {
    const response = await apiClient.post<PlanResponseDto>(`/plans/${id}/repeat`, data)
    return response.data
  },

  async cancelRepeat(id: number): Promise<PlanResponseDto> {
    const response = await apiClient.post<PlanResponseDto>(`/plans/${id}/cancel-repeat`)
    return response.data
  },
}
