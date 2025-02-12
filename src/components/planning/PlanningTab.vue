<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToastStore } from '@/stores/toastStore.ts'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import { useDeletePlanning, usePlanningList } from '@/hooks/planning-hooks.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import {
  getExchangedAmount,
  getTotalAmount,
  type PlanningItem,
  reducePlanningByCategory,
} from '@/helpers/planning.ts'
import { getMainCategory } from '@/helpers/category.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'
import KitMonthSwitcher from '@/components/kit/KitMonthSwitcher.vue'
import PlanningForm from '@/components/planning/PlanningForm.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import PlanningEditForm from '@/components/planning/PlanningEditForm.vue'
import IconRepeat from '@/components/icons/IconRepeat.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import IconSlashCircle from '@/components/icons/IconSlashCircle.vue'

const { t } = useI18n()
const toastStore = useToastStore()
const { statisticDate } = useStatisticDateStore()
const { planning } = usePlanningList()
const { deletePlanning } = useDeletePlanning()
const { me } = useMe()

const editingPlanningId = ref<string | null>(null)

const planningTables = computed(() => {
  if (!planning?.value?.planning) return []
  return reducePlanningByCategory(planning.value.planning)
})

const repeatingPlanningTables = computed(() => {
  if (!planning?.value?.repeatingPlanning) return []
  return reducePlanningByCategory(planning.value.repeatingPlanning)
})

const handleDeletePlanning = (id: string) => {
  try {
    deletePlanning({
      planningId: Number(id),
    })
    // eslint-disable-next-line
  } catch (e: any) {
    try {
      const errorCodes = e.cause.extensions.originalError.errorCodes
      if (errorCodes?.form) {
        toastStore.error(t(`planning.form.errors.${errorCodes.form}`))
      }
      // eslint-disable-next-line
    } catch (e: any) {
      toastStore.error(t('common_errors.server_error'))
    }
  }
}

// ===== Render Helpers =====
const getCategoriesLabel = (category: string) => t(`transaction.categories.${category}`)
const getCategoryStyle = (category: string) => ({
  '--color': TRANSACTION_CATEGORIES_COLORS[getMainCategory(category)] || '',
})

