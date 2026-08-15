<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useMe } from '@/hooks/auth-hooks.ts'
import { useGlobalAdd } from '@/composables/useGlobalAdd'
import MainHeader from '@/components/MainHeader.vue'
import MainFooter from '@/components/MainFooter.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'
import GlobalAddTrigger from '@/components/GlobalAddTrigger.vue'
import TransactionFormDrawer from '@/components/transaction/TransactionFormDrawer.vue'
import PlanFormDrawer from '@/components/planning/PlanFormDrawer.vue'
import Sonner from '@/components/ui/sonner/Sonner.vue'

const { user } = useMe()
const { locale } = useI18n()
const { transactionOpen, planOpen } = useGlobalAdd()

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

    <template v-if="user">
      <GlobalAddTrigger />
      <BottomTabBar />
      <TransactionFormDrawer v-model:open="transactionOpen" mode="add" />
      <!-- Mounted only while open: setup() calls useMonthlyPlanning(), which fires
           /plans, /plans/repeating and /exchange-rates. Keeping it always-mounted fired
           those on every app boot and every statisticDate change, even for users who
           never open Planning (e.g. paging months on /transactions or /statistics). -->
      <PlanFormDrawer v-if="planOpen" v-model:open="planOpen" mode="add" />
    </template>

    <Sonner />
  </div>
</template>
