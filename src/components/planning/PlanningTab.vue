<script setup lang="ts">
import PlanningForm from '@/components/planning/PlanningForm.vue'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import KitMonthSwitcher from '@/components/kit/KitMonthSwitcher.vue'

const { statisticDate } = useStatisticDateStore()
</script>
<template>
  <div class="planning-container">
    <kit-month-switcher v-model="statisticDate" />
    <planning-form />
  </div>
</template>

<style scoped>
.planning-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}
</style>
