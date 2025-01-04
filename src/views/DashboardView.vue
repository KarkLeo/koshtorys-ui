<script setup lang="ts">
import { useMe } from '@/hooks/auth-hooks.ts'

import AddTransactionForm from '@/components/AddTransactionForm.vue'

const { me } = useMe()
</script>

<template>
  <main>
    <h1>Привет, {{ me?.me.name || 'Гость' }}</h1>

    <add-transaction-form />
  </main>
</template>
