<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useMe } from '@/hooks/auth-hooks.ts'
import MainHeader from '@/components/MainHeader.vue'
import MainFooter from '@/components/MainFooter.vue'
import Sonner from '@/components/ui/sonner/Sonner.vue'

const { user } = useMe()
const { locale } = useI18n()

watch(user, (newVal) => {
  if (newVal) {
    locale.value = newVal.lang || 'en'
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <MainHeader />
    <router-view class="flex-1" />
    <MainFooter />
    <Sonner />
  </div>
</template>
