import './assets/main.css'

import { createApp, h, provide } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'

import App from './App.vue'
import router from './router'

import { i18n } from '@/i18n'
import apolloClient from '@/apolloClient.ts'

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },

  render: () => h(App),
})

app.use(router)
app.use(i18n)

app.mount('#app')
