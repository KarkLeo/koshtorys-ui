<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { Planning } from '@/graphql/types.ts'
import { getChangedDateByMonthIndex, getIndexedYear, getMonthIndex } from '@/helpers/date.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'
import { useToastStore } from '@/stores/toastStore.ts'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import {
  useCanselRepeatingPlanning,
  useDeletePlanning,
  useRepeatPlanning,
} from '@/hooks/planning-hooks.ts'
import { usePlanningMapper } from '@/mappers/planning-mapper.ts'

import { useMe } from '@/hooks/auth-hooks.ts'

import { getMainCategory } from '@/helpers/category.ts'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconRepeat from '@/components/icons/IconRepeat.vue'
import IconCheck from '@/components/icons/IconCheck.vue'
import IconSlashCircle from '@/components/icons/IconSlashCircle.vue'
import KitMonthSwitcher from '@/components/kit/KitMonthSwitcher.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import PlanningAddForm from '@/components/planning/PlanningAddForm.vue'
import PlanningEditForm from '@/components/planning/PlanningEditForm.vue'
import KitPreloaderWithText from '@/components/kit/KitPreloaderWithText.vue'
import KitPreloader from '@/components/kit/KitPreloader.vue'

// ===== Hooks =====

const { t } = useI18n()
const toastStore = useToastStore()
const { statisticDate } = useStatisticDateStore()
const { deletePlanning, loading: deleteLoading } = useDeletePlanning()
const { repeatPlanning, loading: repeatPlanningLoading } = useRepeatPlanning()
const { canselRepeatingPlanning, loading: canselRepeatingPlanningLoading } =
  useCanselRepeatingPlanning()
const { me } = useMe()

// ===== Refs =====

const editingPlanningId = ref<string | null>(null)
const deletingPlanningId = ref<string | null>(null)
const activeRepitingPlanningId = ref<string | null>(null)

// ===== Computed =====

const { planningTables, repeatingPlanningTables, planningStatistics, loading } = usePlanningMapper()

// ===== Handlers =====

