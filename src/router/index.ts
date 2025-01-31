import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import SettingsView from '@/views/SettingsView.vue'

import apolloClient from '@/apolloClient.ts'
import type { MeQuery } from '@/graphql/types.ts'
import ME from '@/graphql/me.graphql'
import { ONBOARDING_UPDATED_AT } from '@/constants/meta.ts'
import TokensService from '@/services/tokens-service.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresNoAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresNoAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: OnboardingView,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue'),
    // },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth || to.meta.requiresNoAuth) {
    try {
      const token = TokensService.getRefreshToken()
      if (!token) {
        throw new Error('No token')
      }
      const { data } = await apolloClient.query<MeQuery>({
        query: ME,
      })
      if (data.me) {
        if (
          (!data.me.onboardingAt ||
            new Date(data.me.onboardingAt) < new Date(ONBOARDING_UPDATED_AT)) &&
          to.name !== 'onboarding'
        ) {
          return { name: 'onboarding' }
        }
        if (
          (data.me.onboardingAt ||
            new Date(data.me.onboardingAt) >= new Date(ONBOARDING_UPDATED_AT)) &&
          to.name === 'onboarding'
        ) {
          return { name: 'dashboard' }
        }

        return to.meta.requiresAuth ? true : { name: 'dashboard' }
      } else {
        return to.meta.requiresAuth ? { name: 'login' } : true
      }
    } catch (e) {
      console.error(`[router.beforeEach]: ${e}`)
      return to.meta.requiresAuth ? { name: 'login' } : true
    }
  } else {
    return true
  }
})

export default router
