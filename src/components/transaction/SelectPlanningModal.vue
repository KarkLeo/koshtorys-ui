<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ExchangeRate, Planning } from '@/graphql/types.ts'
import { usePlanningList } from '@/hooks/planning-hooks.ts'
import { getExchangedAmount, reducePlanningByCategory } from '@/helpers/planning.ts'
import { getMainCategory } from '@/helpers/category.ts'

import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import KitModal from '@/components/kit/KitModal.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import KitRadio from '@/components/kit/KitRadio.vue'

const emit = defineEmits(['close', 'submit'])
const model = defineModel<string | null>()
defineProps<{
  oldPlanningId?: string | null
}>()

// ===== Hooks =====

const { t } = useI18n()
const { planning } = usePlanningList()
const { me } = useMe()

// ===== Computed =====

const planningTables = computed(() => {
  if (!planning?.value?.planning) return []
  return reducePlanningByCategory(
    planning.value.planning.filter((planning) => planning.type === 'TRANSACTION') as Planning[],
  )
})

// ===== Render Helpers =====
const getCategoriesLabel = (category: string) => t(`transaction.categories.${category}`)
const getCategoryStyle = (category: string) => ({
  '--color': TRANSACTION_CATEGORIES_COLORS[getMainCategory(category)] || '',
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (value: string) => {
  return CURRENCIES_SYMBOL[value] || value
}
const prepareExchangedAmount = (amount: number, currency: string): number => {
  if (!planning?.value || !me.value) return 0
  return Math.round(
    getExchangedAmount(
      planning.value.exchangeRate as ExchangeRate,
      amount,
      currency,
      me?.value.me.currency,
    ),
  )
}

// ===== Handlers =====

const cancelHandler = () => {
  model.value = null
}

const submitHandler = () => {
  emit('submit', model.value)
}

const closeHandler = () => {
  emit('close')
}
</script>

<template>
  <kit-modal
    :title="$t('transaction.selectPlanning.title')"
    :subtitle="$t('transaction.selectPlanning.subtitle')"
    :cancelText="$t('transaction.selectPlanning.buttons.cancel')"
    :submitText="$t('transaction.selectPlanning.buttons.submit')"
    @cancel="cancelHandler"
    @submit="submitHandler"
    @close="closeHandler"
  >
    <div class="planning-content">
      <div class="planning-table" v-for="table in planningTables" :key="table.category">
        <div class="planning-table-body">
          <label
            class="planning-table-item"
            v-for="plan in table.items"
            :key="plan.id"
            :class="{ disabled: plan?.transactions?.length > 0 && plan.id !== oldPlanningId }"
          >
            <span class="planning-table-item-radio">
              <kit-radio v-model="model" name="planning" :value="plan.id" />
            </span>
            <span class="planning-table-item-main">
              <span>{{ plan.description }}</span>
              <span
                class="planning-table-item-category"
                :style="getCategoryStyle(plan.categoryId as string)"
              >
                {{ getCategoriesLabel(plan.categoryId as string) }}
              </span>
            </span>
            <span class="planning-table-item-date" v-if="plan.date">
              <icon-calendar /> {{ formatDate(plan.date) }}
            </span>
            <span class="planning-table-item-amount" v-if="plan.currency === me?.me.currency">
              {{ plan.amount }} {{ formatCurrency(plan.currency) }}
            </span>
            <span class="planning-table-item-amount" v-else>
              <span class="planning-table-item-amount-original">
                {{ plan.amount }} {{ formatCurrency(plan.currency) }}
              </span>
              <span class="planning-table-item-amount-original"> / </span>
              {{ prepareExchangedAmount(plan.amount, plan.currency) }}
              {{ formatCurrency(me?.me.currency || '') }}
            </span>
          </label>
        </div>
      </div>
    </div>
  </kit-modal>
</template>

<style scoped>
.planning-content {
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

.planning-table-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-xl) var(--spacing-3xl);
  box-sizing: border-box;

  border-top: 1px solid var(--border-secondary);
}

.disabled {
  pointer-events: none;
  opacity: 0.5;
}

.planning-table-item-main {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.planning-table-item-amount {
  margin-left: auto;
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  flex-direction: row-reverse;
  gap: 1ch;
}

.planning-table-item-amount-original {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
}

.planning-table-item-date {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}
.planning-table-item-date svg {
  width: var(--line-height-text-sm);
  height: var(--line-height-text-sm);
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
