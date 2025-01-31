<script setup lang="ts">
import { computed, ref } from 'vue'

import type { TransactionsQuery } from '@/graphql/types.ts'
import { CURRENCIES_SYMBOL } from '@/constants/currencies.ts'
import { TRANSACTION_CATEGORIES_COLORS } from '@/constants/transaction-categories.ts'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useDeleteTransaction, useTransactionList } from '@/hooks/transaction-hooks.ts'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'

import KitMonthSwitcher from '@/components/kit/KitMonthSwitcher.vue'
import WaveChart from '@/components/WaveChart.vue'
import KitContextMenu from '@/components/kit/KitContextMenu.vue'
import KitIconButton from '@/components/kit/KitIconButton.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import EditTransactionForm from '@/components/EditTransactionForm.vue'

const { statisticDate } = useStatisticDateStore()
const { me } = useMe()

const editingTransactionId = ref<string | null>(null)

const { transactions } = useTransactionList()
const { deleteTransaction } = useDeleteTransaction()

type BaseTransaction = TransactionsQuery['transactions'][number]

interface ExtendedTransaction extends BaseTransaction {
  originalAmount?: number
  originalCurrency?: string
}

const list = computed<ExtendedTransaction[]>(() => {
  const meCurrency = me.value?.me.currency
  if (!meCurrency || !transactions.value?.transactions) return []

  return transactions.value.transactions.map((transaction: BaseTransaction) => {
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
      }
    }
    return transaction
  })
})

const sum = computed(() => {
  return list.value.reduce((acc, transaction) => acc + transaction.amount, 0)
})

const formatAmount = (value: number) => {
  // return value.toFixed(2) || ''
  return Math.round(value)
}
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (value: string) => {
  return CURRENCIES_SYMBOL[value] || value
}

const getCategoryColor = (categoryId: string) => {
  return TRANSACTION_CATEGORIES_COLORS[categoryId.replace(/--.*$/, '')] || ''
}

const handleDeleteTransaction = (id: string) => {
  deleteTransaction({
    transactionId: Number(id),
  })
}
</script>

<template>
  <div class="transaction-container">
    <kit-month-switcher v-model="statisticDate" />
    <h2>
      {{ formatAmount(sum) }} /
      {{ formatAmount(me?.me.monthlyBudget || 0) }}
      {{ formatCurrency(me?.me.currency || '') }}
    </h2>
    <wave-chart :current="sum" :max="me?.me.monthlyBudget || 0" />

    <ul class="transaction-list">
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
            <kit-context-menu>
              <kit-icon-button @click="editingTransactionId = transaction.id">
                <icon-edit />
              </kit-icon-button>
              <kit-icon-button @click="handleDeleteTransaction(transaction.id)">
                <icon-trash />
              </kit-icon-button>
            </kit-context-menu>
          </div>
          <div class="transaction-middle">
            <p class="transaction-date">{{ formatDate(transaction.date) }}</p>
            <p
              class="transaction-category"
              :style="{ '--color': getCategoryColor(transaction.categoryId as string) }"
            >
              {{ $t(`transaction.categories.${transaction.categoryId}`) }}
            </p>
          </div>
          <p class="transaction-description">{{ transaction.description }}</p>
        </div>
        <edit-transaction-form
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
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

.transaction-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.transaction-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: var(--spacing-xl);
  box-sizing: border-box;

  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.transaction-amount {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.transaction-middle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-xl);
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

.transaction-date {
  margin: 0;

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

.transaction-category {
  margin: 0;
  padding: var(--spacing-xxs) 10px;
  box-sizing: border-box;

  font-size: var(--font-size-text-sm);
  line-height: var(--line-height-text-md);
  font-weight: var(--font-weight-medium);
  color: var(--color);

  border: 1px solid var(--color);
  border-radius: var(--radius-full);
}
</style>
