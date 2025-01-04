<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import KitDropdown from '@/components/kit/KitDropdown.vue'

const { locale, availableLocales } = useI18n()

const getLangLabel = (locale: string) => {
  if (locale === 'en') return 'Eng'
  if (locale === 'uk-UA') return 'Укр'
  return 'locale'
}

onMounted(() => {
  const navigatorLang = window.navigator.language
  if (navigatorLang === 'en' || navigatorLang === 'uk-UA') {
    locale.value = navigatorLang
  } else locale.value = 'en'
})
</script>

<template>
  <kit-dropdown
    v-model="locale"
    :options="availableLocales"
    :getOptionLabel="getLangLabel"
    placeholder="Select language"
  />
</template>
