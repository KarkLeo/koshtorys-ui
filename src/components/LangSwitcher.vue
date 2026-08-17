<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const { locale, availableLocales } = useI18n()

const getLangLabel = (loc: string) => {
  if (loc === 'en') return 'Eng'
  if (loc === 'uk-UA') return 'Укр'
  return loc
}

onMounted(() => {
  const navigatorLang = window.navigator.language
  if (navigatorLang === 'en' || navigatorLang === 'uk-UA') {
    locale.value = navigatorLang
  } else locale.value = 'en'
})
</script>

<template>
  <Select v-model="locale">
    <SelectTrigger>
      <SelectValue :placeholder="getLangLabel(locale)" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="loc in availableLocales" :key="loc" :value="loc">
        {{ getLangLabel(loc) }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>
