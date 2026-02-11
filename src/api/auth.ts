import apiClient from './client'
import type { components } from './types'

type UserResponseDto = components['schemas']['UserResponseDto']
type AuthResponseDto = components['schemas']['AuthResponseDto']
type SignUpDto = components['schemas']['SignUpDto']
type SignInDto = components['schemas']['SignInDto']
type OnboardingDto = components['schemas']['OnboardingDto']
type UpdateProfileDto = components['schemas']['UpdateProfileDto']

export const authApi = {
  async signUp(data: SignUpDto): Promise<UserResponseDto> {
    const response = await apiClient.post<UserResponseDto>('/auth/sign-up', data)
    return response.data
  },

  async signIn(data: SignInDto): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/sign-in', data)
    return response.data
  },

  async signOut(): Promise<boolean> {
    const response = await apiClient.post<boolean>('/auth/sign-out')
    return response.data
  },

  async refresh(): Promise<AuthResponseDto> {
    const response = await apiClient.post<AuthResponseDto>('/auth/refresh')
    return response.data
  },

  async me(): Promise<UserResponseDto> {
    const response = await apiClient.get<UserResponseDto>('/auth/me')
    return response.data
  },

  async onboarding(data: OnboardingDto): Promise<UserResponseDto> {
    const response = await apiClient.post<UserResponseDto>('/auth/onboarding', data)
    return response.data
  },

  async updateProfile(data: UpdateProfileDto): Promise<UserResponseDto> {
    const response = await apiClient.patch<UserResponseDto>('/auth/profile', data)
    return response.data
  },
}
