import { ref } from 'vue'
import { storeToRefs } from 'pinia'

import { authApi } from '@/api/auth'
import { useUserStore } from '@/stores/userStore'
import apolloClient from '@/apolloClient'

import type { components } from '@/api/types'

type OnboardingDto = components['schemas']['OnboardingDto']
type UpdateProfileDto = components['schemas']['UpdateProfileDto']

export function useSignUp() {
  const loading = ref(false)

  const signUp = async (variables: {
    name: string
    email: string
    password: string
    lang: string
  }) => {
    loading.value = true
    try {
      return await authApi.signUp(variables)
    } finally {
      loading.value = false
    }
  }

  return { signUp, loading }
}

export const useSignIn = () => {
  const loading = ref(false)
  const userStore = useUserStore()

  const signIn = async (variables: { email: string; password: string }) => {
    loading.value = true
    try {
      const result = await authApi.signIn(variables)
      if (result.user) {
        userStore.setUser(result.user)
      }
      return result
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }

  return { signIn, loading }
}

export const useSignOut = () => {
  const loading = ref(false)
  const userStore = useUserStore()

  const signOut = async () => {
    loading.value = true
    try {
      const result = await authApi.signOut()
      userStore.clearUser()
      await apolloClient.clearStore()
      return result
    } finally {
      loading.value = false
    }
  }

  return { signOut, loading }
}

export const useMe = () => {
  const userStore = useUserStore()
  const { user, loading } = storeToRefs(userStore)
  return { user, loading, refreshMe: () => userStore.fetchUser() }
}

export const usesRefreshTokens = () => {
  const loading = ref(false)
  const userStore = useUserStore()

  const refreshTokens = async () => {
    loading.value = true
    try {
      const result = await authApi.refresh()
      if (result.user) {
        userStore.setUser(result.user)
      }
      return result.user
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }
  return { refreshTokens, loading }
}

export const usesOnboarding = () => {
  const loading = ref(false)
  const userStore = useUserStore()

  const onboarding = async (onboardingData: OnboardingDto) => {
    loading.value = true
    try {
      const result = await authApi.onboarding(onboardingData)
      if (result) {
        userStore.setUser(result)
      }
      return result
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }

  return { onboarding, loading }
}

export const usesSettingsGeneral = () => {
  const loading = ref(false)
  const userStore = useUserStore()

  const settingsGeneral = async (updateProfileData: UpdateProfileDto) => {
    loading.value = true
    try {
      const result = await authApi.updateProfile(updateProfileData)
      if (result) {
        userStore.setUser(result)
      }
      return result
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }

  return { settingsGeneral, loading }
}

export const usesSettingsStatistics = () => {
  const loading = ref(false)
  const userStore = useUserStore()

  const settingsStatistics = async (updateProfileData: UpdateProfileDto) => {
    loading.value = true
    try {
      const result = await authApi.updateProfile(updateProfileData)
      if (result) {
        userStore.setUser(result)
      }
      return result
    } catch (e) {
      throw e
    } finally {
      loading.value = false
    }
  }

  return { settingsStatistics, loading }
}
