import { createI18n } from 'vue-i18n'

import enLocal from './locales/en.json'
import ukLocal from './locales/uk-UA.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: enLocal,
    'uk-UA': ukLocal,
  },
})
