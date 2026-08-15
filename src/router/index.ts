import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import TransactionTab from '@/components/transaction/TransactionTab.vue'
import PlanningView from '@/components/planning/PlanningView.vue'
import StatisticsTab from '@/components/statistics/StatisticsTab.vue'
import OnboardingView from '@/views/OnboardingView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ShadcnDemoView from '@/views/ShadcnDemoView.vue'

import { useUserStore } from '@/stores/userStore'
import { ONBOARDING_UPDATED_AT } from '@/constants/meta.ts'
import { setInNavigationGuard } from '@/api/navigation-guard-flag'
import { useGlobalAdd } from '@/composables/useGlobalAdd'

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
    { path: '/dashboard', redirect: '/transactions' },
    {
      path: '/transactions',
      name: 'transactions',
      component: TransactionTab,
      meta: { requiresAuth: true },
    },
    {
      path: '/planning',
      name: 'planning',
      component: PlanningView,
      meta: { requiresAuth: true },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: StatisticsTab,
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
    setInNavigationGuard(true)
    try {
      const userStore = useUserStore()
      const user = await userStore.fetchUser()
      if (user) {
        if (
          (!user.onboardingAt || new Date(user.onboardingAt) < new Date(ONBOARDING_UPDATED_AT)) &&
          to.name !== 'onboarding'
        ) {
          return { name: 'onboarding' }
        }
        if (
          user.onboardingAt &&
          new Date(user.onboardingAt) >= new Date(ONBOARDING_UPDATED_AT) &&
          to.name === 'onboarding'
        ) {
          return { name: 'transactions' }
        }

        return to.meta.requiresAuth ? true : { name: 'transactions' }
      } else {
        return to.meta.requiresAuth ? { name: 'login' } : true
      }
    } catch (e) {
      console.error(`[router.beforeEach]: ${e}`)
      return to.meta.requiresAuth ? { name: 'login' } : true
    } finally {
      setInNavigationGuard(false)
    }
  } else {
    return true
  }
})

// `kind` (which global add drawer is open) is a module singleton, so it survives navigation
// on its own — e.g. the mobile back button would otherwise leave the add drawer open over
// whatever route it lands on. Close it on every route change.
router.afterEach(() => {
  useGlobalAdd().close()
})

export default router
