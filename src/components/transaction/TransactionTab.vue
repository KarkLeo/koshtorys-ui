<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vue-sonner'

import TransactionsView from '@/components/transaction/TransactionsView.vue'
import TransactionFormDrawer from '@/components/transaction/TransactionFormDrawer.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMe } from '@/hooks/auth-hooks.ts'
import { useMonthlyTransactions, useDeleteTransaction } from '@/hooks/transaction-hooks.ts'
import { mapApiErrorCodes } from '@/helpers/api-errors'
import { useStatisticDateStore } from '@/stores/statisticDateStore.ts'
import type { DisplayTransaction } from '@/components/transaction/types'

const { t } = useI18n()
const { user } = useMe()
const { statisticDate } = useStatisticDateStore()
const { transactions, loading, error, refetch } = useMonthlyTransactions()
const { deleteTransaction, loading: deleteLoading } = useDeleteTransaction()

const editing = ref<DisplayTransaction | null>(null)
const editOpen = computed({
  get: () => editing.value !== null,
  set: (open: boolean) => {
    if (!open) editing.value = null
  },
})

// Удаление через подтверждение. Важно: `deletingId` держим ОТДЕЛЬНО от `confirmOpen`.
// AlertDialogAction (reka DialogClose) по клику синхронно закрывает диалог (onOpenChange(false))
// ДО пользовательского @click — если бы id хранился в open-состоянии, к моменту confirmDelete
// он был бы уже сброшен. Отдельный ref переживает закрытие; чистим его только сами.
const deletingId = ref<string | null>(null)
const confirmOpen = ref(false)

const handleEdit = (id: string) => {
  editing.value = transactions.value.find((tx) => tx.id === id) ?? null
}

const handleDelete = (id: string) => {
  deletingId.value = id
  confirmOpen.value = true
}

const confirmDelete = async () => {
  const id = deletingId.value
  if (id === null) return
  try {
    await deleteTransaction(Number(id))
    toast.success(t('transaction.form.messages.delete_success'))
  } catch (e) {
    const codes = mapApiErrorCodes(e)
    toast.error(
      codes.form ? t(`transaction.form.errors.${codes.form}`) : t('common_errors.server_error'),
    )
  } finally {
    deletingId.value = null
    confirmOpen.value = false
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

  <TransactionFormDrawer
    v-model:open="editOpen"
    mode="edit"
    :transaction="editing ?? undefined"
  />

  <AlertDialog v-model:open="confirmOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ t('transaction.delete_confirm.title') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ t('transaction.delete_confirm.description') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="deleteLoading">
          {{ t('transaction.delete_confirm.cancel') }}
        </AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-white hover:bg-destructive/90"
          :disabled="deleteLoading"
          @click="confirmDelete"
        >
          {{ t('transaction.delete_confirm.confirm') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
