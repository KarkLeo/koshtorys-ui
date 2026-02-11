import { ref } from 'vue'
import { useMutation, useQuery } from '@vue/apollo-composable'

import type {
  MeQuery,
  OnboardingMutation,
  OnboardingMutationVariables,
  SettingsGeneralMutation,
  SettingsGeneralMutationVariables,
  SettingsStatisticsMutation,
  SettingsStatisticsMutationVariables,
} from '@/graphql/types'

import ME from '@/graphql/me.graphql'
import ONBOARDING from '@/graphql/onboarding.graphql'
import SETTINGS_GENERAL from '@/graphql/settings-general.graphql'
import SETTINGS_STATISTICS from '@/graphql/settings-statistics.graphql'

import { authApi } from '@/api/auth'
import apolloClient from '@/apolloClient'

export function useSignUp() {
  const loading = ref(false)

  const signUp = async (variables: { name: string; email: string; password: string; lang: string }) => {
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

  const signIn = async (variables: { email: string; password: string }) => {
    loading.value = true
    try {
      return await authApi.signIn(variables)
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

  const signOut = async () => {
    loading.value = true
    try {
      const result = await authApi.signOut()
      await apolloClient.clearStore()
      return result
    } finally {
      loading.value = false
    }
  }

  return { signOut, loading }
}

export const useMe = () => {
  const { result, loading, error, refetch } = useQuery<MeQuery>(ME)
  return { me: result, loading, error, refreshMe: refetch }
}

export const usesRefreshTokens = () => {
  const loading = ref(false)

  const refreshTokens = async () => {
    loading.value = true
    try {
      const result = await authApi.refresh()
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
  const { mutate, loading } = useMutation<OnboardingMutation, OnboardingMutationVariables>(
    ONBOARDING,
    {
      fetchPolicy: 'no-cache',
    },
  )

  const onboarding = async (onboardingData: OnboardingMutationVariables) => {
    try {
      const result = await mutate(onboardingData)
      return result?.data?.onboarding || null
    } catch (e) {
      throw e
    }
  }

  return { onboarding, loading }
}

export const usesSettingsGeneral = () => {
  const { mutate, loading } = useMutation<
    SettingsGeneralMutation,
    SettingsGeneralMutationVariables
  >(SETTINGS_GENERAL, { fetchPolicy: 'no-cache' })

  const settingsGeneral = async (updateProfileData: SettingsGeneralMutationVariables) => {
    try {
      const result = await mutate(updateProfileData)
      return result?.data?.updateProfile || null
    } catch (e) {
      throw e
    }
  }

  return { settingsGeneral, loading }
}

export const usesSettingsStatistics = () => {
  const { mutate, loading } = useMutation<
    SettingsStatisticsMutation,
    SettingsStatisticsMutationVariables
  >(SETTINGS_STATISTICS, { fetchPolicy: 'no-cache' })

  const settingsStatistics = async (updateProfileData: SettingsStatisticsMutationVariables) => {
    try {
      const result = await mutate(updateProfileData)
      return result?.data?.updateProfile || null
    } catch (e) {
      throw e
    }
  }

  return { settingsStatistics, loading }
}
