<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useMe } from '@/hooks/auth-hooks.ts'
import MainHeader from '@/components/MainHeader.vue'
import MainToasts from '@/components/MainToasts.vue'

const { me } = useMe()
const { locale } = useI18n()

watch(me, (newVal) => {
  if (newVal) {
    locale.value = newVal.me.lang || 'en'
  }
})
</script>

<template>
  <main-header />
  <router-view />
  <main-toasts />
</template>

<style scoped></style>
