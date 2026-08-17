import { createApp, h } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from '@/i18n'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const pinia = createPinia()
const app = createApp({
  render: () => h(App),
})

app.use(router)
app.use(i18n)
app.use(pinia)

app.mount('#app')
