import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

import '../src/assets/main.css'
import { i18n } from '../src/i18n'
import { useUserStore } from '../src/stores/userStore'

const blank = { template: '<div />' }

// Lightweight router (no auth guards / no API) so router-link & useRouter work in stories.
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: blank },
    { path: '/login', name: 'login', component: blank },
    { path: '/register', name: 'register', component: blank },
    { path: '/dashboard', name: 'dashboard', component: blank },
    { path: '/onboarding', name: 'onboarding', component: blank },
    { path: '/settings', name: 'settings', component: blank },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: blank },
  ],
})

setup((app, context) => {
  const pinia = createPinia()
  app.use(pinia)
  setActivePinia(pinia)
  app.use(i18n)
  app.use(router)

  // Stories can request a signed-in user via `parameters: { mockUser }`.
  const mockUser = context?.parameters?.mockUser
  if (mockUser) {
    useUserStore().setUser(mockUser)
  }
})

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