const handleDeletePlanning = async (id: string) => {
  try {
    deletingPlanningId.value = id
    await deletePlanning({
      planningId: Number(id),
    })
    toastStore.success(t('planning.form.messages.delete_success'))
    deletingPlanningId.value = null
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

const repeatPlanningHandler = async (plan: Planning) => {
  try {
    activeRepitingPlanningId.value = plan.id
    await repeatPlanning(plan)
    toastStore.success(t('planning.form.messages.repeat_success'))
    activeRepitingPlanningId.value = null
    // eslint-disable-next-line
  } catch (e: any) {
    toastStore.error(t('common_errors.server_error'))
  }
}

const canselRepeatingPlanningHandler = async (plan: Planning) => {
  try {
    activeRepitingPlanningId.value = plan.id
    await canselRepeatingPlanning(plan)
    toastStore.success(t('planning.form.messages.cansel_repeat_success'))
    activeRepitingPlanningId.value = null

    // eslint-disable-next-line
  } catch (e: any) {
    toastStore.error(t('common_errors.server_error'))
  }
}

// ===== Render Helpers =====

const getCategoriesLabel = (category: string) => t(`categories.${category}`)
const getCategoryStyle = (category: string) => ({
  '--color': TRANSACTION_CATEGORIES_COLORS[getMainCategory(category)] || '',
})

const formatAmount = (value: number) => {
  // return value.toFixed(2) || ''
  return Math.round(value)
}

const formatCurrency = (value: string) => {
  return CURRENCIES_SYMBOL[value] || value
}

const prepareRepeatedDate = (date: string) => {
  const monthIndex = getMonthIndex(statisticDate.value, me.value?.me.monthStartDay)
  const year = getIndexedYear(statisticDate.value, me.value?.me.monthStartDay)
  return getChangedDateByMonthIndex(
    new Date(date),
    year,
    monthIndex,
    me.value?.me.monthStartDay,
  ).toLocaleDateString()
}
</script>
<template>
  <div class="planning-container">
    <KitMonthSwitcher v-model="statisticDate" />

    <KitPreloaderWithText v-if="loading" class="planning-loader" size="md" />

    <h4 v-if="!loading && planningTables.length === 0" class="planning-empty">
      {{ $t('planning.table.empty') }}
    </h4>

    <div v-if="!loading && planningTables.length > 0" class="planning-header">
      <div class="planning-header-item">
        <div class="planning-header-item-title">{{ t('planning.header.monthlyBudget') }}</div>
        <div class="planning-header-item-value">
          {{ formatAmount(planningStatistics?.monthlyBudget || 0) }}
          {{ formatCurrency(me?.me.currency || '') }}
        </div>
      </div>
      <div class="planning-header-item">
        <div class="planning-header-item-title">{{ t('planning.header.plannedExpenses') }}</div>
        <div class="planning-header-item-value">
          {{ formatAmount(planningStatistics?.plannedExpenses || 0) }}
          {{ formatCurrency(me?.me.currency || '') }}
        </div>
      </div>
      <div class="planning-header-item">
        <div class="planning-header-item-title">{{ t('planning.header.freeMoney') }}</div>
        <div class="planning-header-item-value">
          {{ formatAmount(planningStatistics?.freeMoney || 0) }}
          {{ formatCurrency(me?.me.currency || '') }}
        </div>
      </div>

      <div class="planning-header-item">
        <div class="planning-header-item-title">{{ t('planning.header.remainingToPay') }}</div>
        <div class="planning-header-item-value">
          {{ formatAmount(planningStatistics?.remainingToPay || 0) }}
          {{ formatCurrency(me?.me.currency || '') }}
        </div>
      </div>
    </div>

    <div v-for="table in planningTables" :key="table.category" class="planning-table">
      <div class="planning-table-header" :style="getCategoryStyle(table.category)">
        {{ getCategoriesLabel(table.category) }}
        <span>{{ formatAmount(table.total) }} {{ formatCurrency(me?.me.currency || '') }}</span>
      </div>
      <div class="planning-table-body">
        <div class="planning-table-item" v-for="plan in table.items" :key="plan.id">
          <template v-if="plan.id === editingPlanningId">
            <PlanningEditForm :planning="plan.original" @closeForm="editingPlanningId = null" />
          </template>
          <template v-else>
            <template v-if="plan.type === 'TRANSACTION'">
              <div class="planning-table-item-title">
                <div>{{ plan.description }}</div>
                <div
                  class="planning-table-item-category"
                  :style="{
                    '--color': plan.categoryColor,
                  }"
                >
                  {{ plan.categoryName }}
                </div>
              </div>

              <div class="planning-table-item-date" v-if="plan.repeat || plan.date">
                <IconRepeat v-if="plan.repeat" /><IconCalendar v-else />
                {{ plan.date || t('planning.table.repeat') }}
              </div>

              <div class="planning-table-item-amount-wrapper">
                <div class="planning-table-item-amount">
                  <span
                    class="planning-table-item-amount-original"
                    v-if="plan.originalAmount && plan.originalCurrency"
                  >
                    {{ formatAmount(plan.originalAmount) }} {{ plan.originalCurrency }} /
                  </span>
                  {{ formatAmount(plan.amount) }} {{ plan.currency }}
                </div>
                <div
                  :class="[
                    'planning-table-item-amount-transactions',
                    {
                      negative: (plan.transactionsAmount || 0) > plan.amount,
                      positive: (plan.transactionsAmount || 0) < plan.amount,
                    },
                  ]"
                  v-if="plan.transactionsAmount"
                >
                  {{ $t('planning.table.paid') }}: {{ formatAmount(plan.transactionsAmount) }}
                  {{ plan.currency }}
                </div>
              </div>

              <div class="planning-table-item-buttons">
                <KitPreloader
                  v-if="deletingPlanningId === plan.id && deleteLoading"
                  size="sm"
                  class="planning-table-item-preloader"
                />
                <template v-else>
                  <KitIconButton size="sm" @click="editingPlanningId = plan.id">
                    <IconEdit />
                  </KitIconButton>
                  <KitIconButton size="sm" @click="handleDeletePlanning(plan.id)">
                    <IconTrash />
                  </KitIconButton>
                </template>
              </div>
            </template>
            <template v-else>
              <div class="planning-table-item-title">
                <div
                  class="planning-table-item-category"
                  :style="{
                    '--color': plan.categoryColor,
                  }"
                >
                  {{ plan.categoryName }}
                </div>
              </div>

              <div class="planning-table-item-date" v-if="plan.repeat">
                <IconRepeat /> {{ t('planning.table.repeat') }}
              </div>

              <div class="planning-table-item-amount-wrapper">
                <div class="planning-table-item-amount">
                  <span
                    class="planning-table-item-amount-original"
                    v-if="plan.originalAmount && plan.originalCurrency"
                  >
                    {{ formatAmount(plan.originalAmount) }} {{ plan.originalCurrency }} /
                  </span>
                  {{ formatAmount(plan.amount) }} {{ plan.currency }}
                </div>
                <div
                  :class="[
                    'planning-table-item-amount-transactions',
                    {
                      negative: (plan.transactionsAmount || 0) > plan.amount,
                      positive: (plan.transactionsAmount || 0) < plan.amount,
                    },
                  ]"
                  v-if="plan.transactionsAmount"
                >
                  {{ $t('planning.table.paid') }}: {{ formatAmount(plan.transactionsAmount) }}
                  {{ plan.currency }}
                </div>
              </div>
              <div class="planning-table-item-buttons">
                <KitPreloader
                  v-if="deletingPlanningId === plan.id && deleteLoading"
                  size="sm"
                  class="planning-table-item-preloader"
                />
                <template v-else>
                  <KitIconButton size="sm" @click="editingPlanningId = plan.id">
                    <IconEdit />
                  </KitIconButton>
                  <KitIconButton size="sm" @click="handleDeletePlanning(plan.id)">
                    <IconTrash />
                  </KitIconButton>
                </template>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
    <PlanningAddForm />
    <div
      class="planning-table repeating"
      v-for="table in repeatingPlanningTables"
      :key="table.category"
    >
      <div class="planning-table-header" :style="getCategoryStyle(table.category)">
        {{ getCategoriesLabel(table.category) }}
        <span> {{ table.total }} {{ formatCurrency(me?.me.currency || '') }} </span>
      </div>
      <div class="planning-table-body">
        <div class="planning-table-item" v-for="plan in table.items" :key="plan.id">
          <template v-if="plan.type === 'TRANSACTION'">
            <div class="planning-table-item-title">
              <div>{{ plan.description }}</div>
              <div
                class="planning-table-item-category"
                :style="{
                  '--color': plan.categoryColor,
                }"
              >
                {{ plan.categoryName }}
              </div>
            </div>

            <div class="planning-table-item-date" v-if="plan.repeat || plan.date">
              <IconRepeat v-if="plan.repeat" /><IconCalendar v-else />
              {{ plan.date ? prepareRepeatedDate(plan.date) : t('planning.table.repeat') }}
            </div>

            <div class="planning-table-item-amount-wrapper">
              <div class="planning-table-item-amount">
                <span
                  class="planning-table-item-amount-original"
                  v-if="plan.originalAmount && plan.originalCurrency"
                >
                  {{ formatAmount(plan.originalAmount) }} {{ plan.originalCurrency }} /
                </span>
                {{ formatAmount(plan.amount) }} {{ plan.currency }}
              </div>
            </div>

            <div class="planning-table-item-buttons">
              <KitPreloader
                v-if="
                  activeRepitingPlanningId === plan.id &&
                  (repeatPlanningLoading || canselRepeatingPlanningLoading)
                "
                size="sm"
                class="planning-table-item-preloader"
              />
              <template v-else>
                <KitIconButton size="sm" @click="canselRepeatingPlanningHandler(plan.original)">
                  <IconSlashCircle />
                </KitIconButton>
                <KitIconButton size="sm" @click="repeatPlanningHandler(plan.original)">
                  <IconCheck />
                </KitIconButton>
              </template>
            </div>
          </template>
          <template v-else>
            <div class="planning-table-item-title">
              <div
                class="planning-table-item-category"
                :style="{
                  '--color': plan.categoryColor,
                }"
              >
                {{ plan.categoryName }}
              </div>
            </div>

            <div class="planning-table-item-date" v-if="plan.repeat">
              <IconRepeat />{{ t('planning.table.repeat') }}
            </div>

            <div class="planning-table-item-amount-wrapper">
              <div class="planning-table-item-amount">
                <span
                  class="planning-table-item-amount-original"
                  v-if="plan.originalAmount && plan.originalCurrency"
                >
                  {{ formatAmount(plan.originalAmount) }} {{ plan.originalCurrency }} /
                </span>
                {{ formatAmount(plan.amount) }} {{ plan.currency }}
              </div>
            </div>

            <div class="planning-table-item-buttons">
              <KitPreloader
                v-if="
                  activeRepitingPlanningId === plan.id &&
                  (repeatPlanningLoading || canselRepeatingPlanningLoading)
                "
                size="sm"
                class="planning-table-item-preloader"
              />
              <template v-else>
                <KitIconButton size="sm" @click="canselRepeatingPlanningHandler(plan.original)">
                  <IconSlashCircle />
                </KitIconButton>
                <KitIconButton size="sm" @click="repeatPlanningHandler(plan.original)">
                  <IconCheck />
                </KitIconButton>
              </template>
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

