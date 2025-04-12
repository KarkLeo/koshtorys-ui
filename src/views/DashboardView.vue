<script setup lang="ts">
import KitTabs from '@/components/kit/KitTabs.vue'
import { DASHBOARD_TABS } from '@/constants/dashboard.ts'
</script>

<template>
  <main>
    <kit-tabs :tabs="DASHBOARD_TABS" lang-prefix="dashboard.tabs." center-mode />
  </main>
</template>
