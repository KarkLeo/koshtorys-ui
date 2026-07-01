<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useMe } from '@/hooks/auth-hooks.ts'
import { useAddTransaction } from '@/composables/useAddTransaction'
import MainHeader from '@/components/MainHeader.vue'
import MainFooter from '@/components/MainFooter.vue'
import BottomTabBar from '@/components/BottomTabBar.vue'
import AddTransactionTrigger from '@/components/transaction/AddTransactionTrigger.vue'
import TransactionFormDrawer from '@/components/transaction/TransactionFormDrawer.vue'
import Sonner from '@/components/ui/sonner/Sonner.vue'

const { user } = useMe()
const { locale } = useI18n()
const { isOpen } = useAddTransaction()

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
      <AddTransactionTrigger />
      <BottomTabBar />
      <TransactionFormDrawer v-model:open="isOpen" mode="add" />
    </template>

    <Sonner />
  </div>
</template>
