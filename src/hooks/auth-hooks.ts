import { useMutation, useQuery } from '@vue/apollo-composable'

import type {
  LoginMutation,
  LoginMutationVariables,
  LogoutMutation,
  LogoutMutationVariables,
  MeQuery,
  OnboardingMutation,
  OnboardingMutationVariables,
  RefreshTokensMutation,
  RefreshTokensMutationVariables,
  RegistrationMutation,
  RegistrationMutationVariables,
  SettingsGeneralMutation,
  SettingsGeneralMutationVariables,
  SettingsStatisticsMutation,
  SettingsStatisticsMutationVariables,
} from '@/graphql/types'

import REGISTRATION from '@/graphql/registration.graphql'
import LOGIN from '@/graphql/login.graphql'
import ME from '@/graphql/me.graphql'
import REFRESH_TOKENS from '@/graphql/refresh-tokens.graphql'
import LOGOUT from '@/graphql/logout.graphql'
import ONBOARDING from '@/graphql/onboarding.graphql'
import SETTINGS_GENERAL from '@/graphql/settings-general.graphql'
import SETTINGS_STATISTICS from '@/graphql/settings-statistics.graphql'

import TokensService from '@/services/tokens-service'

export function useSignUp() {
  const { mutate, loading } = useMutation<RegistrationMutation, RegistrationMutationVariables>(
    REGISTRATION,
  )

  const signUp = async (variables: RegistrationMutationVariables) => {
    try {
      const result = await mutate(variables)
      return result?.data?.signUp || null
    } catch (e) {
      throw e
    }
  }

  return { signUp, loading }
}

export const useSignIn = () => {
  const { mutate, loading } = useMutation<LoginMutation, LoginMutationVariables>(LOGIN, {
    fetchPolicy: 'no-cache',
  })

  const signIn = async (variables: LoginMutationVariables) => {
    try {
      const result = await mutate(variables)
      if (result?.data?.signIn) {
        TokensService.setTokens(result.data.signIn.accessToken, result.data.signIn.refreshToken)
        return result.data.signIn
      } else {
        TokensService.clearTokens()
      }
      return null
    } catch (e) {
      throw e
    }
  }

  return { signIn, loading }
}

export const useSignOut = () => {
  const { mutate, loading } = useMutation<LogoutMutation, LogoutMutationVariables>(LOGOUT, {
    fetchPolicy: 'no-cache',
  })

  const signOut = async () => {
    try {
      const result = await mutate()
      TokensService.clearTokens()
      return result?.data?.signOut || null
    } catch (e) {
      throw e
    }
  }

  return { signOut, loading }
}

export const useMe = () => {
  const { result, loading, error, refetch } = useQuery<MeQuery>(ME)
  return { me: result, loading, error, refreshMe: refetch }
}

export const usesRefreshTokens = () => {
  const { mutate, loading } = useMutation<RefreshTokensMutation, RefreshTokensMutationVariables>(
    REFRESH_TOKENS,
    { fetchPolicy: 'no-cache' },
  )

  const refreshTokens = async () => {
    const refreshToken = TokensService.getRefreshToken()
    if (!refreshToken) return null

    try {
      const result = await mutate({ refreshToken })
      if (result?.data?.refreshTokens) {
        TokensService.setTokens(
          result.data.refreshTokens.accessToken,
          result.data.refreshTokens.refreshToken,
        )
        return result.data.refreshTokens
      }
      return null
    } catch (e) {
      TokensService.clearTokens()
      throw e
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
