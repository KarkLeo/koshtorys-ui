import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import type { components } from '@/api/types'

type UserResponseDto = components['schemas']['UserResponseDto']

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as UserResponseDto | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    currency: (state) => state.user?.currency,
    monthStartDay: (state) => state.user?.monthStartDay,
    monthlyBudget: (state) => state.user?.monthlyBudget,
  },

  actions: {
    async fetchUser() {
      this.loading = true
      this.error = null
      try {
        const user = await authApi.me()
        this.user = user
        return user
      } catch (e) {
        this.user = null
        this.error = String(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    setUser(user: UserResponseDto) {
      this.user = user
    },

    clearUser() {
      this.user = null
      this.error = null
    },
  },
})
