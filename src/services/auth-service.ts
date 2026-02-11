import { authApi } from '@/api/auth'
import apolloClient from '@/apolloClient'
import type { components } from '@/api/types'

type OnboardingDto = components['schemas']['OnboardingDto']
type UpdateProfileDto = components['schemas']['UpdateProfileDto']

const AuthService = {
  async signUp(name: string, email: string, password: string, lang: string) {
    return authApi.signUp({ name, email, password, lang })
  },

  async signIn(email: string, password: string) {
    const result = await authApi.signIn({ email, password })
    return result.user
  },

  async signOut() {
    const result = await authApi.signOut()
    await apolloClient.clearStore()
    return result
  },

  async me() {
    try {
      return await authApi.me()
    } catch (e) {
      console.error(e)
      return null
    }
  },

  async refreshTokens() {
    try {
      const result = await authApi.refresh()
      return result.user
    } catch (e) {
      return null
    }
  },

  async onboarding(onboardingData: OnboardingDto) {
    return authApi.onboarding(onboardingData)
  },

  async settingsGeneral(updateProfileData: UpdateProfileDto) {
    return authApi.updateProfile(updateProfileData)
  },

  async settingsStatistics(updateProfileData: UpdateProfileDto) {
    return authApi.updateProfile(updateProfileData)
  },
}

export default AuthService