const formatCurrency = (value: string) => {
  return CURRENCIES_SYMBOL[value] || value
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const preparePlaningTotal = (items: PlanningItem[]) => {
  if (!planning?.value || !me.value) return 0
  return Math.round(getTotalAmount(items, planning?.value.exchangeRate, me?.value.me.currency))
}

const prepareExchangedAmount = (amount: number, currency: string): number => {
  if (!planning?.value || !me.value) return 0
  return Math.round(
    getExchangedAmount(planning?.value.exchangeRate, amount, currency, me?.value.me.currency),
  )
}
</script>
<template>
  <div class="planning-container">
    <kit-month-switcher v-model="statisticDate" />
    <planning-form />

    <div class="planning-table" v-for="table in planningTables" :key="table.category">
      <div class="planning-table-header" :style="getCategoryStyle(table.category)">
        {{ getCategoriesLabel(table.category) }}
        <span>
          {{ preparePlaningTotal(table.items) }} {{ formatCurrency(me?.me.currency || '') }}
        </span>
      </div>
      <div class="planning-table-body">
        <div class="planning-table-item" v-for="plan in table.items" :key="plan.id">
          <template v-if="plan.id === editingPlanningId">
            <planning-edit-form :planning="plan" @closeForm="editingPlanningId = null" />
          </template>
          <template v-else>
            <template v-if="plan.type === 'TRANSACTION'">
              <div v-if="plan.repeat" class="planning-table-item-repeat"><icon-repeat /></div>
              <div>{{ plan.description }}</div>
              <div
                class="planning-table-item-category"
                :style="getCategoryStyle(plan.categoryId as string)"
              >
                {{ getCategoriesLabel(plan.categoryId as string) }}
              </div>
              <div class="planning-table-item-date" v-if="plan.date">
                <icon-calendar /> {{ formatDate(plan.date) }}
              </div>
              <div class="planning-table-item-amount" v-if="plan.currency === me?.me.currency">
                {{ plan.amount }} {{ formatCurrency(plan.currency) }}
              </div>
              <div class="planning-table-item-amount" v-else>
                <span class="planning-table-item-amount-original">
                  {{ plan.amount }} {{ formatCurrency(plan.currency) }} /
                </span>
                {{ prepareExchangedAmount(plan.amount, plan.currency) }}
                {{ formatCurrency(me?.me.currency || '') }}
              </div>
              <div class="planning-table-item-buttons">
                <kit-icon-button size="sm" @click="editingPlanningId = plan.id">
                  <icon-edit />
                </kit-icon-button>
                <kit-icon-button size="sm" @click="handleDeletePlanning(plan.id)">
                  <icon-trash />
                </kit-icon-button>
              </div>
            </template>
            <template v-else>
              <div v-if="plan.repeat" class="planning-table-item-repeat"><icon-repeat /></div>
              <div
                class="planning-table-item-category"
                :style="getCategoryStyle(plan.categoryId as string)"
              >
                {{ getCategoriesLabel(plan.categoryId as string) }}
              </div>
              <div class="planning-table-item-amount" v-if="plan.currency === me?.me.currency">
                {{ plan.amount }} {{ formatCurrency(plan.currency) }}
              </div>
              <div class="planning-table-item-amount" v-else>
                <span class="planning-table-item-amount-original">
                  {{ plan.amount }} {{ formatCurrency(plan.currency) }} /
                </span>
                {{ prepareExchangedAmount(plan.amount, plan.currency) }}
                {{ formatCurrency(me?.me.currency || '') }}
              </div>
              <div class="planning-table-item-buttons">
                <kit-icon-button size="sm" @click="editingPlanningId = plan.id">
                  <icon-edit />
                </kit-icon-button>
                <kit-icon-button size="sm" @click="handleDeletePlanning(plan.id)">
                  <icon-trash />
                </kit-icon-button>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>

    <div
      class="planning-table repeating"
      v-for="table in repeatingPlanningTables"
      :key="table.category"
    >
      <div class="planning-table-header" :style="getCategoryStyle(table.category)">
        {{ getCategoriesLabel(table.category) }}
        <span>
          {{ preparePlaningTotal(table.items) }} {{ formatCurrency(me?.me.currency || '') }}
        </span>
      </div>
      <div class="planning-table-body">
        <div class="planning-table-item" v-for="plan in table.items" :key="plan.id">
          <template v-if="plan.id === editingPlanningId">
            <planning-edit-form :planning="plan" @closeForm="editingPlanningId = null" />
          </template>
          <template v-else>
            <template v-if="plan.type === 'TRANSACTION'">
              <div v-if="plan.repeat" class="planning-table-item-repeat"><icon-repeat /></div>
              <div>{{ plan.description }}</div>
              <div
                class="planning-table-item-category"
                :style="getCategoryStyle(plan.categoryId as string)"
              >
                {{ getCategoriesLabel(plan.categoryId as string) }}
              </div>
              <div class="planning-table-item-date" v-if="plan.date">
                <icon-calendar /> {{ formatDate(plan.date) }}
              </div>
              <div class="planning-table-item-amount" v-if="plan.currency === me?.me.currency">
                {{ plan.amount }} {{ formatCurrency(plan.currency) }}
              </div>
              <div class="planning-table-item-amount" v-else>
                <span class="planning-table-item-amount-original">
                  {{ plan.amount }} {{ formatCurrency(plan.currency) }} /
                </span>
                {{ prepareExchangedAmount(plan.amount, plan.currency) }}
                {{ formatCurrency(me?.me.currency || '') }}
              </div>
              <div class="planning-table-item-buttons">
                <kit-icon-button size="sm">
                  <icon-slash-circle />
                </kit-icon-button>
                <kit-icon-button size="sm">
                  <icon-check />
                </kit-icon-button>
              </div>
            </template>
            <template v-else>
              <div v-if="plan.repeat" class="planning-table-item-repeat"><icon-repeat /></div>
              <div
                class="planning-table-item-category"
                :style="getCategoryStyle(plan.categoryId as string)"
              >
                {{ getCategoriesLabel(plan.categoryId as string) }}
              </div>
              <div class="planning-table-item-amount" v-if="plan.currency === me?.me.currency">
                {{ plan.amount }} {{ formatCurrency(plan.currency) }}
              </div>
              <div class="planning-table-item-amount" v-else>
                <span class="planning-table-item-amount-original">
                  {{ plan.amount }} {{ formatCurrency(plan.currency) }} /
                </span>
                {{ prepareExchangedAmount(plan.amount, plan.currency) }}
                {{ formatCurrency(me?.me.currency || '') }}
              </div>
              <div class="planning-table-item-buttons">
                <kit-icon-button size="sm">
                  <icon-slash-circle />
                </kit-icon-button>
                <kit-icon-button size="sm">
                  <icon-check />
                </kit-icon-button>
              </div>
            </template>
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

.planning-table.repeating {
  opacity: 0.5;
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

.planning-table-item-repeat :deep(svg) {
  width: 24px;
  height: 24px;

  color: var(--text-primary);
}

.planning-table-item-amount {
  margin-left: auto;
}

.planning-table-item-amount-original {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
}

.planning-table-item-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;

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

.planning-table-item-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}
</style>
