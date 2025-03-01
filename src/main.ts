import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from '@/i18n'
import { DefaultApolloClient } from '@vue/apollo-composable'

import apolloClient from '@/apolloClient.ts'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const pinia = createPinia()
const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App),
})

app.use(router)
app.use(i18n)
app.use(pinia)

app.mount('#app')
