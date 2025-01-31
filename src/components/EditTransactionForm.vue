<script setup lang="ts">
import { ref, watch } from 'vue'

import { useMe } from '@/hooks/auth-hooks.ts'
import { CURRENCIES } from '@/constants/currencies.ts'

import KitMoneyInput from '@/components/kit/KitMoneyInput.vue'
import KitInput from '@/components/kit/KitInput.vue'
import KitButton from '@/components/kit/KitButton.vue'
import KitDatePicker from '@/components/kit/KitDatePicker.vue'
import KitCategories from '@/components/kit/KitCategories.vue'

import { useUpdateTransaction } from '@/hooks/transaction-hooks.ts'
import { nowDateUTC } from '@/helpers/time.ts'
import type { TransactionsQuery } from '@/graphql/types.ts'

type BaseTransaction = TransactionsQuery['transactions'][number]

interface ExtendedTransaction extends BaseTransaction {
  originalAmount?: number
  originalCurrency?: string
}
const emit = defineEmits(['closeForm'])
const { transaction } = defineProps<{
  transaction: ExtendedTransaction
}>()

const { me } = useMe()

const formRef = ref<HTMLElement | null>(null)
const transactionValue = ref(String(transaction?.originalAmount || transaction.amount))
const currency = ref(
  transaction?.originalCurrency || transaction.currency || me.value?.me.currency || CURRENCIES[0],
)
const category = ref<string>(transaction?.categoryId || '')
const date = ref<Date>(new Date(transaction.date))
const transactionTitle = ref(transaction?.description || '')

watch(
  () => transaction,
  (newTransaction) => {
    transactionValue.value = String(newTransaction?.originalAmount || newTransaction.amount)
    currency.value =
      newTransaction?.originalCurrency ||
      newTransaction.currency ||
      me.value?.me.currency ||
      CURRENCIES[0]
    category.value = newTransaction?.categoryId || ''
    date.value = new Date(newTransaction.date)
    transactionTitle.value = newTransaction?.description || ''
  },
)

const { updateTransaction } = useUpdateTransaction()

const handlerUpdateTransaction = async () => {
  if (!transactionValue.value || !transactionTitle.value || !category.value) {
    return
  }

  await updateTransaction({
    transactionData: {
      amount: parseFloat(transactionValue.value),
      currency: currency.value,
      description: transactionTitle.value,
      categoryId: category.value,
      date: date.value.toISOString(),
    },
    transactionId: Number(transaction.id),
  })

  transactionValue.value = ''
  transactionTitle.value = ''
  category.value = ''
  date.value = nowDateUTC()
  currency.value = me.value?.me.currency || CURRENCIES[0]
  emit('closeForm')
}

const handleCloseForm = () => {
  category.value = ''
  date.value = nowDateUTC()
  emit('closeForm')
}
</script>

<template>
  <div class="edit-transaction-form" ref="formRef">
    <kit-money-input
      v-model="transactionValue"
      v-model:currency="currency"
      :placeholder="$t('transaction.form.fields.amount.placeholder') + ': 0.00'"
    />
    <kit-input
      v-model="transactionTitle"
      type="text"
      :placeholder="$t('transaction.form.fields.description.placeholder')"
    />
    <div class="form-fields-row">
      <kit-date-picker v-model="date" full-width @click.stop />
      <kit-categories v-model="category" @click.stop />
    </div>
    <div class="form-buttons-row">
      <kit-button size="lg" @click="handlerUpdateTransaction">{{
        $t('transaction.form.buttons.update')
      }}</kit-button>
      <kit-button size="lg" variant="secondary-gray" @click="handleCloseForm">{{
        $t('transaction.form.buttons.cancel')
      }}</kit-button>
    </div>
  </div>
</template>

<style scoped>
.edit-transaction-form {
  width: 100%;
  padding: var(--spacing-3xl);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);

  background-color: var(--bg-primary);
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-xl);
}

.form-fields-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
}

.form-buttons-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
}
@media screen and (min-width: 768px) {
  .form-fields-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
