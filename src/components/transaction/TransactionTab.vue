<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import TransactionsView from '@/components/transaction/TransactionsView.vue'
import AddTransactionForm from '@/components/transaction/AddTransactionForm.vue'
import EditTransactionForm from '@/components/transaction/EditTransactionForm.vue'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useMonthlyTransactions, useDeleteTransaction } from '@/hooks/transaction-hooks.ts'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import type { DisplayTransaction } from '@/components/transaction/types'

const { t } = useI18n()
const { user } = useMe()
const { statisticDate } = useStatisticDateStore()
const { transactions, loading, error, refetch } = useMonthlyTransactions()
const { deleteTransaction } = useDeleteTransaction()

const editing = ref<DisplayTransaction | null>(null)
const dialogOpen = computed({
  get: () => editing.value !== null,
  set: (open: boolean) => {
    if (!open) editing.value = null
  },
})

const handleEdit = (id: string) => {
  editing.value = transactions.value.find((tx) => tx.id === id) ?? null
}

const handleDelete = async (id: string) => {
  try {
    await deleteTransaction({ transactionId: Number(id) })
    toast.success(t('transaction.form.messages.delete_success'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const code = e?.cause?.extensions?.originalError?.errorCodes?.form
    toast.error(code ? t(`transaction.form.errors.${code}`) : t('common_errors.server_error'))
  }
}
</script>

<template>
  <TransactionsView
    v-model:month="statisticDate"
    :transactions="transactions"
    :loading="loading"
    :error="error"
    :month-start-day="user?.monthStartDay ?? 1"
    :monthly-budget="user?.monthlyBudget ?? 0"
    :currency="user?.currency ?? ''"
    @edit="handleEdit"
    @delete="handleDelete"
    @retry="refetch"
  />

  <AddTransactionForm />

  <Dialog v-model:open="dialogOpen">
    <DialogContent>
      <EditTransactionForm v-if="editing" :transaction="editing" @close-form="editing = null" />
    </DialogContent>
  </Dialog>
</template>
