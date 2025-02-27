<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ExchangeRate, Planning, Transaction } from '@/graphql/types.ts'
import { getChangedDateByMonthIndex, getIndexedYear, getMonthIndex } from '@/helpers/date.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'
import { useToastStore } from '@/stores/toastStore.ts'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import {
  useCanselRepeatingPlanning,
  useDeletePlanning,
  usePlanningList,
  useRepeatPlanning,
} from '@/hooks/planning-hooks.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import {
  filterPlanning,
  getExchangedAmount,
  getTotalAmount,
  getTransactionsAmount,
  getTransactionsAmountByCategory,
  reducePlanningByCategory,
} from '@/helpers/planning.ts'
import { getMainCategory } from '@/helpers/category.ts'
import { useTransactionList } from '@/hooks/transaction-hooks.ts'

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

// ===== Hooks =====

const { t } = useI18n()
const toastStore = useToastStore()
const { statisticDate } = useStatisticDateStore()
const { planning } = usePlanningList()
const { deletePlanning } = useDeletePlanning()
const { repeatPlanning } = useRepeatPlanning()
const { transactions } = useTransactionList()
const { canselRepeatingPlanning } = useCanselRepeatingPlanning()
const { me } = useMe()

// ===== Refs =====

const editingPlanningId = ref<string | null>(null)

// ===== Computed =====

const planningTables = computed(() => {
  if (!planning?.value?.planning) return []
  return reducePlanningByCategory(planning.value.planning as Planning[])
})

const repeatingPlanningTables = computed(() => {
  if (!planning?.value?.repeatingPlanning && !planning?.value?.planning) return []
  return reducePlanningByCategory(
    filterPlanning(
      planning.value.repeatingPlanning as Planning[],
      planning?.value?.planning as Planning[],
    ),
  )
})

// ===== Handlers =====

const handleDeletePlanning = (id: string) => {
  try {
    deletePlanning({
      planningId: Number(id),
    })
    toastStore.success(t('planning.form.messages.delete_success'))
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
    await repeatPlanning(plan)
    toastStore.success(t('planning.form.messages.repeat_success'))
    // eslint-disable-next-line
  } catch (e: any) {
    toastStore.error(t('common_errors.server_error'))
  }
}

