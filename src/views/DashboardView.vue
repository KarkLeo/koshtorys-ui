<script setup lang="ts">
import { useMe } from '@/hooks/auth-hooks.ts'

import AddTransactionForm from '@/components/AddTransactionForm.vue'
import TransactionList from '@/components/TransactionList.vue'

const { me } = useMe()
</script>

<template>
  <main>
    <transaction-list />
    <add-transaction-form />
  </main>
</template>
