<script setup lang="ts">
import PlanningForm from '@/components/planning/PlanningForm.vue'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import KitMonthSwitcher from '@/components/kit/KitMonthSwitcher.vue'
import { usePlanningList } from '@/hooks/planning-hooks.ts'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toastStore.ts'

const { t } = useI18n()
const toastStore = useToastStore()
const { statisticDate } = useStatisticDateStore()
const { planning } = usePlanningList()
</script>
<template>
  <div class="planning-container">
    <kit-month-switcher v-model="statisticDate" />
    <planning-form />

    <div v-if="planning?.planning.length">
      <div v-for="plan in planning.planning" :key="plan.id">
        <div>{{ plan.type }}</div>
        <div>{{ plan.amount }}</div>
        <div>{{ plan.currency }}</div>
        <div>{{ plan.description }}</div>
        <div>{{ plan.date }}</div>
        <div>{{ plan.categoryId }}</div>
        <div>{{ plan.repeat }}</div>
      </div>
    </div>
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