const canselRepeatingPlanningHandler = async (plan: Planning) => {
  try {
    await canselRepeatingPlanning(plan)
    toastStore.success(t('planning.form.messages.cansel_repeat_success'))
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

const formatCurrency = (value: string) => {
  return CURRENCIES_SYMBOL[value] || value
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const preparePlaningTotal = (items: Planning[]) => {
  if (!planning?.value || !me.value) return 0
  return Math.round(
    getTotalAmount(items, planning.value.exchangeRate as ExchangeRate, me?.value.me.currency),
  )
}

const preparePlaningRemainingTotal = (items: Planning[]) => {
  if (!planning?.value || !me.value) return 0
  return Math.round(
    getTotalAmount(
      items
        .filter((plan) => !(plan.type === 'TRANSACTION' && plan.transactions?.length))
        .map((plan): Planning => {
          if (plan.type === 'CATEGORY') {
            const transactionAmount = getTransactionsAmountByCategory(
              (transactions.value?.transactions || []) as Transaction[],
              plan.categoryId,
              me?.value?.me.currency,
            )
            const amount =
              plan.currency === me?.value?.me.currency
                ? plan.amount
                : prepareExchangedAmount(plan.amount, plan.currency)

            return {
              ...plan,
              amount: amount - (transactionAmount || 0),
              currency: me.value?.me.currency as string,
            }
          }

          return plan
        }),
      planning.value?.exchangeRate as ExchangeRate,
      me.value?.me.currency,
    ),
  )
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

    <div class="planning-header">
      <div class="planning-header-item">
        <div class="planning-header-item-title">{{ t('planning.header.monthlyBudget') }}</div>
        <div class="planning-header-item-value">
          {{ me?.me.monthlyBudget }}
          {{ formatCurrency(me?.me.currency || '') }}
        </div>
      </div>
      <div class="planning-header-item">
        <div class="planning-header-item-title">{{ t('planning.header.total') }}</div>
        <div class="planning-header-item-value">
          {{ preparePlaningTotal((planning?.planning || []) as Planning[]) }}
          {{ formatCurrency(me?.me.currency || '') }}
        </div>
      </div>
      <div class="planning-header-item">
        <div class="planning-header-item-title">{{ t('planning.header.remaining') }}</div>
        <div class="planning-header-item-value">
          {{
            (me?.me.monthlyBudget || 0) -
            preparePlaningTotal(
              (planning?.planning || []).map((plan) => {
                if (plan.type === 'TRANSACTION' && plan.transactions?.length) {
                  const transactionAmount = getTransactionsAmount(plan as Planning, me?.me.currency)
                  return {
                    ...plan,
                    amount: transactionAmount || plan.amount,
                    currency: transactionAmount ? me?.me.currency : plan.currency,
                  }
                }
                return plan
              }) as Planning[],
            )
          }}
          {{ formatCurrency(me?.me.currency || '') }}
        </div>
      </div>

      <div class="planning-header-item">
        <div class="planning-header-item-title">{{ t('planning.header.remaining_due') }}</div>
        <div class="planning-header-item-value">
          {{ preparePlaningRemainingTotal((planning?.planning || []) as Planning[]) }}
          {{ formatCurrency(me?.me.currency || '') }}
        </div>
      </div>
    </div>

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
                <IconCalendar /> {{ formatDate(plan.date) }}
              </div>
              <div class="planning-table-item-amount-wrapper">
                <div class="planning-table-item-amount" v-if="plan.currency === me?.me.currency">
                  {{ plan.amount }} {{ formatCurrency(plan.currency) }}
                </div>
                <div class="planning-table-item-amount" v-else>
                  <span class="planning-table-item-amount-original">
                    {{ plan.amount }} {{ formatCurrency(plan.currency) }}
                  </span>
                  <span class="planning-table-item-amount-original"> / </span>
                  {{ prepareExchangedAmount(plan.amount, plan.currency) }}
                  {{ formatCurrency(me?.me.currency || '') }}
                </div>

                <div
                  :class="[
                    'planning-table-item-amount-transactions',
                    {
                      negative:
                        (getTransactionsAmount(plan, me?.me.currency) || 0) >
                        (plan.currency === me?.me.currency
                          ? plan.amount
                          : prepareExchangedAmount(plan.amount, plan.currency)),
                      positive:
                        (getTransactionsAmount(plan, me?.me.currency) || 0) <
                        (plan.currency === me?.me.currency
                          ? plan.amount
                          : prepareExchangedAmount(plan.amount, plan.currency)),
                    },
                  ]"
                  v-if="getTransactionsAmount(plan, me?.me.currency) !== null"
                >
                  {{ $t('planning.table.paid') }}:
                  {{ getTransactionsAmount(plan, me?.me.currency) }}
                  {{ formatCurrency(me?.me.currency || '') }}
                </div>
              </div>

              <div class="planning-table-item-buttons">
                <KitIconButton size="sm" @click="editingPlanningId = plan.id">
                  <IconEdit />
                </KitIconButton>
                <KitIconButton size="sm" @click="handleDeletePlanning(plan.id)">
                  <IconTrash />
                </KitIconButton>
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
              <div class="planning-table-item-amount-wrapper">
                <div class="planning-table-item-amount" v-if="plan.currency === me?.me.currency">
                  {{ plan.amount }} {{ formatCurrency(plan.currency) }}
                </div>
                <div class="planning-table-item-amount" v-else>
                  <span class="planning-table-item-amount-original">
                    {{ plan.amount }} {{ formatCurrency(plan.currency) }}
                  </span>
                  <span class="planning-table-item-amount-original"> / </span>
                  {{ prepareExchangedAmount(plan.amount, plan.currency) }}
                  {{ formatCurrency(me?.me.currency || '') }}
                </div>
                <div
                  :class="[
                    'planning-table-item-amount-transactions',
                    {
                      negative:
                        (getTransactionsAmountByCategory(
                          (transactions?.transactions || []) as Transaction[],
                          plan.categoryId,
                          me?.me.currency,
                        ) || 0) >
                        (plan.currency === me?.me.currency
                          ? plan.amount
                          : prepareExchangedAmount(plan.amount, plan.currency)),
                      positive:
                        (getTransactionsAmountByCategory(
                          (transactions?.transactions || []) as Transaction[],
                          plan.categoryId,
                          me?.me.currency,
                        ) || 0) <
                        (plan.currency === me?.me.currency
                          ? plan.amount
                          : prepareExchangedAmount(plan.amount, plan.currency)),
                    },
                  ]"
                  v-if="
                    getTransactionsAmountByCategory(
                      (transactions?.transactions || []) as Transaction[],
                      plan.categoryId,
                      me?.me.currency,
                    ) !== null
                  "
                >
                  {{ $t('planning.table.paid') }}:
                  {{
                    getTransactionsAmountByCategory(
                      (transactions?.transactions || []) as Transaction[],
                      plan.categoryId,
                      me?.me.currency,
                    )
                  }}
                  {{ formatCurrency(me?.me.currency || '') }}
                </div>
              </div>
              <div class="planning-table-item-buttons">
                <KitIconButton size="sm" @click="editingPlanningId = plan.id">
                  <IconEdit />
                </KitIconButton>
                <KitIconButton size="sm" @click="handleDeletePlanning(plan.id)">
                  <IconTrash />
                </KitIconButton>
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
        <span>
          {{ preparePlaningTotal(table.items) }} {{ formatCurrency(me?.me.currency || '') }}
        </span>
      </div>
      <div class="planning-table-body">
        <div class="planning-table-item" v-for="plan in table.items" :key="plan.id">
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
              <IconCalendar /> {{ prepareRepeatedDate(plan.date) }}
            </div>
            <div class="planning-table-item-amount" v-if="plan.currency === me?.me.currency">
              {{ plan.amount }} {{ formatCurrency(plan.currency) }}
            </div>
            <div class="planning-table-item-amount" v-else>
              <span class="planning-table-item-amount-original">
                {{ plan.amount }} {{ formatCurrency(plan.currency) }}
              </span>
              <span class="planning-table-item-amount-original"> / </span>
              {{ prepareExchangedAmount(plan.amount, plan.currency) }}
              {{ formatCurrency(me?.me.currency || '') }}
            </div>
            <div class="planning-table-item-buttons">
              <KitIconButton size="sm" @click="canselRepeatingPlanningHandler(plan)">
                <IconSlashCircle />
              </KitIconButton>
              <KitIconButton size="sm" @click="repeatPlanningHandler(plan)">
                <IconCheck />
              </KitIconButton>
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
                {{ plan.amount }} {{ formatCurrency(plan.currency) }}
              </span>
              <span class="planning-table-item-amount-original"> / </span>
              {{ prepareExchangedAmount(plan.amount, plan.currency) }}
              {{ formatCurrency(me?.me.currency || '') }}
            </div>
            <div class="planning-table-item-buttons">
              <KitIconButton size="sm" @click="canselRepeatingPlanningHandler(plan)">
                <IconSlashCircle />
              </KitIconButton>
              <KitIconButton size="sm" @click="repeatPlanningHandler(plan)">
                <IconCheck />
              </KitIconButton>
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

.planning-header {
  display: flex;
  flex-direction: column;
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
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-xl) var(--spacing-3xl);
  box-sizing: border-box;

  border-top: 1px solid var(--border-secondary);
}

.planning-table-item-repeat {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
}
.planning-table-item-repeat :deep(svg) {
  width: 24px;
  height: 24px;

  color: var(--text-primary);
}

.planning-table-item-amount-wrapper {
  grid-column: 1/ 2;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
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
  grid-column: 2 / 3;
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

.planning-table-item-buttons {
  grid-column: 2 / 3;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

@media screen and (min-width: 768px) {
  .planning-header {
    flex-direction: row;
    gap: var(--spacing-2xl);
  }

  .planning-header-item {
    padding: var(--spacing-2xl);
  }

  .planning-table-item {
    display: flex;
  }
  .planning-table-item-amount-wrapper {
    display: flex;
    margin-left: auto;
  }

  .planning-table-item-date {
    margin-left: auto;
  }
}
</style>