.planning-loader {
  margin: var(--spacing-xl) auto;
}

.planning-empty {
  margin: var(--spacing-xl) 0;
  padding: 0;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  font-style: italic;
  color: var(--text-tertiary);
  text-align: center;
}

.planning-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}

.planning-header-item {
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  box-sizing: border-box;

  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
}

.planning-header-item-title {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-tertiary);
}

.planning-header-item-value {
  margin-top: auto;

  font-size: var(--font-size-display-sm);
  line-height: var(--line-height-display-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
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
  position: relative;

  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  column-gap: var(--spacing-xl);
  row-gap: var(--spacing-sm);
  padding: var(--spacing-xl) var(--spacing-3xl);
  box-sizing: border-box;

  border-top: 1px solid var(--border-secondary);
}

.planning-table-item-title {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.planning-table-item-amount-wrapper {
  width: 100%;
  grid-row: 1 / 2;
  grid-column: 2 / 3;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  align-self: start;
}

.planning-table-item-amount {
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

.planning-table-item-amount-transactions {
  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--border-brand);
}
.planning-table-item-amount-transactions.negative {
  color: var(--text-error-primary);
}
.planning-table-item-amount-transactions.positive {
  color: var(--text-success-primary);
}

.planning-table-item-date {
  width: 100%;
  grid-column: 1 / 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  align-self: center;
  justify-self: start;
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
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.planning-table-item-buttons {
  grid-column: 2 / 3;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.planning-table-item-preloader {
  margin-left: 52px;
}

@media screen and (min-width: 768px) {
  .planning-header {
    display: flex;
    flex-direction: row;
    gap: var(--spacing-2xl);
  }

  .planning-header-item {
    padding: var(--spacing-2xl);
    gap: var(--spacing-2xl);
  }

  .planning-table-item {
    display: flex;
  }

  .planning-table-item-amount-wrapper {
    margin-left: auto;
    align-self: center;
  }

  .planning-table-item-date {
    margin-left: auto;
  }
}
</style>
