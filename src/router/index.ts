import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ShadcnDemoView from '@/views/ShadcnDemoView.vue'

import { useUserStore } from '@/stores/userStore'
import { ONBOARDING_UPDATED_AT } from '@/constants/meta.ts'

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
    {
      path: '/shadcn-demo',
      name: 'shadcn-demo',
      component: ShadcnDemoView,
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth || to.meta.requiresNoAuth) {
    try {
      const userStore = useUserStore()
      const user = await userStore.fetchUser()
      if (user) {
        if (
          (!user.onboardingAt ||
            new Date(user.onboardingAt) < new Date(ONBOARDING_UPDATED_AT)) &&
          to.name !== 'onboarding'
        ) {
          return { name: 'onboarding' }
        }
        if (
          (user.onboardingAt &&
            new Date(user.onboardingAt) >= new Date(ONBOARDING_UPDATED_AT)) &&
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
