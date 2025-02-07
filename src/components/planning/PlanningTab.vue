<script setup lang="ts">
import PlanningForm from '@/components/planning/PlanningForm.vue'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import KitMonthSwitcher from '@/components/kit/KitMonthSwitcher.vue'
import { usePlanningList } from '@/hooks/planning-hooks.ts'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toastStore.ts'
import { computed } from 'vue'
import { reducePlanningByCategory } from '@/helpers/planning.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { getMainCategory } from '@/helpers/category.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'

const { t } = useI18n()
// const toastStore = useToastStore()
const { statisticDate } = useStatisticDateStore()
const { planning } = usePlanningList()

const planningTables = computed(() => {
  if (!planning?.value?.planning) return []
  return reducePlanningByCategory(planning.value.planning)
})

const getCategoriesLabel = (category: string) => t(`transaction.categories.${category}`)
const getCategoryStyle = (category: string) => ({
  '--color': TRANSACTION_CATEGORIES_COLORS[getMainCategory(category)] || '',
})

const formatCurrency = (value: string) => {
  return CURRENCIES_SYMBOL[value] || value
}
</script>
<template>
  <div class="planning-container">
    <kit-month-switcher v-model="statisticDate" />
    <planning-form />

    <div class="planning-table" v-for="table in planningTables" :key="table.category">
      <div class="planning-table-header" :style="getCategoryStyle(table.category)">
        {{ getCategoriesLabel(table.category) }}
      </div>
      <div class="planning-table-body">
        <div class="planning-table-item" v-for="plan in table.items" :key="plan.id">
          <template v-if="plan.type === 'TRANSACTION'">
            <div>{{ plan.description }}</div>
            <div
              class="planning-table-item-category"
              :style="getCategoryStyle(plan.categoryId as string)"
            >
              {{ getCategoriesLabel(plan.categoryId as string) }}
            </div>
            <div class="planning-table-item-amount">
              {{ plan.amount }} {{ formatCurrency(plan.currency) }}
            </div>
          </template>
          <template v-else>
            <div
              class="planning-table-item-category"
              :style="getCategoryStyle(plan.categoryId as string)"
            >
              {{ getCategoriesLabel(plan.categoryId as string) }}
            </div>
            <div class="planning-table-item-amount">
              {{ plan.amount }} {{ formatCurrency(plan.currency) }}
            </div>
          </template>
        </div>
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

.planning-table {
  display: flex;
  flex-direction: column;

  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.planning-table-header {
  position: relative;

  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-3xl);
  box-sizing: border-box;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: bold;
}

.planning-table-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;

  background-color: var(--color);
  opacity: 0.5;
}

.planning-table-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-xl) var(--spacing-3xl);
  box-sizing: border-box;

  border-top: 1px solid var(--border-secondary);
}

.planning-table-item-amount {
  margin-left: auto;
}

.planning-table-item-category {
  box-sizing: border-box;
  width: min-content;
  overflow: hidden;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-medium);
  color: var(--color);
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
