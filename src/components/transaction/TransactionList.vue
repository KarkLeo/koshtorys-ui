<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { TransactionsQuery } from '@/graphql/types.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useToastStore } from '@/stores/toastStore.ts'
import { useDeleteTransaction, useTransactionList } from '@/hooks/transaction-hooks.ts'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'

import KitMonthSwitcher from '@/components/kit/KitMonthSwitcher.vue'
import WaveChart from '@/components/transaction/WaveChart.vue'
import KitContextMenu from '@/components/kit/KitContextMenu.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import EditTransactionForm from '@/components/transaction/EditTransactionForm.vue'
import IconLink from '@/components/icons/IconLink.vue'
import KitPreloaderWithText from '@/components/kit/KitPreloaderWithText.vue'
import KitPreloader from '@/components/kit/KitPreloader.vue'

// ===== Types =====

type BaseTransaction = TransactionsQuery['transactions'][number]

interface ExtendedTransaction extends BaseTransaction {
  originalAmount?: number
  originalCurrency?: string
}

// ===== Hooks =====

const { t } = useI18n()
const toastStore = useToastStore()
const { statisticDate } = useStatisticDateStore()
const { me } = useMe()

const { transactions, loading } = useTransactionList()
const { deleteTransaction, loading: deleteLoading } = useDeleteTransaction()

// ===== Refs =====

const editingTransactionId = ref<string | null>(null)
const deletingTransactionId = ref<string | null>(null)

// ===== Computed =====

const list = computed<ExtendedTransaction[]>(() => {
  const meCurrency = me.value?.me.currency
  if (!meCurrency || !transactions.value?.transactions) return []

  return transactions.value.transactions
    .map((transaction: BaseTransaction) => {
      if (meCurrency !== transaction.currency) {
        const amount =
          (transaction.amount / transaction.exchangeRate.rates[transaction.currency]) *
          transaction.exchangeRate.rates[meCurrency]

        return {
          ...transaction,
          amount,
          currency: meCurrency,
          originalAmount: transaction.amount,
          originalCurrency: transaction.currency,
          date: new Date(transaction.date),
        }
      }
      return { ...transaction, date: new Date(transaction.date) }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
})

const sum = computed(() => {
  return list.value.reduce((acc, transaction) => acc + transaction.amount, 0)
})

// ===== Handlers =====

const handleDeleteTransaction = async (id: string) => {
  try {
    deletingTransactionId.value = id
    await deleteTransaction({
      transactionId: Number(id),
    })
    toastStore.success(t('transaction.form.messages.delete_success'))
    deletingTransactionId.value = null
    // eslint-disable-next-line
  } catch (e: any) {
    try {
      const errorCodes = e.cause.extensions.originalError.errorCodes
      if (errorCodes?.form) {
        toastStore.error(t(`transaction.form.errors.${errorCodes.form}`))
      }
      // eslint-disable-next-line
    } catch (e: any) {
      toastStore.error(t('common_errors.server_error'))
    }
  }
}

// ===== Renders utils =====

const formatAmount = (value: number) => {
  // return value.toFixed(2) || ''
  return Math.round(value)
}
const formatDate = (date: Date) => {
  return date.toLocaleDateString()
}

const formatCurrency = (value: string) => {
  return CURRENCIES_SYMBOL[value] || value
}

const getCategoryColor = (categoryId: string) => {
  return TRANSACTION_CATEGORIES_COLORS[categoryId.replace(/--.*$/, '')] || ''
}

// ===== Watchers =====

watch(statisticDate, () => {
  editingTransactionId.value = null
  deletingTransactionId.value = null
})
</script>

<template>
  <div class="transaction-container">
    <KitMonthSwitcher v-model="statisticDate" />

    <WaveChart
      :current="sum"
      :max="me?.me.monthlyBudget || 0"
      :message="`${formatAmount(sum)} / ${formatAmount(me?.me.monthlyBudget || 0)} ${formatCurrency(me?.me.currency || '')}`"
    />

    <KitPreloaderWithText class="transition-loader" size="md" v-if="loading" />

    <h4 class="transition-empty" v-if="!loading && list.length === 0">
      {{ $t('transaction.table.empty') }}
    </h4>

    <ul class="transaction-list" v-if="!loading && list.length > 0">
      <li v-for="transaction in list" :key="transaction.id" class="transaction">
        <div class="transaction-wrapper" v-if="transaction.id !== editingTransactionId">
          <div class="transaction-header">
            <div class="transaction-amount">
              <p class="transaction-amount-main">
                {{ formatAmount(transaction.amount) }}
                {{ formatCurrency(transaction?.currency || '') }}
              </p>
              <p v-if="transaction?.originalAmount" class="transaction-amount-secondary">
                / {{ formatAmount(transaction.originalAmount) }}
                {{ formatCurrency(transaction?.originalCurrency || '') }}
              </p>
            </div>

            <div class="transaction-category-wrapper">
              <p
                class="transaction-category"
                :style="{ '--color': getCategoryColor(transaction.categoryId as string) }"
              >
                {{ $t(`categories.${transaction.categoryId}`) }}
              </p>
              <p class="transaction-planning" v-if="transaction.planningId"><IconLink /></p>
            </div>
            <p class="transaction-date">{{ formatDate(transaction.date) }}</p>
            <KitPreloader
              v-if="deletingTransactionId === transaction.id && deleteLoading"
              class="transaction-menu"
              size="sm"
            />
            <KitContextMenu v-else class="transaction-menu">
              <KitIconButton @click="editingTransactionId = transaction.id" size="md">
                <IconEdit />
              </KitIconButton>
              <KitIconButton @click="handleDeleteTransaction(transaction.id)" size="md">
                <IconTrash />
              </KitIconButton>
            </KitContextMenu>
          </div>
          <p class="transaction-description">{{ transaction.description }}</p>
        </div>

        <EditTransactionForm
          v-else
          :transaction="transaction"
          @close-form="editingTransactionId = null"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.transaction-container {
  max-width: 600px;
  margin: 0 auto 300px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.transition-loader {
  margin: var(--spacing-xl) auto 0;
}

.transition-empty {
  margin: var(--spacing-xl) 0 0;
  padding: 0;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  font-style: italic;
  color: var(--text-tertiary);
  text-align: center;
}

.transaction-list {
  list-style: none;
  margin: var(--spacing-lg) 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.transaction-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  box-sizing: border-box;

  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
}

.transaction-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: max-content max-content;
  gap: var(--spacing-md);
  row-gap: var(--spacing-lg);
}

.transaction-amount {
  grid-column: 1 / 4;
  grid-row: 1 / 2;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.transaction-amount-main {
  margin: 0;

  font-size: var(--font-size-display-sm);
  line-height: var(--line-height-display-sm);
  font-weight: var(--font-weight-semibold);
}

.transaction-amount-secondary {
  margin: 0;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
}

.transaction-menu {
  margin-left: auto;
}

.transaction-date {
  grid-column: 3 / 5;
  grid-row: 2 / 3;
  align-self: center;
  margin: 0 0 0 auto;

  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.transaction-description {
  margin: 0;

  font-size: var(--font-size-text-md);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-regular);
  color: var(--text-tertiary);
}

.transaction-category-wrapper {
  grid-column: 1 / 3;
  grid-row: 2 / 3;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.transaction-category {
  margin: 0;
  padding: var(--spacing-xxs) 10px;
  box-sizing: border-box;
  width: min-content;
  max-width: 220px;
  overflow: hidden;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-medium);
  color: var(--color);
  white-space: nowrap;
  text-overflow: ellipsis;

  border: 1px solid var(--color);
  border-radius: var(--radius-full);
}

.transaction-planning {
  margin: 0;
  display: flex;
  align-items: center;
}
.transaction-planning :deep(svg) {
  width: var(--font-size-text-md);
  height: var(--font-size-text-md);

  color: var(--fg-brand-primary);
}
@media screen and (min-width: 768px) {
  .transaction-container {
    padding: 0 var(--spacing-xl);
  }

  .transaction-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: var(--spacing-xl);
  }

  .transaction-menu {
    margin-left: inherit;
  }
}
</style>
